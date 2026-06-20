"""Reporting & analytics endpoints — KPIs for the dashboard."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .. import security
from ..database import get_db
from ..models import (
    AccountType,
    Account,
    Employee,
    EmploymentStatus,
    Invoice,
    InvoiceStatus,
    LeaveApplication,
    LeaveStatus,
    SalarySlip,
    User,
)

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/kpis")
def kpis(db: Session = Depends(get_db), _: User = Depends(security.get_current_user)):
    """At-a-glance metrics for the executive dashboard."""
    headcount = db.scalar(
        select(func.count(Employee.id)).where(
            Employee.status == EmploymentStatus.ACTIVE
        )
    )
    pending_leaves = db.scalar(
        select(func.count(LeaveApplication.id)).where(
            LeaveApplication.status == LeaveStatus.PENDING
        )
    )
    payroll_cost = db.scalar(select(func.coalesce(func.sum(SalarySlip.net_pay), 0)))
    total_invoiced = db.scalar(
        select(func.coalesce(func.sum(Invoice.total_amount), 0))
    )
    outstanding = db.scalar(
        select(
            func.coalesce(func.sum(Invoice.total_amount - Invoice.amount_paid), 0)
        ).where(Invoice.status != InvoiceStatus.PAID)
    )
    cash_balance = db.scalar(
        select(func.coalesce(func.sum(Account.balance), 0)).where(
            Account.type == AccountType.ASSET
        )
    )
    return {
        "active_headcount": int(headcount or 0),
        "pending_leave_requests": int(pending_leaves or 0),
        "total_payroll_cost": float(payroll_cost or 0),
        "total_invoiced": float(total_invoiced or 0),
        "outstanding_receivables": float(outstanding or 0),
        "asset_account_balance": float(cash_balance or 0),
    }


@router.get("/headcount-by-department")
def headcount_by_department(
    db: Session = Depends(get_db), _: User = Depends(security.get_current_user)
):
    rows = db.execute(
        select(Employee.department_id, func.count(Employee.id))
        .where(Employee.status == EmploymentStatus.ACTIVE)
        .group_by(Employee.department_id)
    ).all()
    return [{"department_id": d, "count": c} for d, c in rows]
