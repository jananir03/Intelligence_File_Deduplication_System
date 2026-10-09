from pathlib import Path
from uuid import uuid4


class FileStorageError(Exception):
    """Raised when a file storage operation fails."""


class FileStorage:
    """
    Handles physical file storage.

    User-provided filenames are never used as physical storage names.
    Every stored file receives a UUID-based filename.
    """

    def __init__(self, upload_dir: str) -> None:
        self.base_directory = Path(upload_dir).resolve()
        self.base_directory.mkdir(
            parents=True,
            exist_ok=True,
        )

    def generate_stored_filename(
        self,
        original_filename: str,
    ) -> str:
        """
        Generate a unique physical filename while preserving the
        original file extension.
        """

        extension = Path(original_filename).suffix.lower()

        return f"{uuid4().hex}{extension}"

    def get_file_path(
        self,
        stored_filename: str,
    ) -> Path:
        """
        Resolve a stored filename safely inside the upload directory.
        """

        file_path = (
            self.base_directory / stored_filename
        ).resolve()

        if self.base_directory not in file_path.parents:
            raise FileStorageError(
                "Invalid file storage path."
            )

        return file_path

    def create_file_path(
        self,
        stored_filename: str,
    ) -> Path:
        """
        Return a safe path for a newly uploaded file.
        """

        file_path = self.get_file_path(
            stored_filename
        )

        if file_path.exists():
            raise FileStorageError(
                "Generated storage filename already exists."
            )

        return file_path

    def delete_file(
        self,
        stored_filename: str,
    ) -> None:
        """
        Delete a physical file if it exists.
        """

        file_path = self.get_file_path(
            stored_filename
        )

        if file_path.exists():
            if not file_path.is_file():
                raise FileStorageError(
                    "Storage path is not a file."
                )

            file_path.unlink()

    def file_exists(
        self,
        stored_filename: str,
    ) -> bool:
        """Return whether a stored file exists."""

        return self.get_file_path(
            stored_filename
        ).is_file()