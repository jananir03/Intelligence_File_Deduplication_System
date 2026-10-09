from datetime import date, datetime

from pydantic import BaseModel, Field


class FileManagementItem(BaseModel):
    id: int
    original_filename: str
    stored_filename: str
    file_size: int
    mime_type: str | None
    file_extension: str | None
    file_hash_id: int | None
    status: str
    is_protected: bool
    uploaded_at: datetime

    is_duplicate: bool


class FileManagementListResponse(BaseModel):
    items: list[FileManagementItem]

    page: int
    page_size: int
    total: int
    total_pages: int


class DeleteFileRequest(BaseModel):
    confirm: bool = Field(
        ...,
        description=(
            "Must be true to permanently delete the file."
        ),
    )

    reason: str | None = Field(
        default=None,
        max_length=255,
        description="Optional reason for deletion.",
    )


class DeleteFileResponse(BaseModel):
    message: str

    file_id: int
    original_filename: str

    deleted_from_database: bool
    physical_file_deleted: bool

    was_duplicate: bool
    was_original: bool

    new_original_file_id: int | None

    duplicate_group_id: int | None
    remaining_files_in_group: int

    warning: str | None = None