from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base

if TYPE_CHECKING:
    from app.models.file import File
    from app.models.duplicate_group import DuplicateGroup


class FileHash(Base):
    __tablename__ = "file_hashes"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    sha256_hash: Mapped[str] = mapped_column(
        String(64),
        unique=True,
        nullable=False,
        index=True,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        default="completed",
        nullable=False,
    )

    calculated_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )

    files: Mapped[list["File"]] = relationship(
        "File",
        back_populates="file_hash",
    )

    duplicate_group: Mapped["DuplicateGroup | None"] = relationship(
        "DuplicateGroup",
        back_populates="file_hash",
        uselist=False,
    )