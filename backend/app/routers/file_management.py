from datetime import date

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
)
from sqlalchemy.orm import Session

from app.core.dependencies import (
    get_current_user,
    get_db,
)
from app.models.user import User
from app.schemas.file_management import (
    DeleteFileRequest,
    DeleteFileResponse,
    FileManagementListResponse,
)
from app.services.file_management_service import (
    FileManagementError,
    delete_file_safely,
    search_files,
)


router = APIRouter(
    prefix="/api/v1/file-management",
    tags=["File Management"],
)


@router.get(
    "/files",
    response_model=FileManagementListResponse,
)
def search_and_filter_files(
    filename: str | None = Query(
        default=None,
        max_length=255,
    ),
    file_type: str | None = Query(
        default=None,
        max_length=100,
    ),
    min_size: int | None = Query(
        default=None,
        ge=0,
    ),
    max_size: int | None = Query(
        default=None,
        ge=0,
    ),
    duplicate: bool | None = Query(
        default=None,
    ),
    start_date: date | None = Query(
        default=None,
    ),
    end_date: date | None = Query(
        default=None,
    ),
    page: int = Query(
        default=1,
        ge=1,
    ),
    page_size: int = Query(
        default=20,
        ge=1,
        le=100,
    ),
    sort_by: str = Query(
        default="uploaded_at",
    ),
    sort_order: str = Query(
        default="desc",
        pattern="^(asc|desc)$",
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):
    """
    Search and filter the current user's files.
    """

    if (
        min_size is not None
        and max_size is not None
        and min_size > max_size
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "min_size cannot be greater than max_size."
            ),
        )

    if (
        start_date is not None
        and end_date is not None
        and start_date > end_date
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "start_date cannot be after end_date."
            ),
        )

    (
        items,
        total,
        total_pages,
    ) = search_files(
        db=db,
        user=current_user,
        filename=filename,
        file_type=file_type,
        min_size=min_size,
        max_size=max_size,
        duplicate=duplicate,
        start_date=start_date,
        end_date=end_date,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_order=sort_order,
    )

    return {
        "items": items,
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": total_pages,
    }


@router.delete(
    "/files/{file_id}",
    response_model=DeleteFileResponse,
)
def delete_file(
    file_id: int,
    request: DeleteFileRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):
    """
    Safely delete a file owned by the current user.
    """

    try:
        return delete_file_safely(
            db=db,
            user=current_user,
            file_id=file_id,
            confirm=request.confirm,
            reason=request.reason,
        )

    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        ) from exc

    except PermissionError as exc:
        raise HTTPException(
            status_code=409,
            detail=str(exc),
        ) from exc

    except FileManagementError as exc:
        raise HTTPException(
            status_code=409,
            detail=str(exc),
        ) from exc