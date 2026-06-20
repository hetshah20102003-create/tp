"""Helper for writing tamper-evident audit log entries."""

from __future__ import annotations

from sqlalchemy.orm import Session

from .models import AuditLog, User


def record(
    db: Session,
    user: User | None,
    action: str,
    entity: str,
    entity_id: str | int | None = None,
    detail: str | None = None,
) -> None:
    """Append an audit entry. Caller is responsible for committing."""
    db.add(
        AuditLog(
            user_id=user.id if user else None,
            username=user.username if user else None,
            action=action,
            entity=entity,
            entity_id=str(entity_id) if entity_id is not None else None,
            detail=detail,
        )
    )
