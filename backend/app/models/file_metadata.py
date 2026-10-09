from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base

if TYPE_CHECKING:
    from app.models.file import File


class FileMetadata(Base):
    __tablename__ = "file_metadata"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    file_id: Mapped[int] = mapped_column(
        ForeignKey("files.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )

    created_date: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )

    modified_date: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )

    accessed_date: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )

    owner_name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    permissions: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    file: Mapped["File"] = relationship(
        "File",
        back_populates="metadata_record",
    )