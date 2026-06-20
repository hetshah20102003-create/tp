"""Pydantic request/response schemas."""

from __future__ import annotations

import datetime as dt

from pydantic import BaseModel, ConfigDict, EmailStr

from .models import AccountType, EmploymentStatus, InvoiceStatus, LeaveStatus, Role


class _ORM(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# --- Auth ---------------------------------------------------------------- #
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: Role


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: Role = Role.EMPLOYEE
    employee_id: int | None = None


class UserOut(_ORM):
    id: int
    username: str
    email: EmailStr
    role: Role
    is_active: bool


# --- HR ------------------------------------------------------------------ #
class DepartmentCreate(BaseModel):
    name: str


class DepartmentOut(_ORM):
    id: int
    name: str


class EmployeeCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    date_of_birth: dt.date | None = None
    hire_date: dt.date | None = None
    department_id: int | None = None
    manager_id: int | None = None
    designation: str | None = None
    base_salary: float = 0


class EmployeeOut(_ORM):
    id: int
    first_name: str
    last_name: str
    email: EmailStr
    department_id: int | None
    designation: str | None
    base_salary: float
    status: EmploymentStatus


class AttendanceCreate(BaseModel):
    employee_id: int
    date: dt.date | None = None
    status: str = "present"
    hours_worked: float = 8


class AttendanceOut(_ORM):
    id: int
    employee_id: int
    date: dt.date
    status: str
    hours_worked: float


class LeaveCreate(BaseModel):
    employee_id: int
    leave_type: str = "vacation"
    start_date: dt.date
    end_date: dt.date
    reason: str | None = None


class LeaveOut(_ORM):
    id: int
    employee_id: int
    leave_type: str
    start_date: dt.date
    end_date: dt.date
    status: LeaveStatus


class LeaveDecision(BaseModel):
    status: LeaveStatus


class SalarySlipOut(_ORM):
    id: int
    employee_id: int
    period: str
    gross_pay: float
    deductions: float
    net_pay: float
    pay_date: dt.date


class PayrollRun(BaseModel):
    period: str  # YYYY-MM
    tax_rate: float = 0.10  # flat deduction rate for the demo payroll engine


# --- Finance ------------------------------------------------------------- #
class AccountCreate(BaseModel):
    code: str
    name: str
    type: AccountType
    parent_id: int | None = None


class AccountOut(_ORM):
    id: int
    code: str
    name: str
    type: AccountType
    parent_id: int | None
    balance: float


class InvoiceCreate(BaseModel):
    customer_name: str
    invoice_date: dt.date | None = None
    due_date: dt.date | None = None
    currency: str = "INR"
    subtotal: float
    tax_amount: float = 0
    revenue_account_id: int | None = None


class InvoiceOut(_ORM):
    id: int
    number: str
    customer_name: str
    invoice_date: dt.date
    due_date: dt.date | None
    currency: str
    total_amount: float
    amount_paid: float
    status: InvoiceStatus


class PaymentCreate(BaseModel):
    invoice_id: int
    account_id: int | None = None
    amount: float
    method: str = "bank_transfer"
    payment_date: dt.date | None = None


class PaymentOut(_ORM):
    id: int
    invoice_id: int | None
    amount: float
    method: str
    reconciled: bool
    payment_date: dt.date
