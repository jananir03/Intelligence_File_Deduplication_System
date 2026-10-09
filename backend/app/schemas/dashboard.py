from datetime import datetime

from pydantic import BaseModel


class DashboardFileItem(BaseModel):
    id: int
    original_filename: str
    file_size: int
    mime_type: str | None
    file_extension: str | None
    status: str
    is_protected: bool
    uploaded_at: datetime


class DashboardSummaryResponse(BaseModel):
    total_files: int
    total_storage: int

    duplicate_files: int
    duplicate_storage: int
    potential_savings: int

    largest_files: list[DashboardFileItem]
    recent_uploads: list[DashboardFileItem]