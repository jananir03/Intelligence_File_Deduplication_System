from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import BigInteger, Boolean, DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.file_hash import FileHash
    from app.models.file_metadata import FileMetadata
    from app.models.deletion_history import DeletionHistory
    from app.models.duplicate_group import DuplicateGroup


class File(Base):
    __tablename__ = "files"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    original_filename: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    stored_filename: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        unique=True,
    )

    file_path: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    mime_type: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )

    file_extension: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )

    file_size: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
    )

    file_hash_id: Mapped[int | None] = mapped_column(
        ForeignKey("file_hashes.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        default="processing",
        nullable=False,
        index=True,
    )

    is_protected: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        nullable=False,
        index=True,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    owner: Mapped["User"] = relationship(
        "User",
        back_populates="files",
    )

    file_hash: Mapped["FileHash | None"] = relationship(
        "FileHash",
        back_populates="files",
    )

    metadata_record: Mapped["FileMetadata | None"] = relationship(
        "FileMetadata",
        back_populates="file",
        uselist=False,
        cascade="all, delete-orphan",
    )

    deletion_history: Mapped[list["DeletionHistory"]] = relationship(
        "DeletionHistory",
        back_populates="file",
    )

    duplicate_group_as_original: Mapped[list["DuplicateGroup"]] = relationship(
        "DuplicateGroup",
        back_populates="original_file",
        foreign_keys="DuplicateGroup.original_file_id",
    )