from pathlib import Path

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.file import File
from app.models.file_metadata import FileMetadata
from app.models.user import User


def get_file_by_id(
    db: Session,
    file_id: int,
    user_id: int,
) -> File | None:
    """
    Retrieve a file belonging to the authenticated user.
    """

    statement = select(File).where(
        File.id == file_id,
        File.user_id == user_id,
    )

    return db.scalar(statement)


def get_file_count(
    db: Session,
    user_id: int,
    search: str | None = None,
) -> int:
    """
    Return the number of files belonging to a user.
    """

    statement = select(
        func.count(File.id)
    ).where(
        File.user_id == user_id
    )

    if search:
        search_pattern = f"%{search.strip()}%"

        statement = statement.where(
            File.original_filename.ilike(
                search_pattern
            )
        )

    return db.scalar(statement) or 0


def get_user_files(
    db: Session,
    user_id: int,
    skip: int,
    limit: int,
    search: str | None = None,
) -> list[File]:
    """
    Return paginated files belonging to a user.
    """

    statement = (
        select(File)
        .where(File.user_id == user_id)
        .order_by(File.uploaded_at.desc())
        .offset(skip)
        .limit(limit)
    )

    if search:
        search_pattern = f"%{search.strip()}%"

        statement = statement.where(
            File.original_filename.ilike(
                search_pattern
            )
        )

    return list(db.scalars(statement).all())


def create_file_record(
    db: Session,
    *,
    user: User,
    original_filename: str,
    stored_filename: str,
    file_path: str,
    mime_type: str | None,
    file_extension: str | None,
    file_size: int,
) -> File:
    """
    Create the database record for an uploaded file.
    """

    file_record = File(
        user_id=user.id,
        original_filename=original_filename,
        stored_filename=stored_filename,
        file_path=file_path,
        mime_type=mime_type,
        file_extension=file_extension,
        file_size=file_size,
        status="processing",
        is_protected=False,
    )

    db.add(file_record)
    db.flush()

    metadata_record = FileMetadata(
        file_id=file_record.id,
        created_date=None,
        modified_date=None,
        accessed_date=None,
        owner_name=user.username,
        permissions=None,
    )

    db.add(metadata_record)

    return file_record