"""Finance module endpoints: chart of accounts, invoices, payments."""

from __future__ import annotations

import datetime as dt

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .. import audit, schemas, security
from ..database import get_db
from ..models import Account, Invoice, InvoiceStatus, Payment, User

router = APIRouter(prefix="/finance", tags=["finance"])
write = security.require_write("finance")
read = security.get_current_user


# --- Chart of accounts --------------------------------------------------- #
@router.get("/accounts", response_model=list[schemas.AccountOut])
def list_accounts(db: Session = Depends(get_db), _: User = Depends(read)):
    return db.scalars(select(Account).order_by(Account.code)).all()


@router.post("/accounts", response_model=schemas.AccountOut, status_code=201)
def create_account(
    payload: schemas.AccountCreate,
    db: Session = Depends(get_db),
    current: User = Depends(write),
):
    if db.scalar(select(Account).where(Account.code == payload.code)):
        raise HTTPException(status_code=409, detail="Account code already exists")
    acct = Account(**payload.model_dump())
    db.add(acct)
    db.flush()
    audit.record(db, current, "create", "account", acct.id, acct.code)
    db.commit()
    return acct


# --- Invoices ------------------------------------------------------------ #
def _next_invoice_number(db: Session) -> str:
    count = db.scalar(select(func.count(Invoice.id))) or 0
    return f"INV-{dt.date.today().year}-{count + 1:05d}"


@router.get("/invoices", response_model=list[schemas.InvoiceOut])
def list_invoices(db: Session = Depends(get_db), _: User = Depends(read)):
    return db.scalars(select(Invoice).order_by(Invoice.id.desc())).all()


@router.post("/invoices", response_model=schemas.InvoiceOut, status_code=201)
def create_invoice(
    payload: schemas.InvoiceCreate,
    db: Session = Depends(get_db),
    current: User = Depends(write),
):
    total = round(payload.subtotal + payload.tax_amount, 2)
    inv = Invoice(
        number=_next_invoice_number(db),
        customer_name=payload.customer_name,
        invoice_date=payload.invoice_date or dt.date.today(),
        due_date=payload.due_date,
        currency=payload.currency,
        subtotal=payload.subtotal,
        tax_amount=payload.tax_amount,
        total_amount=total,
        status=InvoiceStatus.SENT,
        revenue_account_id=payload.revenue_account_id,
    )
    db.add(inv)
    db.flush()
    # Post revenue to the GL.
    if inv.revenue_account_id:
        acct = db.get(Account, inv.revenue_account_id)
        if acct:
            acct.balance = float(acct.balance) + float(inv.subtotal)
    audit.record(db, current, "create", "invoice", inv.id, inv.number)
    db.commit()
    return inv


# --- Payments ------------------------------------------------------------ #
@router.post("/payments", response_model=schemas.PaymentOut, status_code=201)
def record_payment(
    payload: schemas.PaymentCreate,
    db: Session = Depends(get_db),
    current: User = Depends(write),
):
    inv = db.get(Invoice, payload.invoice_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")
    if payload.amount <= 0:
        raise HTTPException(status_code=422, detail="Amount must be positive")
    if payload.amount > inv.balance_due + 1e-6:
        raise HTTPException(status_code=422, detail="Amount exceeds balance due")

    pay = Payment(
        invoice_id=inv.id,
        account_id=payload.account_id,
        amount=payload.amount,
        method=payload.method,
        payment_date=payload.payment_date or dt.date.today(),
    )
    db.add(pay)
    inv.amount_paid = round(float(inv.amount_paid) + payload.amount, 2)
    inv.status = (
        InvoiceStatus.PAID if inv.balance_due <= 1e-6 else InvoiceStatus.PARTIAL
    )
    # Debit the receiving bank/cash account.
    if payload.account_id:
        acct = db.get(Account, payload.account_id)
        if acct:
            acct.balance = float(acct.balance) + float(payload.amount)
    db.flush()
    audit.record(db, current, "create", "payment", pay.id, f"invoice {inv.number}")
    db.commit()
    return pay


@router.post("/payments/{payment_id}/reconcile", response_model=schemas.PaymentOut)
def reconcile_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current: User = Depends(write),
):
    pay = db.get(Payment, payment_id)
    if not pay:
        raise HTTPException(status_code=404, detail="Payment not found")
    pay.reconciled = True
    audit.record(db, current, "update", "payment", pay.id, "reconciled")
    db.commit()
    return pay
