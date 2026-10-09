from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import BigInteger, DateTime, ForeignKey, Integer, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base

if TYPE_CHECKING:
    from app.models.file_hash import FileHash
    from app.models.file import File


class DuplicateGroup(Base):
    __tablename__ = "duplicate_groups"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    file_hash_id: Mapped[int] = mapped_column(
        ForeignKey("file_hashes.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )

    original_file_id: Mapped[int] = mapped_column(
        ForeignKey("files.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    total_files: Mapped[int] = mapped_column(
        Integer,
        default=1,
        nullable=False,
    )

    duplicate_count: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    total_size: Mapped[int] = mapped_column(
        BigInteger,
        default=0,
        nullable=False,
    )

    potential_savings: Mapped[int] = mapped_column(
        BigInteger,
        default=0,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    file_hash: Mapped["FileHash"] = relationship(
        "FileHash",
        back_populates="duplicate_group",
    )

    original_file: Mapped["File"] = relationship(
        "File",
        back_populates="duplicate_group_as_original",
        foreign_keys=[original_file_id],
    )