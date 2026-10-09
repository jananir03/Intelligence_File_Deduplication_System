from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.duplicate_group import DuplicateGroup
from app.models.file import File
from app.models.file_hash import FileHash


def get_files_with_hash(
    db: Session,
    file_hash_id: int,
) -> list[File]:
    """
    Return all successfully processed files associated
    with the specified hash.
    """

    statement = (
        select(File)
        .where(
            File.file_hash_id == file_hash_id,
            File.status == "completed",
        )
        .order_by(
            File.uploaded_at.asc(),
            File.id.asc(),
        )
    )

    return list(db.scalars(statement).all())


def get_duplicate_group(
    db: Session,
    file_hash_id: int,
) -> DuplicateGroup | None:
    """
    Return the duplicate group associated with a hash.
    """

    statement = select(DuplicateGroup).where(
        DuplicateGroup.file_hash_id == file_hash_id
    )

    return db.scalar(statement)


def synchronize_duplicate_group(
    db: Session,
    file_hash: FileHash,
) -> DuplicateGroup | None:
    """
    Create, update, or remove the duplicate group
    associated with a file hash.

    A duplicate group exists only when at least two
    successfully processed files share the same hash.
    """

    matching_files = get_files_with_hash(
        db=db,
        file_hash_id=file_hash.id,
    )

    existing_group = get_duplicate_group(
        db=db,
        file_hash_id=file_hash.id,
    )

    if len(matching_files) < 2:
        if existing_group is not None:
            db.delete(existing_group)

        return None

    original_file = matching_files[0]

    total_files = len(matching_files)

    total_size = sum(
        file.file_size
        for file in matching_files
    )

    duplicate_count = total_files - 1

    potential_savings = (
        total_size - original_file.file_size
    )

    if existing_group is None:
        existing_group = DuplicateGroup(
            file_hash_id=file_hash.id,
            original_file_id=original_file.id,
            total_files=total_files,
            duplicate_count=duplicate_count,
            total_size=total_size,
            potential_savings=potential_savings,
        )

        db.add(existing_group)

    else:
        existing_group.original_file_id = (
            original_file.id
        )

        existing_group.total_files = (
            total_files
        )

        existing_group.duplicate_count = (
            duplicate_count
        )

        existing_group.total_size = (
            total_size
        )

        existing_group.potential_savings = (
            potential_savings
        )

    return existing_group


def recalculate_duplicate_group_for_hash(
    db: Session,
    file_hash_id: int,
) -> DuplicateGroup | None:
    """
    Recalculate duplicate-group information for a hash ID.

    This helper is useful after deleting a file.
    """

    file_hash = db.scalar(
        select(FileHash).where(
            FileHash.id == file_hash_id
        )
    )

    if file_hash is None:
        return None

    return synchronize_duplicate_group(
        db=db,
        file_hash=file_hash,
    )