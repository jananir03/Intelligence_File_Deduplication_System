from pathlib import Path

from fastapi import (
    APIRouter,
    Depends,
    File as FastAPIFile,
    HTTPException,
    Query,
    Request,
    UploadFile,
    status,
)
from fastapi.responses import FileResponse as FastAPIFileResponse
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.dependencies import get_current_active_user
from app.db.database import get_db
from app.models.audit_log import AuditLog
from app.models.file import File
from app.models.user import User
from app.schemas.file import (
    FileListResponse,
    FileResponse,
    FileUploadResponse,
)
from app.services.file_service import (
    create_file_record,
    get_file_by_id,
    get_file_count,
    get_user_files,
)
from app.services.file_storage import (
    FileStorage,
    FileStorageError,
)
from app.tasks.file_hash_tasks import (
    process_file_hash,
)


router = APIRouter(
    prefix="/api/v1/files",
    tags=["Files"],
)


storage = FileStorage(
    settings.upload_dir
)


def _sanitize_original_filename(
    filename: str | None,
) -> str:
    """
    Safely normalize the client-provided filename.

    The original filename is metadata only and is never
    used directly as a filesystem path.
    """

    if not filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A filename is required.",
        )

    filename = Path(filename).name.strip()

    if not filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid filename.",
        )

    if len(filename) > settings.max_filename_length:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Filename cannot exceed "
                f"{settings.max_filename_length} characters."
            ),
        )

    return filename


def _get_file_extension(
    filename: str,
) -> str | None:
    """
    Return a normalized file extension.
    """

    extension = Path(filename).suffix.lower()

    if not extension:
        return None

    return extension.lstrip(".")


async def _save_upload(
    upload_file: UploadFile,
    destination: Path,
    max_size_bytes: int,
) -> int:
    """
    Stream an uploaded file to disk in chunks.

    Returns the total number of bytes written.
    """

    total_size = 0

    chunk_size = (
        settings.upload_chunk_size_kb
        * 1024
    )

    try:
        with destination.open("wb") as output_file:
            while True:
                chunk = await upload_file.read(
                    chunk_size
                )

                if not chunk:
                    break

                total_size += len(chunk)

                if total_size > max_size_bytes:
                    raise HTTPException(
                        status_code=(
                            status.HTTP_413_REQUEST_ENTITY_TOO_LARGE
                        ),
                        detail=(
                            "File exceeds the maximum "
                            "allowed size of "
                            f"{settings.max_file_size_mb} MB."
                        ),
                    )

                output_file.write(chunk)

    except HTTPException:
        if destination.exists():
            destination.unlink()

        raise

    except OSError as exc:
        if destination.exists():
            destination.unlink()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to store uploaded file.",
        ) from exc

    finally:
        await upload_file.close()

    return total_size


@router.post(
    "/upload",
    response_model=FileUploadResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Upload a file",
)
async def upload_file(
    request: Request,
    uploaded_file: UploadFile = FastAPIFile(...),
    current_user: User = Depends(
        get_current_active_user
    ),
    db: Session = Depends(get_db),
) -> FileUploadResponse:
    """
    Upload a file and store its metadata.

    SHA-256 hashing and duplicate detection are
    performed asynchronously by Celery.
    """

    original_filename = _sanitize_original_filename(
        uploaded_file.filename
    )

    mime_type = (
        uploaded_file.content_type.strip()
        if uploaded_file.content_type
        else None
    )

    file_extension = _get_file_extension(
        original_filename
    )

    stored_filename = (
        storage.generate_stored_filename(
            original_filename
        )
    )

    try:
        destination = storage.create_file_path(
            stored_filename
        )

    except FileStorageError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to prepare file storage.",
        ) from exc

    max_size_bytes = (
        settings.max_file_size_mb
        * 1024
        * 1024
    )

    try:
        # --------------------------------------------------------------
        # Save physical file
        # --------------------------------------------------------------

        file_size = await _save_upload(
            upload_file=uploaded_file,
            destination=destination,
            max_size_bytes=max_size_bytes,
        )

        relative_file_path = (
            Path(settings.upload_dir)
            / stored_filename
        )

        # --------------------------------------------------------------
        # Create database record
        # --------------------------------------------------------------

        file_record = create_file_record(
            db=db,
            user=current_user,
            original_filename=original_filename,
            stored_filename=stored_filename,
            file_path=str(relative_file_path),
            mime_type=mime_type,
            file_extension=file_extension,
            file_size=file_size,
        )

        audit_log = AuditLog(
            user_id=current_user.id,
            action="UPLOAD",
            entity_type="FILE",
            entity_id=file_record.id,
            description=(
                f"File '{original_filename}' uploaded "
                "successfully."
            ),
            ip_address=(
                request.client.host
                if request.client
                else None
            ),
        )

        db.add(audit_log)

        # Commit before sending the Celery task.
        # The worker must be able to see the file record.
        db.commit()

        db.refresh(file_record)

    except IntegrityError as exc:
        db.rollback()

        if destination.exists():
            destination.unlink()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Unable to create the file record.",
        ) from exc

    except HTTPException:
        db.rollback()

        if destination.exists():
            destination.unlink()

        raise

    except Exception as exc:
        db.rollback()

        if destination.exists():
            destination.unlink()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="File upload failed.",
        ) from exc

    # --------------------------------------------------------------
    # Queue asynchronous hashing
    # --------------------------------------------------------------

    try:
        task_result = process_file_hash.delay(
            file_record.id
        )

    except Exception as exc:
        # The upload itself succeeded, but the background
        # task could not be queued.
        #
        # Mark the record as failed so the system does
        # not incorrectly leave it in "processing".
        db.rollback()

        failed_file = db.get(
            File,
            file_record.id,
        )

        if failed_file is not None:
            failed_file.status = "failed"

            db.add(
                AuditLog(
                    user_id=current_user.id,
                    action="HASH_QUEUE_FAILED",
                    entity_type="FILE",
                    entity_id=file_record.id,
                    description=(
                        "File was uploaded but the "
                        "hashing task could not be queued."
                    ),
                    ip_address=(
                        request.client.host
                        if request.client
                        else None
                    ),
                )
            )

            db.commit()

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "File uploaded successfully, but background "
                "hash processing could not be queued. "
                "Please retry processing later."
            ),
        ) from exc

    return FileUploadResponse(
        id=file_record.id,
        original_filename=file_record.original_filename,
        mime_type=file_record.mime_type,
        file_extension=file_record.file_extension,
        file_size=file_record.file_size,
        status=file_record.status,
        is_protected=file_record.is_protected,
        uploaded_at=file_record.uploaded_at,
        updated_at=file_record.updated_at,
        message=(
            "File uploaded successfully. "
            "SHA-256 hashing and duplicate detection "
            "are being processed asynchronously."
        ),
    )


@router.get(
    "",
    response_model=FileListResponse,
    summary="List uploaded files",
)
def list_files(
    search: str | None = Query(
        default=None,
        min_length=1,
        max_length=255,
    ),
    skip: int = Query(
        default=0,
        ge=0,
    ),
    limit: int = Query(
        default=20,
        ge=1,
        le=100,
    ),
    current_user: User = Depends(
        get_current_active_user
    ),
    db: Session = Depends(get_db),
) -> FileListResponse:
    """
    Return paginated files belonging to the current user.
    """

    total = get_file_count(
        db=db,
        user_id=current_user.id,
        search=search,
    )

    files = get_user_files(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        search=search,
    )

    return FileListResponse(
        items=files,
        total=total,
        skip=skip,
        limit=limit,
    )


@router.get(
    "/{file_id}",
    response_model=FileResponse,
    summary="Get file details",
)
def get_file_details(
    file_id: int,
    current_user: User = Depends(
        get_current_active_user
    ),
    db: Session = Depends(get_db),
) -> File:
    """
    Return details of a file owned by the current user.
    """

    file_record = get_file_by_id(
        db=db,
        file_id=file_id,
        user_id=current_user.id,
    )

    if file_record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found.",
        )

    return file_record


@router.get(
    "/{file_id}/download",
    summary="Download a file",
)
def download_file(
    file_id: int,
    request: Request,
    current_user: User = Depends(
        get_current_active_user
    ),
    db: Session = Depends(get_db),
):
    """
    Download a file owned by the current user.
    """

    file_record = get_file_by_id(
        db=db,
        file_id=file_id,
        user_id=current_user.id,
    )

    if file_record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found.",
        )

    file_path = Path(
        file_record.file_path
    ).resolve()

    upload_root = Path(
        settings.upload_dir
    ).resolve()

    if upload_root not in file_path.parents:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Invalid file storage path.",
        )

    if not file_path.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                "Physical file is no longer available."
            ),
        )

    audit_log = AuditLog(
        user_id=current_user.id,
        action="DOWNLOAD",
        entity_type="FILE",
        entity_id=file_record.id,
        description=(
            f"File '{file_record.original_filename}' "
            "downloaded."
        ),
        ip_address=(
            request.client.host
            if request.client
            else None
        ),
    )

    db.add(audit_log)
    db.commit()

    return FastAPIFileResponse(
        path=file_path,
        filename=file_record.original_filename,
        media_type=(
            file_record.mime_type
            or "application/octet-stream"
        ),
    )