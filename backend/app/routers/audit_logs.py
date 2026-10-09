from datetime import date, datetime, time, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.models.audit_log import AuditLog
from app.models.user import User
from app.schemas.audit_log import AuditLogListResponse


router = APIRouter(
    prefix="/api/v1/audit-logs",
    tags=["Audit Logs"],
)


@router.get("", response_model=AuditLogListResponse)
def list_audit_logs(
    action: str | None = Query(default=None, max_length=100),
    entity_type: str | None = Query(default=None, max_length=100),
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if start_date and end_date and start_date > end_date:
        raise HTTPException(
            status_code=400,
            detail="start_date cannot be after end_date.",
        )

    filters = [AuditLog.user_id == current_user.id]

    if action:
        filters.append(AuditLog.action == action.strip().upper())

    if entity_type:
        filters.append(AuditLog.entity_type == entity_type.strip().upper())

    if start_date:
        filters.append(
            AuditLog.created_at >= datetime.combine(start_date, time.min)
        )

    if end_date:
        end_exclusive = datetime.combine(end_date + timedelta(days=1), time.min)
        filters.append(AuditLog.created_at < end_exclusive)

    total = db.scalar(
        select(func.count(AuditLog.id)).where(*filters)
    ) or 0

    offset = (page - 1) * page_size
    items = list(
        db.scalars(
            select(AuditLog)
            .where(*filters)
            .order_by(AuditLog.created_at.desc(), AuditLog.id.desc())
            .offset(offset)
            .limit(page_size)
        ).all()
    )

    total_pages = max(1, (total + page_size - 1) // page_size)

    return {
        "items": items,
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": total_pages,
    }
