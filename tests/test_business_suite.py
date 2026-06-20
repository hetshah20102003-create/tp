"""End-to-end API tests for the business suite using an isolated SQLite DB."""

import os
import tempfile

import pytest

# Point the suite at a throwaway database before importing app modules.
_TMP = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
os.environ["BS_DATABASE_URL"] = f"sqlite:///{_TMP.name}"

from fastapi.testclient import TestClient  # noqa: E402

from business_suite import seed  # noqa: E402
from business_suite.main import app  # noqa: E402


@pytest.fixture(scope="module")
def client():
    seed.seed()
    with TestClient(app) as c:
        yield c
    os.unlink(_TMP.name)


def _token(client, username, password):
    res = client.post("/auth/token", data={"username": username, "password": password})
    assert res.status_code == 200, res.text
    return res.json()["access_token"]


def _auth(token):
    return {"Authorization": f"Bearer {token}"}


def test_login_and_me(client):
    token = _token(client, "admin", "admin123")
    me = client.get("/auth/me", headers=_auth(token))
    assert me.json()["role"] == "admin"


def test_bad_login(client):
    res = client.post("/auth/token", data={"username": "admin", "password": "wrong"})
    assert res.status_code == 401


def test_rbac_accountant_cannot_write_hr(client):
    token = _token(client, "accountant", "acct123")
    res = client.post(
        "/hr/departments", json={"name": "Sales"}, headers=_auth(token)
    )
    assert res.status_code == 403


def test_hr_employee_and_payroll_flow(client):
    token = _token(client, "hr", "hr123")
    emp = client.post(
        "/hr/employees",
        json={
            "first_name": "Test",
            "last_name": "User",
            "email": "test.user@example.com",
            "base_salary": 100000,
        },
        headers=_auth(token),
    )
    assert emp.status_code == 201, emp.text

    run = client.post(
        "/hr/payroll/run", json={"period": "2026-06", "tax_rate": 0.1}, headers=_auth(token)
    )
    assert run.status_code == 200
    slips = run.json()
    assert any(s["net_pay"] == 90000.0 for s in slips)

    # Idempotent: re-running the same period adds no new slips.
    run2 = client.post(
        "/hr/payroll/run", json={"period": "2026-06", "tax_rate": 0.1}, headers=_auth(token)
    )
    assert len(run2.json()) == len(slips)


def test_leave_apply_and_decide(client):
    token = _token(client, "hr", "hr123")
    emps = client.get("/hr/employees", headers=_auth(token)).json()
    emp_id = emps[0]["id"]
    leave = client.post(
        "/hr/leaves",
        json={
            "employee_id": emp_id,
            "start_date": "2026-07-01",
            "end_date": "2026-07-03",
        },
        headers=_auth(token),
    )
    assert leave.status_code == 201
    leave_id = leave.json()["id"]
    decided = client.post(
        f"/hr/leaves/{leave_id}/decision",
        json={"status": "approved"},
        headers=_auth(token),
    )
    assert decided.json()["status"] == "approved"


def test_invoice_payment_flow_and_gl(client):
    token = _token(client, "accountant", "acct123")
    accounts = client.get("/finance/accounts", headers=_auth(token)).json()
    revenue = next(a for a in accounts if a["code"] == "4000")
    bank = next(a for a in accounts if a["code"] == "1100")

    inv = client.post(
        "/finance/invoices",
        json={
            "customer_name": "Acme Corp",
            "subtotal": 1000,
            "tax_amount": 180,
            "revenue_account_id": revenue["id"],
        },
        headers=_auth(token),
    )
    assert inv.status_code == 201, inv.text
    invoice = inv.json()
    assert invoice["total_amount"] == 1180.0
    assert invoice["status"] == "sent"

    # Overpayment rejected.
    over = client.post(
        "/finance/payments",
        json={"invoice_id": invoice["id"], "amount": 5000, "account_id": bank["id"]},
        headers=_auth(token),
    )
    assert over.status_code == 422

    pay = client.post(
        "/finance/payments",
        json={"invoice_id": invoice["id"], "amount": 1180, "account_id": bank["id"]},
        headers=_auth(token),
    )
    assert pay.status_code == 201

    invoices = client.get("/finance/invoices", headers=_auth(token)).json()
    settled = next(i for i in invoices if i["id"] == invoice["id"])
    assert settled["status"] == "paid"


def test_kpis(client):
    token = _token(client, "admin", "admin123")
    res = client.get("/reports/kpis", headers=_auth(token))
    assert res.status_code == 200
    data = res.json()
    assert data["active_headcount"] >= 1
    assert "outstanding_receivables" in data
