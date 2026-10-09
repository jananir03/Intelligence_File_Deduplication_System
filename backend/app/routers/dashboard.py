from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import (
    get_current_user,
    get_db,
)
from app.models.user import User
from app.schemas.dashboard import (
    DashboardSummaryResponse,
)
from app.services.file_management_service import (
    get_dashboard_summary,
)


router = APIRouter(
    prefix="/api/v1/dashboard",
    tags=["Dashboard"],
)


@router.get(
    "/summary",
    response_model=DashboardSummaryResponse,
)
def dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):
    """
    Return file-storage and duplicate metrics
    for the authenticated user.
    """

    return get_dashboard_summary(
        db=db,
        user=current_user,
    )