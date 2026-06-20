"""HR module endpoints: departments, employees, attendance, leave, payroll."""

from __future__ import annotations

import datetime as dt

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import audit, schemas, security
from ..database import get_db
from ..models import (
    Attendance,
    Department,
    Employee,
    EmploymentStatus,
    LeaveApplication,
    LeaveStatus,
    SalarySlip,
    User,
)

router = APIRouter(prefix="/hr", tags=["hr"])
write = security.require_write("hr")
read = security.get_current_user


# --- Departments --------------------------------------------------------- #
@router.get("/departments", response_model=list[schemas.DepartmentOut])
def list_departments(db: Session = Depends(get_db), _: User = Depends(read)):
    return db.scalars(select(Department)).all()


@router.post("/departments", response_model=schemas.DepartmentOut, status_code=201)
def create_department(
    payload: schemas.DepartmentCreate,
    db: Session = Depends(get_db),
    current: User = Depends(write),
):
    dept = Department(name=payload.name)
    db.add(dept)
    db.flush()
    audit.record(db, current, "create", "department", dept.id, payload.name)
    db.commit()
    return dept


# --- Employees ----------------------------------------------------------- #
@router.get("/employees", response_model=list[schemas.EmployeeOut])
def list_employees(db: Session = Depends(get_db), _: User = Depends(read)):
    return db.scalars(select(Employee)).all()


@router.post("/employees", response_model=schemas.EmployeeOut, status_code=201)
def create_employee(
    payload: schemas.EmployeeCreate,
    db: Session = Depends(get_db),
    current: User = Depends(write),
):
    if db.scalar(select(Employee).where(Employee.email == payload.email)):
        raise HTTPException(status_code=409, detail="Employee email already exists")
    emp = Employee(
        **payload.model_dump(exclude_none=True),
    )
    db.add(emp)
    db.flush()
    audit.record(db, current, "create", "employee", emp.id, emp.full_name)
    db.commit()
    return emp


@router.post("/employees/{employee_id}/terminate", response_model=schemas.EmployeeOut)
def terminate_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current: User = Depends(write),
):
    emp = db.get(Employee, employee_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    # Block termination while leave is still pending (data-integrity guard).
    pending = db.scalar(
        select(LeaveApplication).where(
            LeaveApplication.employee_id == employee_id,
            LeaveApplication.status == LeaveStatus.PENDING,
        )
    )
    if pending:
        raise HTTPException(
            status_code=409, detail="Resolve pending leave before terminating"
        )
    emp.status = EmploymentStatus.TERMINATED
    audit.record(db, current, "update", "employee", emp.id, "terminated")
    db.commit()
    return emp


# --- Attendance ---------------------------------------------------------- #
@router.post("/attendance", response_model=schemas.AttendanceOut, status_code=201)
def log_attendance(
    payload: schemas.AttendanceCreate,
    db: Session = Depends(get_db),
    current: User = Depends(write),
):
    if not db.get(Employee, payload.employee_id):
        raise HTTPException(status_code=404, detail="Employee not found")
    rec = Attendance(**payload.model_dump(exclude_none=True))
    db.add(rec)
    db.flush()
    audit.record(db, current, "create", "attendance", rec.id)
    db.commit()
    return rec


# --- Leave --------------------------------------------------------------- #
@router.get("/leaves", response_model=list[schemas.LeaveOut])
def list_leaves(db: Session = Depends(get_db), _: User = Depends(read)):
    return db.scalars(select(LeaveApplication)).all()


@router.post("/leaves", response_model=schemas.LeaveOut, status_code=201)
def apply_leave(
    payload: schemas.LeaveCreate,
    db: Session = Depends(get_db),
    current: User = Depends(read),  # any employee may apply
):
    if not db.get(Employee, payload.employee_id):
        raise HTTPException(status_code=404, detail="Employee not found")
    if payload.end_date < payload.start_date:
        raise HTTPException(status_code=422, detail="end_date precedes start_date")
    leave = LeaveApplication(**payload.model_dump(exclude_none=True))
    db.add(leave)
    db.flush()
    audit.record(db, current, "create", "leave", leave.id)
    db.commit()
    return leave


@router.post("/leaves/{leave_id}/decision", response_model=schemas.LeaveOut)
def decide_leave(
    leave_id: int,
    payload: schemas.LeaveDecision,
    db: Session = Depends(get_db),
    current: User = Depends(write),
):
    leave = db.get(LeaveApplication, leave_id)
    if not leave:
        raise HTTPException(status_code=404, detail="Leave not found")
    leave.status = payload.status
    audit.record(db, current, "update", "leave", leave.id, payload.status.value)
    db.commit()
    return leave


# --- Payroll ------------------------------------------------------------- #
@router.post("/payroll/run", response_model=list[schemas.SalarySlipOut])
def run_payroll(
    payload: schemas.PayrollRun,
    db: Session = Depends(get_db),
    current: User = Depends(write),
):
    """Generate salary slips for all active employees for a period.

    A deliberately simple engine: gross = base_salary, deductions = gross *
    tax_rate, net = gross - deductions. Idempotent per (employee, period).
    """
    employees = db.scalars(
        select(Employee).where(Employee.status == EmploymentStatus.ACTIVE)
    ).all()
    slips: list[SalarySlip] = []
    for emp in employees:
        exists = db.scalar(
            select(SalarySlip).where(
                SalarySlip.employee_id == emp.id, SalarySlip.period == payload.period
            )
        )
        if exists:
            slips.append(exists)
            continue
        gross = float(emp.base_salary or 0)
        deductions = round(gross * payload.tax_rate, 2)
        slip = SalarySlip(
            employee_id=emp.id,
            period=payload.period,
            gross_pay=gross,
            deductions=deductions,
            net_pay=round(gross - deductions, 2),
            pay_date=dt.date.today(),
        )
        db.add(slip)
        slips.append(slip)
    db.flush()
    audit.record(db, current, "create", "payroll", payload.period, f"{len(slips)} slips")
    db.commit()
    return slips
