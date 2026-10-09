import hashlib
from pathlib import Path


class FileHashingError(Exception):
    """Raised when a file cannot be hashed safely."""


def calculate_sha256(
    file_path: Path,
    chunk_size: int = 1024 * 1024,
) -> str:
    """
    Calculate the SHA-256 hash of a file using streaming reads.

    The complete file is never loaded into memory.

    Args:
        file_path: Physical path of the file.
        chunk_size: Number of bytes read per iteration.

    Returns:
        Lowercase hexadecimal SHA-256 digest.
    """

    if not file_path.exists():
        raise FileHashingError(
            "File does not exist."
        )

    if not file_path.is_file():
        raise FileHashingError(
            "Hashing path is not a regular file."
        )

    if chunk_size <= 0:
        raise ValueError(
            "Chunk size must be greater than zero."
        )

    sha256 = hashlib.sha256()

    try:
        with file_path.open("rb") as file:
            while True:
                chunk = file.read(chunk_size)

                if not chunk:
                    break

                sha256.update(chunk)

    except OSError as exc:
        raise FileHashingError(
            "Unable to read file for hashing."
        ) from exc

    return sha256.hexdigest()


def validate_file_size(
    file_path: Path,
    expected_size: int,
) -> None:
    """
    Validate that the physical file size matches
    the size recorded in the database.
    """

    if not file_path.exists():
        raise FileHashingError(
            "File does not exist."
        )

    actual_size = file_path.stat().st_size

    if actual_size != expected_size:
        raise FileHashingError(
            (
                "File size mismatch. "
                f"Expected {expected_size} bytes, "
                f"found {actual_size} bytes."
            )
        )