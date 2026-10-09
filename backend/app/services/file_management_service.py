import logging
import os
from datetime import date, datetime, time, timedelta
from pathlib import Path
from uuid import uuid4

from sqlalchemy import and_, case, func, or_, select
from sqlalchemy.orm import Session, aliased

from app.core.config import settings
from app.models.audit_log import AuditLog
from app.models.deletion_history import DeletionHistory
from app.models.duplicate_group import DuplicateGroup
from app.models.file import File
from app.models.file_hash import FileHash
from app.models.user import User


logger = logging.getLogger(__name__)


ALLOWED_SORT_FIELDS = {
    "filename": File.original_filename,
    "size": File.file_size,
    "uploaded_at": File.uploaded_at,
    "status": File.status,
    "extension": File.file_extension,
}


class FileManagementError(Exception):
    """Raised for safe file-management failures."""


def _safe_file_path(
    stored_filename: str,
) -> Path:
    """
    Resolve a stored filename safely inside upload storage.
    """

    upload_root = Path(
        settings.upload_dir
    ).resolve()

    file_path = (
        upload_root / stored_filename
    ).resolve()

    if upload_root != file_path.parent and (
        upload_root not in file_path.parents
    ):
        raise FileManagementError(
            "Invalid file storage path."
        )

    return file_path


def _dashboard_file_item(
    file_record: File,
) -> dict:
    return {
        "id": file_record.id,
        "original_filename": (
            file_record.original_filename
        ),
        "file_size": file_record.file_size,
        "mime_type": file_record.mime_type,
        "file_extension": file_record.file_extension,
        "status": file_record.status,
        "is_protected": file_record.is_protected,
        "uploaded_at": file_record.uploaded_at,
    }


def search_files(
    db: Session,
    user: User,
    *,
    filename: str | None = None,
    file_type: str | None = None,
    min_size: int | None = None,
    max_size: int | None = None,
    duplicate: bool | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    page: int = 1,
    page_size: int = 20,
    sort_by: str = "uploaded_at",
    sort_order: str = "desc",
):
    """
    Search and filter files belonging to the current user.
    """

    conditions = [
        File.user_id == user.id,
    ]

    if filename:
        conditions.append(
            File.original_filename.ilike(
                f"%{filename}%"
            )
        )

    if file_type:
        normalized_type = (
            file_type.strip().lower()
        )

        if normalized_type.startswith("."):
            normalized_type = normalized_type[1:]

        conditions.append(
            or_(
                func.lower(
                    File.file_extension
                )
                == normalized_type,
                func.lower(
                    File.mime_type
                )
                == normalized_type,
                func.lower(
                    File.mime_type
                ).like(
                    f"{normalized_type}/%"
                ),
            )
        )

    if min_size is not None:
        conditions.append(
            File.file_size >= min_size
        )

    if max_size is not None:
        conditions.append(
            File.file_size <= max_size
        )

    if start_date is not None:
        start_datetime = datetime.combine(
            start_date,
            time.min,
        )

        conditions.append(
            File.uploaded_at >= start_datetime
        )

    if end_date is not None:
        end_datetime = datetime.combine(
            end_date,
            time.max,
        )

        conditions.append(
            File.uploaded_at <= end_datetime
        )

    duplicate_exists = (
        select(DuplicateGroup.id)
        .join(
            FileHash,
            FileHash.id
            == DuplicateGroup.file_hash_id,
        )
        .where(
            DuplicateGroup.file_hash_id
            == File.file_hash_id,
            DuplicateGroup.original_file_id
            != File.id,
        )
        .correlate(File)
        .exists()
    )

    if duplicate is True:
        conditions.append(
            duplicate_exists
        )

    elif duplicate is False:
        conditions.append(
            ~duplicate_exists
        )

    total_statement = select(
        func.count(File.id)
    ).where(*conditions)

    total = db.scalar(total_statement) or 0

    sort_expression = ALLOWED_SORT_FIELDS.get(
        sort_by,
        File.uploaded_at,
    )

    if sort_order.lower() == "asc":
        order_expression = sort_expression.asc()
    else:
        order_expression = sort_expression.desc()

    offset = (page - 1) * page_size

    statement = (
        select(File)
        .where(*conditions)
        .order_by(
            order_expression,
            File.id.desc(),
        )
        .offset(offset)
        .limit(page_size)
    )

    files = list(
        db.scalars(statement).all()
    )

    # Determine duplicate status from the actual duplicate groups.
    #
    # The previous implementation treated every hashed file as a
    # duplicate unless its id appeared as an original_file_id in a
    # group present on the current page. That made normal, unique files
    # appear as duplicates. A file is a duplicate only when another file
    # with the same hash belongs to a DuplicateGroup and this file is not
    # the group's original file.
    duplicate_ids = set()

    if files:
        file_ids = [file.id for file in files]

        duplicate_statement = (
            select(File.id)
            .join(
                DuplicateGroup,
                DuplicateGroup.file_hash_id
                == File.file_hash_id,
            )
            .where(
                File.id.in_(file_ids),
                DuplicateGroup.original_file_id != File.id,
            )
        )

        duplicate_ids = set(
            db.scalars(duplicate_statement).all()
        )

    items = [
        {
            "id": file.id,
            "original_filename": (
                file.original_filename
            ),
            "stored_filename": (
                file.stored_filename
            ),
            "file_size": file.file_size,
            "mime_type": file.mime_type,
            "file_extension": (
                file.file_extension
            ),
            "file_hash_id": (
                file.file_hash_id
            ),
            "status": file.status,
            "is_protected": (
                file.is_protected
            ),
            "uploaded_at": (
                file.uploaded_at
            ),
            "is_duplicate": (
                file.id in duplicate_ids
            ),
        }
        for file in files
    ]

    total_pages = (
        (total + page_size - 1)
        // page_size
        if total
        else 0
    )

    return (
        items,
        total,
        total_pages,
    )


def get_duplicate_groups(
    db: Session,
    user: User,
    *,
    page: int = 1,
    page_size: int = 20,
):
    """
    Return duplicate groups relevant to the current user.

    Group statistics are calculated from the user's files,
    rather than exposing another user's storage information.
    """

    user_stats = (
        select(
            File.file_hash_id.label(
                "file_hash_id"
            ),
            func.count(
                File.id
            ).label(
                "user_file_count"
            ),
            func.sum(
                File.file_size
            ).label(
                "user_total_size"
            ),
            func.sum(
                case(
                    (
                        File.id
                        != DuplicateGroup.original_file_id,
                        1,
                    ),
                    else_=0,
                )
            ).label(
                "user_duplicate_count"
            ),
            func.sum(
                case(
                    (
                        File.id
                        != DuplicateGroup.original_file_id,
                        File.file_size,
                    ),
                    else_=0,
                )
            ).label(
                "user_potential_savings"
            ),
        )
        .join(
            DuplicateGroup,
            DuplicateGroup.file_hash_id
            == File.file_hash_id,
        )
        .where(
            File.user_id == user.id,
            File.status == "completed",
        )
        .group_by(
            File.file_hash_id
        )
        .subquery()
    )

    total = db.scalar(
        select(
            func.count(
                DuplicateGroup.id
            )
        )
        .join(
            user_stats,
            user_stats.c.file_hash_id
            == DuplicateGroup.file_hash_id,
        )
    ) or 0

    offset = (page - 1) * page_size

    statement = (
        select(
            DuplicateGroup,
            FileHash.sha256_hash,
            user_stats.c.user_file_count,
            user_stats.c.user_total_size,
            user_stats.c.user_duplicate_count,
            user_stats.c.user_potential_savings,
        )
        .join(
            FileHash,
            FileHash.id
            == DuplicateGroup.file_hash_id,
        )
        .join(
            user_stats,
            user_stats.c.file_hash_id
            == DuplicateGroup.file_hash_id,
        )
        .order_by(
            DuplicateGroup.potential_savings.desc(),
            DuplicateGroup.id.desc(),
        )
        .offset(offset)
        .limit(page_size)
    )

    rows = db.execute(statement).all()

    items = []

    for (
        group,
        sha256_hash,
        user_file_count,
        user_total_size,
        user_duplicate_count,
        user_potential_savings,
    ) in rows:
        items.append(
            {
                "id": group.id,
                "file_hash_id": group.file_hash_id,
                "sha256_hash": sha256_hash,
                "total_files": (
                    user_file_count
                ),
                "duplicate_count": (
                    user_duplicate_count
                ),
                "total_size": (
                    user_total_size or 0
                ),
                "potential_savings": (
                    user_potential_savings or 0
                ),
                "created_at": group.created_at,
                "updated_at": group.updated_at,
            }
        )

    total_pages = (
        (total + page_size - 1)
        // page_size
        if total
        else 0
    )

    return items, total, total_pages


def get_duplicate_group_detail(
    db: Session,
    user: User,
    group_id: int,
) -> dict | None:
    """
    Return duplicate-group details restricted to the current user.
    """

    group = db.scalar(
        select(DuplicateGroup).where(
            DuplicateGroup.id == group_id
        )
    )

    if group is None:
        return None

    file_hash = db.scalar(
        select(FileHash).where(
            FileHash.id == group.file_hash_id
        )
    )

    if file_hash is None:
        return None

    files = list(
        db.scalars(
            select(File)
            .where(
                File.file_hash_id
                == group.file_hash_id,
                File.user_id == user.id,
                File.status == "completed",
            )
            .order_by(
                File.uploaded_at.asc(),
                File.id.asc(),
            )
        ).all()
    )

    if not files:
        return None

    original_file = next(
        (
            file
            for file in files
            if file.id
            == group.original_file_id
        ),
        None,
    )

    duplicate_files = [
        file
        for file in files
        if file.id
        != group.original_file_id
    ]

    total_size = sum(
        file.file_size
        for file in files
    )

    duplicate_size = sum(
        file.file_size
        for file in duplicate_files
    )

    return {
        "id": group.id,
        "file_hash_id": group.file_hash_id,
        "sha256_hash": (
            file_hash.sha256_hash
        ),
        "total_files": len(files),
        "duplicate_count": len(
            duplicate_files
        ),
        "total_size": total_size,
        "potential_savings": duplicate_size,
        "created_at": group.created_at,
        "updated_at": group.updated_at,
        "original_file": (
            {
                "id": original_file.id,
                "original_filename": (
                    original_file.original_filename
                ),
                "stored_filename": (
                    original_file.stored_filename
                ),
                "file_size": (
                    original_file.file_size
                ),
                "mime_type": (
                    original_file.mime_type
                ),
                "file_extension": (
                    original_file.file_extension
                ),
                "status": (
                    original_file.status
                ),
                "is_protected": (
                    original_file.is_protected
                ),
                "uploaded_at": (
                    original_file.uploaded_at
                ),
                "is_original": True,
            }
            if original_file
            else None
        ),
        "duplicate_files": [
            {
                "id": file.id,
                "original_filename": (
                    file.original_filename
                ),
                "stored_filename": (
                    file.stored_filename
                ),
                "file_size": (
                    file.file_size
                ),
                "mime_type": (
                    file.mime_type
                ),
                "file_extension": (
                    file.file_extension
                ),
                "status": file.status,
                "is_protected": (
                    file.is_protected
                ),
                "uploaded_at": (
                    file.uploaded_at
                ),
                "is_original": False,
            }
            for file in duplicate_files
        ],
    }


def get_dashboard_summary(
    db: Session,
    user: User,
) -> dict:
    """
    Return dashboard metrics for the current user.
    """

    completed_filter = and_(
        File.user_id == user.id,
        File.status == "completed",
    )

    total_files = db.scalar(
        select(
            func.count(File.id)
        ).where(
            completed_filter
        )
    ) or 0

    total_storage = db.scalar(
        select(
            func.coalesce(
                func.sum(File.file_size),
                0,
            )
        ).where(
            completed_filter
        )
    ) or 0

    duplicate_condition = (
        File.user_id == user.id,
        File.status == "completed",
        File.file_hash_id.is_not(None),
        File.id
        != DuplicateGroup.original_file_id,
    )

    duplicate_files = db.scalar(
        select(
            func.count(File.id)
        )
        .join(
            DuplicateGroup,
            DuplicateGroup.file_hash_id
            == File.file_hash_id,
        )
        .where(
            *duplicate_condition
        )
    ) or 0

    duplicate_storage = db.scalar(
        select(
            func.coalesce(
                func.sum(File.file_size),
                0,
            )
        )
        .join(
            DuplicateGroup,
            DuplicateGroup.file_hash_id
            == File.file_hash_id,
        )
        .where(
            *duplicate_condition
        )
    ) or 0

    largest_files = list(
        db.scalars(
            select(File)
            .where(
                completed_filter
            )
            .order_by(
                File.file_size.desc(),
                File.id.desc(),
            )
            .limit(5)
        ).all()
    )

    recent_uploads = list(
        db.scalars(
            select(File)
            .where(
                completed_filter
            )
            .order_by(
                File.uploaded_at.desc(),
                File.id.desc(),
            )
            .limit(5)
        ).all()
    )

    return {
        "total_files": total_files,
        "total_storage": total_storage,
        "duplicate_files": duplicate_files,
        "duplicate_storage": duplicate_storage,
        "potential_savings": duplicate_storage,
        "largest_files": [
            _dashboard_file_item(file)
            for file in largest_files
        ],
        "recent_uploads": [
            _dashboard_file_item(file)
            for file in recent_uploads
        ],
    }


def delete_file_safely(
    db: Session,
    user: User,
    file_id: int,
    *,
    confirm: bool,
    reason: str | None = None,
) -> dict:
    """
    Safely delete a file.

    Physical deletion is staged first. The database transaction
    is committed only after the physical file has been safely
    moved out of its active location.

    If the database transaction fails, the staged file is restored.
    """

    if not confirm:
        raise FileManagementError(
            "Deletion confirmation is required."
        )

    file_record = db.scalar(
        select(File)
        .where(
            File.id == file_id,
            File.user_id == user.id,
        )
        .with_for_update()
    )

    if file_record is None:
        raise FileNotFoundError(
            "File not found."
        )

    if file_record.is_protected:
        raise PermissionError(
            "Protected files cannot be deleted."
        )

    if file_record.status == "processing":
        raise FileManagementError(
            "File cannot be deleted while hashing is in progress."
        )

    original_filename = (
        file_record.original_filename
    )

    was_duplicate = False
    was_original = False
    new_original_file_id = None
    duplicate_group_id = None
    remaining_files_count = 0

    group = None

    if file_record.file_hash_id is not None:
        group = db.scalar(
            select(DuplicateGroup)
            .where(
                DuplicateGroup.file_hash_id
                == file_record.file_hash_id
            )
            .with_for_update()
        )

    if group is not None:
        duplicate_group_id = group.id

        was_original = (
            group.original_file_id
            == file_record.id
        )

        was_duplicate = not was_original

        remaining_files = list(
            db.scalars(
                select(File)
                .where(
                    File.file_hash_id
                    == file_record.file_hash_id,
                    File.status == "completed",
                    File.id != file_record.id,
                )
                .order_by(
                    File.uploaded_at.asc(),
                    File.id.asc(),
                )
                .with_for_update()
            ).all()
        )

        remaining_files_count = len(
            remaining_files
        )

        if remaining_files_count >= 2:
            new_original = (
                remaining_files[0]
            )

            new_original_file_id = (
                new_original.id
            )

            group.original_file_id = (
                new_original.id
            )

            group.total_files = (
                remaining_files_count
            )

            group.duplicate_count = (
                remaining_files_count - 1
            )

            group.total_size = sum(
                file.file_size
                for file in remaining_files
            )

            group.potential_savings = (
                group.total_size
                - new_original.file_size
            )

        else:
            db.delete(group)

    hash_id = file_record.file_hash_id

    if hash_id is not None:
        remaining_hash_files = list(
            db.scalars(
                select(File.id)
                .where(
                    File.file_hash_id
                    == hash_id,
                    File.id != file_record.id,
                    File.status == "completed",
                )
            ).all()
        )
    else:
        remaining_hash_files = []

    file_path = _safe_file_path(
        file_record.stored_filename
    )

    quarantine_path = None

    if file_path.exists():
        quarantine_path = file_path.with_name(
            (
                f".deleting-"
                f"{uuid4().hex}-"
                f"{file_path.name}"
            )
        )

        try:
            os.replace(
                file_path,
                quarantine_path,
            )
        except OSError as exc:
            db.rollback()

            raise FileManagementError(
                "Unable to safely stage the physical file for deletion."
            ) from exc

    try:
        deletion_history = DeletionHistory(
            file_id=file_record.id,
            original_filename=(
                file_record.original_filename
            ),
            file_size=file_record.file_size,
            deletion_reason=(
                reason
                or "User requested deletion."
            ),
        )

        db.add(deletion_history)

        audit_log = AuditLog(
            user_id=user.id,
            action="DELETE",
            entity_type="FILE",
            entity_id=file_record.id,
            description=(
                "File deleted successfully: "
                f"{file_record.original_filename}"
            ),
        )

        db.add(audit_log)

        db.delete(file_record)

        db.flush()

        if (
            hash_id is not None
            and not remaining_hash_files
        ):
            remaining_any_files = db.scalar(
                select(
                    func.count(File.id)
                ).where(
                    File.file_hash_id
                    == hash_id
                )
            ) or 0

            if remaining_any_files == 0:
                hash_record = db.scalar(
                    select(FileHash).where(
                        FileHash.id == hash_id
                    )
                )

                if hash_record is not None:
                    db.delete(
                        hash_record
                    )

        db.commit()

    except Exception:
        db.rollback()

        if (
            quarantine_path is not None
            and quarantine_path.exists()
        ):
            try:
                os.replace(
                    quarantine_path,
                    file_path,
                )
            except OSError:
                logger.exception(
                    (
                        "CRITICAL: database rollback "
                        "succeeded but deleted-file restoration failed. "
                        "Original path: %s"
                    ),
                    file_path,
                )

        raise

    physical_file_deleted = True
    warning = None

    if quarantine_path is not None:
        try:
            quarantine_path.unlink(
                missing_ok=True
            )
        except OSError as exc:
            physical_file_deleted = False

            warning = (
                "Database deletion succeeded, but the physical "
                "file could not be permanently removed. "
                "Manual cleanup may be required."
            )

            logger.error(
                (
                    "Physical cleanup failed for deleted file %s: %s"
                ),
                file_id,
                exc,
            )

    return {
        "message": "File deleted successfully.",
        "file_id": file_id,
        "original_filename": original_filename,
        "deleted_from_database": True,
        "physical_file_deleted": physical_file_deleted,
        "was_duplicate": was_duplicate,
        "was_original": was_original,
        "new_original_file_id": (
            new_original_file_id
        ),
        "duplicate_group_id": (
            duplicate_group_id
        ),
        "remaining_files_in_group": (
            remaining_files_count
            if duplicate_group_id is not None
            else 0
        ),
        "warning": warning,
    }