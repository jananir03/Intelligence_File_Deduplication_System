from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class DuplicateGroupFileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    original_filename: str
    stored_filename: str
    file_size: int
    mime_type: str | None
    file_extension: str | None
    status: str
    is_protected: bool
    uploaded_at: datetime
    is_original: bool


class DuplicateGroupListItem(BaseModel):
    id: int
    file_hash_id: int
    sha256_hash: str

    total_files: int
    duplicate_count: int
    total_size: int
    potential_savings: int

    created_at: datetime
    updated_at: datetime


class DuplicateGroupListResponse(BaseModel):
    items: list[DuplicateGroupListItem]
    page: int
    page_size: int
    total: int
    total_pages: int


class DuplicateGroupDetailResponse(BaseModel):
    id: int
    file_hash_id: int
    sha256_hash: str

    total_files: int
    duplicate_count: int
    total_size: int
    potential_savings: int

    created_at: datetime
    updated_at: datetime

    original_file: DuplicateGroupFileResponse | None
    duplicate_files: list[DuplicateGroupFileResponse]