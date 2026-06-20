# Unified Business Suite

A runnable foundation for the HR + Finance business suite described in the design
report. Built with **FastAPI + SQLAlchemy + SQLite** so it runs with zero external
services. It implements the core of the design: the data model, RBAC + JWT auth,
audit logging, HR and Finance modules, a reporting/KPI layer, and a dashboard.

## What's implemented

| Area | Endpoints / features |
|------|----------------------|
| **Auth & RBAC** | JWT login, `/auth/me`, user creation (admin only); per-module write permissions (HR / Finance / Admin) |
| **HR** | Departments, employees, termination guard, attendance, leave apply/approve, payroll run (idempotent per period, posts net pay) |
| **Finance** | Chart of accounts (nestable), invoicing with auto-numbering + tax, payments with overpayment guard + GL posting, reconciliation |
| **Reporting** | `/reports/kpis` (headcount, payroll cost, invoiced, outstanding AR, asset balance), headcount by department |
| **Audit** | Append-only `AuditLog` of every mutating action |
| **UI** | Single-page KPI dashboard at `/` |

The data model mirrors the ER diagram in the design report (Employee, Attendance,
LeaveApplication, SalarySlip, Candidate/Application, Account, Invoice, Payment,
AuditLog, etc.).

## Quick start

```bash
pip install -r business_suite/requirements.txt
python -m business_suite.seed          # create DB + demo data
uvicorn business_suite.main:app --reload
```

Then open:
- http://localhost:8000/ — KPI dashboard
- http://localhost:8000/docs — interactive API docs

Demo logins (seeded): `admin/admin123`, `hr/hr123`, `accountant/acct123`.

## Tests

```bash
python -m pytest tests/test_business_suite.py -q
```

Covers auth, RBAC enforcement, the payroll flow (incl. idempotency), leave
approval, the invoice→payment→GL flow (incl. overpayment rejection), and KPIs.

## Configuration

Environment variables (all optional):

| Var | Default | Purpose |
|-----|---------|---------|
| `BS_DATABASE_URL` | `sqlite:///…/business_suite.db` | SQLAlchemy URL (swap for Postgres in prod) |
| `BS_SECRET_KEY` | dev key | JWT signing key — **set in production** |
| `BS_TOKEN_EXPIRE_MINUTES` | `480` | Access-token lifetime |
| `BS_BASE_CURRENCY` | `INR` | Functional currency |

## Scope & next steps

This is phase 1–2 of the roadmap (core HR + Finance). Not yet built: recruitment
UI, performance management, multi-currency FX, bank-feed/SSO integrations, and the
data-warehouse analytics layer — these are the later roadmap phases.
