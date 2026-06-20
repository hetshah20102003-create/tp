"""Authentication and user management endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import audit, schemas, security
from ..database import get_db
from ..models import User

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/token", response_model=schemas.Token)
def login(
    form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    user = security.authenticate(db, form.username, form.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    audit.record(db, user, "login", "user", user.id)
    db.commit()
    token = security.create_access_token(user.username, user.role)
    return schemas.Token(access_token=token, role=user.role)


@router.get("/me", response_model=schemas.UserOut)
def me(current: User = Depends(security.get_current_user)):
    return current


@router.post("/users", response_model=schemas.UserOut, status_code=201)
def create_user(
    payload: schemas.UserCreate,
    db: Session = Depends(get_db),
    current: User = Depends(security.require_write("admin")),
):
    if db.scalar(select(User).where(User.username == payload.username)):
        raise HTTPException(status_code=409, detail="Username already exists")
    user = User(
        username=payload.username,
        email=payload.email,
        hashed_password=security.hash_password(payload.password),
        role=payload.role,
        employee_id=payload.employee_id,
    )
    db.add(user)
    db.flush()
    audit.record(db, current, "create", "user", user.id, payload.username)
    db.commit()
    return user
