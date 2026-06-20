"""ORM models — mirrors the conceptual data model in the design report.

HR side:      Department, Employee, Attendance, LeaveApplication, SalarySlip,
              JobPosting, Candidate, Application
Finance side: Account (chart of accounts), Invoice, Payment, Reconciliation
Platform:     User, Role, AuditLog
"""

from __future__ import annotations

import datetime as dt
import enum

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Numeric,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


def _utcnow() -> dt.datetime:
    return dt.datetime.now(dt.timezone.utc)


# --------------------------------------------------------------------------- #
# Platform: users, roles, audit
# --------------------------------------------------------------------------- #
class Role(str, enum.Enum):
    """Coarse roles for RBAC. Permissions are mapped in security.py."""

    ADMIN = "admin"
    HR_MANAGER = "hr_manager"
    ACCOUNTANT = "accountant"
    EMPLOYEE = "employee"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    role: Mapped[Role] = mapped_column(Enum(Role), default=Role.EMPLOYEE)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    employee_id: Mapped[int | None] = mapped_column(ForeignKey("employees.id"))
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, default=_utcnow)

    employee: Mapped["Employee | None"] = relationship(back_populates="user")


class AuditLog(Base):
    """Append-only record of mutating actions for compliance/audit trails."""

    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(primary_key=True)
    timestamp: Mapped[dt.datetime] = mapped_column(DateTime, default=_utcnow, index=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"))
    username: Mapped[str | None] = mapped_column(String(64))
    action: Mapped[str] = mapped_column(String(32))  # create / update / delete
    entity: Mapped[str] = mapped_column(String(64))
    entity_id: Mapped[str | None] = mapped_column(String(64))
    detail: Mapped[str | None] = mapped_column(Text)


# --------------------------------------------------------------------------- #
# HR
# --------------------------------------------------------------------------- #
class Department(Base):
    __tablename__ = "departments"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(128), unique=True)

    employees: Mapped[list["Employee"]] = relationship(back_populates="department")


class EmploymentStatus(str, enum.Enum):
    ACTIVE = "active"
    ON_LEAVE = "on_leave"
    TERMINATED = "terminated"


class Employee(Base):
    __tablename__ = "employees"

    id: Mapped[int] = mapped_column(primary_key=True)
    first_name: Mapped[str] = mapped_column(String(64))
    last_name: Mapped[str] = mapped_column(String(64))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    date_of_birth: Mapped[dt.date | None] = mapped_column(Date)
    hire_date: Mapped[dt.date] = mapped_column(Date, default=dt.date.today)
    department_id: Mapped[int | None] = mapped_column(ForeignKey("departments.id"))
    manager_id: Mapped[int | None] = mapped_column(ForeignKey("employees.id"))
    designation: Mapped[str | None] = mapped_column(String(128))
    base_salary: Mapped[float] = mapped_column(Numeric(14, 2), default=0)
    status: Mapped[EmploymentStatus] = mapped_column(
        Enum(EmploymentStatus), default=EmploymentStatus.ACTIVE
    )

    department: Mapped["Department | None"] = relationship(back_populates="employees")
    manager: Mapped["Employee | None"] = relationship(remote_side=[id])
    user: Mapped["User | None"] = relationship(back_populates="employee")
    attendance: Mapped[list["Attendance"]] = relationship(back_populates="employee")
    leaves: Mapped[list["LeaveApplication"]] = relationship(back_populates="employee")
    salary_slips: Mapped[list["SalarySlip"]] = relationship(back_populates="employee")

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"


class Attendance(Base):
    __tablename__ = "attendance"

    id: Mapped[int] = mapped_column(primary_key=True)
    employee_id: Mapped[int] = mapped_column(ForeignKey("employees.id"))
    date: Mapped[dt.date] = mapped_column(Date, default=dt.date.today)
    status: Mapped[str] = mapped_column(String(16), default="present")  # present/absent/half
    hours_worked: Mapped[float] = mapped_column(Numeric(5, 2), default=0)

    employee: Mapped["Employee"] = relationship(back_populates="attendance")


class LeaveStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class LeaveApplication(Base):
    __tablename__ = "leave_applications"

    id: Mapped[int] = mapped_column(primary_key=True)
    employee_id: Mapped[int] = mapped_column(ForeignKey("employees.id"))
    leave_type: Mapped[str] = mapped_column(String(32), default="vacation")
    start_date: Mapped[dt.date] = mapped_column(Date)
    end_date: Mapped[dt.date] = mapped_column(Date)
    reason: Mapped[str | None] = mapped_column(Text)
    status: Mapped[LeaveStatus] = mapped_column(Enum(LeaveStatus), default=LeaveStatus.PENDING)

    employee: Mapped["Employee"] = relationship(back_populates="leaves")

    @property
    def days(self) -> int:
        return (self.end_date - self.start_date).days + 1


class SalarySlip(Base):
    __tablename__ = "salary_slips"

    id: Mapped[int] = mapped_column(primary_key=True)
    employee_id: Mapped[int] = mapped_column(ForeignKey("employees.id"))
    period: Mapped[str] = mapped_column(String(7))  # YYYY-MM
    gross_pay: Mapped[float] = mapped_column(Numeric(14, 2), default=0)
    deductions: Mapped[float] = mapped_column(Numeric(14, 2), default=0)
    net_pay: Mapped[float] = mapped_column(Numeric(14, 2), default=0)
    pay_date: Mapped[dt.date] = mapped_column(Date, default=dt.date.today)
    # GL link: payroll posts to an expense account.
    expense_account_id: Mapped[int | None] = mapped_column(ForeignKey("accounts.id"))

    employee: Mapped["Employee"] = relationship(back_populates="salary_slips")


# --------------------------------------------------------------------------- #
# Recruitment
# --------------------------------------------------------------------------- #
class JobPosting(Base):
    __tablename__ = "job_postings"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(128))
    department: Mapped[str | None] = mapped_column(String(128))
    is_open: Mapped[bool] = mapped_column(Boolean, default=True)

    applications: Mapped[list["Application"]] = relationship(back_populates="job")


class Candidate(Base):
    __tablename__ = "candidates"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(128))
    email: Mapped[str] = mapped_column(String(255), index=True)
    applied_date: Mapped[dt.date] = mapped_column(Date, default=dt.date.today)

    applications: Mapped[list["Application"]] = relationship(back_populates="candidate")


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[int] = mapped_column(primary_key=True)
    candidate_id: Mapped[int] = mapped_column(ForeignKey("candidates.id"))
    job_id: Mapped[int] = mapped_column(ForeignKey("job_postings.id"))
    applied_date: Mapped[dt.date] = mapped_column(Date, default=dt.date.today)
    status: Mapped[str] = mapped_column(String(32), default="applied")  # applied/interviewed/offered/hired/rejected

    candidate: Mapped["Candidate"] = relationship(back_populates="applications")
    job: Mapped["JobPosting"] = relationship(back_populates="applications")


# --------------------------------------------------------------------------- #
# Finance
# --------------------------------------------------------------------------- #
class AccountType(str, enum.Enum):
    ASSET = "asset"
    LIABILITY = "liability"
    EQUITY = "equity"
    REVENUE = "revenue"
    EXPENSE = "expense"


class Account(Base):
    """Chart of accounts node — supports parent/child nesting."""

    __tablename__ = "accounts"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(16), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(128))
    type: Mapped[AccountType] = mapped_column(Enum(AccountType))
    parent_id: Mapped[int | None] = mapped_column(ForeignKey("accounts.id"))
    balance: Mapped[float] = mapped_column(Numeric(16, 2), default=0)

    parent: Mapped["Account | None"] = relationship(remote_side=[id])


class InvoiceStatus(str, enum.Enum):
    DRAFT = "draft"
    SENT = "sent"
    PARTIAL = "partial"
    PAID = "paid"
    OVERDUE = "overdue"


class Invoice(Base):
    __tablename__ = "invoices"

    id: Mapped[int] = mapped_column(primary_key=True)
    number: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    customer_name: Mapped[str] = mapped_column(String(128))
    invoice_date: Mapped[dt.date] = mapped_column(Date, default=dt.date.today)
    due_date: Mapped[dt.date | None] = mapped_column(Date)
    currency: Mapped[str] = mapped_column(String(3), default="INR")
    subtotal: Mapped[float] = mapped_column(Numeric(16, 2), default=0)
    tax_amount: Mapped[float] = mapped_column(Numeric(16, 2), default=0)
    total_amount: Mapped[float] = mapped_column(Numeric(16, 2), default=0)
    amount_paid: Mapped[float] = mapped_column(Numeric(16, 2), default=0)
    status: Mapped[InvoiceStatus] = mapped_column(Enum(InvoiceStatus), default=InvoiceStatus.DRAFT)
    revenue_account_id: Mapped[int | None] = mapped_column(ForeignKey("accounts.id"))

    payments: Mapped[list["Payment"]] = relationship(back_populates="invoice")

    @property
    def balance_due(self) -> float:
        return float(self.total_amount) - float(self.amount_paid)


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(primary_key=True)
    invoice_id: Mapped[int | None] = mapped_column(ForeignKey("invoices.id"))
    account_id: Mapped[int | None] = mapped_column(ForeignKey("accounts.id"))  # bank/cash
    payment_date: Mapped[dt.date] = mapped_column(Date, default=dt.date.today)
    amount: Mapped[float] = mapped_column(Numeric(16, 2))
    method: Mapped[str] = mapped_column(String(32), default="bank_transfer")
    reconciled: Mapped[bool] = mapped_column(Boolean, default=False)

    invoice: Mapped["Invoice | None"] = relationship(back_populates="payments")
