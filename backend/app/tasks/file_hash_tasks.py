from pathlib import Path

from celery.utils.log import get_task_logger
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.core.config import settings
from app.db.database import SessionLocal
from app.models.file import File
from app.models.file_hash import FileHash
from app.services.duplicate_service import (
    synchronize_duplicate_group,
)
from app.services.hash_service import (
    calculate_sha256,
    validate_file_size,
)
from app.tasks.celery_app import celery_app


logger = get_task_logger(__name__)


def _get_safe_file_path(
    stored_filename: str,
) -> Path:
    """
    Resolve a stored filename safely within
    the configured upload directory.
    """

    upload_root = Path(
        settings.upload_dir
    ).resolve()

    file_path = (
        upload_root / stored_filename
    ).resolve()

    if upload_root not in file_path.parents:
        raise ValueError(
            "Invalid file storage path."
        )

    return file_path


def _get_file_hash_by_value(
    db,
    sha256_hash: str,
) -> FileHash | None:
    """
    Retrieve a FileHash by its SHA-256 value.
    """

    statement = select(FileHash).where(
        FileHash.sha256_hash == sha256_hash
    )

    return db.scalar(statement)


@celery_app.task(
    bind=True,
    name="tasks.process_file_hash",
    acks_late=True,
    reject_on_worker_lost=True,
    autoretry_for=(OSError,),
    retry_backoff=True,
    retry_backoff_max=60,
    retry_jitter=True,
    max_retries=5,
)
def process_file_hash(
    self,
    file_id: int,
) -> dict[str, object]:
    """
    Calculate SHA-256 for an uploaded file and
    update duplicate detection information.

    The task is intentionally idempotent so that
    repeated execution does not create duplicate
    hash records or duplicate groups.
    """

    db = SessionLocal()

    try:
        file_record = db.scalar(
            select(File).where(
                File.id == file_id
            )
        )

        if file_record is None:
            logger.warning(
                "File %s no longer exists.",
                file_id,
            )

            return {
                "status": "skipped",
                "file_id": file_id,
                "message": "File record not found.",
            }

        # --------------------------------------------------------------
        # Idempotency
        # --------------------------------------------------------------

        if (
            file_record.status == "completed"
            and file_record.file_hash_id is not None
        ):
            existing_hash = db.scalar(
                select(FileHash).where(
                    FileHash.id
                    == file_record.file_hash_id
                )
            )

            if existing_hash is not None:
                synchronize_duplicate_group(
                    db=db,
                    file_hash=existing_hash,
                )

                db.commit()

                return {
                    "status": "already_processed",
                    "file_id": file_id,
                    "sha256_hash": (
                        existing_hash.sha256_hash
                    ),
                }

        # --------------------------------------------------------------
        # Mark processing
        # --------------------------------------------------------------

        file_record.status = "processing"
        db.commit()

        # --------------------------------------------------------------
        # Resolve physical file
        # --------------------------------------------------------------

        file_path = _get_safe_file_path(
            file_record.stored_filename
        )

        validate_file_size(
            file_path=file_path,
            expected_size=file_record.file_size,
        )

        # --------------------------------------------------------------
        # Calculate SHA-256
        # --------------------------------------------------------------

        sha256_hash = calculate_sha256(
            file_path=file_path,
            chunk_size=(
                settings.upload_chunk_size_kb
                * 1024
            ),
        )

        logger.info(
            "SHA-256 calculated for file %s: %s",
            file_id,
            sha256_hash,
        )

        # --------------------------------------------------------------
        # Get or create FileHash
        # --------------------------------------------------------------

        file_hash = _get_file_hash_by_value(
            db=db,
            sha256_hash=sha256_hash,
        )

        if file_hash is None:
            file_hash = FileHash(
                sha256_hash=sha256_hash,
                status="completed",
            )

            db.add(file_hash)

            try:
                db.flush()

            except IntegrityError:
                # Another worker may have created the
                # same hash concurrently.
                db.rollback()

                file_hash = (
                    _get_file_hash_by_value(
                        db=db,
                        sha256_hash=sha256_hash,
                    )
                )

                if file_hash is None:
                    raise

        else:
            file_hash.status = "completed"

        # --------------------------------------------------------------
        # Update file record
        # --------------------------------------------------------------

        file_record.file_hash_id = file_hash.id
        file_record.status = "completed"

        db.flush()

        # --------------------------------------------------------------
        # Synchronize duplicate group
        # --------------------------------------------------------------

        duplicate_group = (
            synchronize_duplicate_group(
                db=db,
                file_hash=file_hash,
            )
        )

        db.commit()

        duplicate_count = (
            duplicate_group.duplicate_count
            if duplicate_group is not None
            else 0
        )

        logger.info(
            (
                "File %s processed successfully. "
                "Hash=%s DuplicateCount=%s"
            ),
            file_id,
            sha256_hash,
            duplicate_count,
        )

        return {
            "status": "completed",
            "file_id": file_id,
            "sha256_hash": sha256_hash,
            "duplicate_count": duplicate_count,
        }

    except Exception as exc:
        db.rollback()

        logger.exception(
            "Hash processing failed for file %s.",
            file_id,
        )

        # Mark the file as failed only when
        # the record still exists.
        try:
            failed_file = db.scalar(
                select(File).where(
                    File.id == file_id
                )
            )

            if failed_file is not None:
                failed_file.status = "failed"
                db.commit()

        except Exception:
            db.rollback()

        raise

    finally:
        db.close()