"""Authentication, password hashing, JWT, and RBAC enforcement."""

from __future__ import annotations

import datetime as dt

import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.orm import Session

from . import config
from .database import get_db
from .models import Role, User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

# Permission matrix: which roles may perform write actions in each module.
# Reads are allowed for any authenticated user; writes are gated below.
_WRITE_PERMISSIONS: dict[str, set[Role]] = {
    "hr": {Role.ADMIN, Role.HR_MANAGER},
    "finance": {Role.ADMIN, Role.ACCOUNTANT},
    "admin": {Role.ADMIN},
}


def hash_password(password: str) -> str:
    # bcrypt operates on the first 72 bytes; encode explicitly.
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except ValueError:
        return False


def create_access_token(subject: str, role: Role) -> str:
    expire = dt.datetime.now(dt.timezone.utc) + dt.timedelta(
        minutes=config.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload = {"sub": subject, "role": role.value, "exp": expire}
    return jwt.encode(payload, config.SECRET_KEY, algorithm=config.ALGORITHM)


def authenticate(db: Session, username: str, password: str) -> User | None:
    user = db.scalar(select(User).where(User.username == username))
    if user and user.is_active and verify_password(password, user.hashed_password):
        return user
    return None


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> User:
    credentials_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, config.SECRET_KEY, algorithms=[config.ALGORITHM])
        username = payload.get("sub")
    except JWTError:
        raise credentials_exc
    if not username:
        raise credentials_exc
    user = db.scalar(select(User).where(User.username == username))
    if not user or not user.is_active:
        raise credentials_exc
    return user


def require_write(module: str):
    """Dependency factory enforcing write permission for a module."""
    allowed = _WRITE_PERMISSIONS[module]

    def _dep(user: User = Depends(get_current_user)) -> User:
        if user.role not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{user.role.value}' cannot modify {module} data",
            )
        return user

    return _dep
