from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.dependencies import (
    get_current_user,
    get_db,
)
from app.models.user import User
from app.schemas.duplicate_group import (
    DuplicateGroupDetailResponse,
    DuplicateGroupListResponse,
)
from app.services.file_management_service import (
    get_duplicate_group_detail,
    get_duplicate_groups,
)


router = APIRouter(
    prefix="/api/v1/duplicate-groups",
    tags=["Duplicate Groups"],
)


@router.get(
    "",
    response_model=DuplicateGroupListResponse,
)
def list_duplicate_groups(
    page: int = Query(
        default=1,
        ge=1,
    ),
    page_size: int = Query(
        default=20,
        ge=1,
        le=100,
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):
    """
    List duplicate groups belonging to files
    accessible by the current user.
    """

    (
        items,
        total,
        total_pages,
    ) = get_duplicate_groups(
        db=db,
        user=current_user,
        page=page,
        page_size=page_size,
    )

    return {
        "items": items,
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": total_pages,
    }


@router.get(
    "/{group_id}",
    response_model=DuplicateGroupDetailResponse,
)
def get_duplicate_group(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):
    """
    Return one duplicate group with its
    original and duplicate files.
    """

    result = get_duplicate_group_detail(
        db=db,
        user=current_user,
        group_id=group_id,
    )

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Duplicate group not found.",
        )

    return result