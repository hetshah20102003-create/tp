"""Seed baseline data: roles/users, a standard chart of accounts, demo records."""

from __future__ import annotations

import datetime as dt

from sqlalchemy import select
from sqlalchemy.orm import Session

from .database import SessionLocal, init_db
from .models import (
    Account,
    AccountType,
    Department,
    Employee,
    Role,
    User,
)
from .security import hash_password

# A minimal but standard chart of accounts (code, name, type).
DEFAULT_COA = [
    ("1000", "Cash", AccountType.ASSET),
    ("1100", "Bank", AccountType.ASSET),
    ("1200", "Accounts Receivable", AccountType.ASSET),
    ("2000", "Accounts Payable", AccountType.LIABILITY),
    ("2100", "Tax Payable", AccountType.LIABILITY),
    ("3000", "Owner's Equity", AccountType.EQUITY),
    ("4000", "Sales Revenue", AccountType.REVENUE),
    ("5000", "Salaries Expense", AccountType.EXPENSE),
    ("5100", "Office Expense", AccountType.EXPENSE),
]

DEFAULT_USERS = [
    ("admin", "admin@example.com", "admin123", Role.ADMIN),
    ("hr", "hr@example.com", "hr123", Role.HR_MANAGER),
    ("accountant", "acct@example.com", "acct123", Role.ACCOUNTANT),
]


def seed() -> None:
    init_db()
    db: Session = SessionLocal()
    try:
        if not db.scalar(select(User).limit(1)):
            for username, email, pwd, role in DEFAULT_USERS:
                db.add(
                    User(
                        username=username,
                        email=email,
                        hashed_password=hash_password(pwd),
                        role=role,
                    )
                )

        if not db.scalar(select(Account).limit(1)):
            for code, name, type_ in DEFAULT_COA:
                db.add(Account(code=code, name=name, type=type_))

        if not db.scalar(select(Department).limit(1)):
            eng = Department(name="Engineering")
            fin = Department(name="Finance")
            db.add_all([eng, fin])
            db.flush()
            db.add_all(
                [
                    Employee(
                        first_name="Asha",
                        last_name="Rao",
                        email="asha.rao@example.com",
                        department_id=eng.id,
                        designation="Senior Engineer",
                        base_salary=120000,
                        hire_date=dt.date(2023, 4, 1),
                    ),
                    Employee(
                        first_name="Vikram",
                        last_name="Singh",
                        email="vikram.singh@example.com",
                        department_id=fin.id,
                        designation="Accountant",
                        base_salary=90000,
                        hire_date=dt.date(2024, 1, 15),
                    ),
                ]
            )
        db.commit()
        print("Seed complete. Logins: admin/admin123, hr/hr123, accountant/acct123")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
