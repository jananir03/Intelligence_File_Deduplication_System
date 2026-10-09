from datetime import datetime

from pydantic import BaseModel, ConfigDict


class FileResponse(BaseModel):
    """
    Public representation of an uploaded file.
    """

    model_config = ConfigDict(
        from_attributes=True,
    )

    id: int
    original_filename: str
    mime_type: str | None
    file_extension: str | None
    file_size: int
    status: str
    is_protected: bool
    uploaded_at: datetime
    updated_at: datetime


class FileListResponse(BaseModel):
    """
    Paginated file listing.
    """

    items: list[FileResponse]
    total: int
    skip: int
    limit: int


class FileUploadResponse(FileResponse):
    """
    Response returned after successful upload.
    """

    message: str


class FileDownloadInfo(BaseModel):
    """
    Internal download information.
    """

    file_path: str
    original_filename: str
    mime_type: str | None