from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    app_name: str = "Intelligent File Deduplication System"
    app_env: str = "development"
    debug: bool = True

    # ------------------------------------------------------------------
    # MySQL
    # ------------------------------------------------------------------

    mysql_root_password: str
    mysql_database: str
    mysql_user: str
    mysql_password: str
    mysql_host: str = "mysql"
    mysql_port: int = 3306

    database_url: str

    # ------------------------------------------------------------------
    # JWT
    # ------------------------------------------------------------------

    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # ------------------------------------------------------------------
    # Redis / Celery
    # ------------------------------------------------------------------

    redis_host: str = "redis"
    redis_port: int = 6379
    redis_db: int = 0

    celery_broker_url: str
    celery_result_backend: str

    # ------------------------------------------------------------------
    # File Storage
    # ------------------------------------------------------------------

    upload_dir: str = "uploads"

    max_file_size_mb: int = 1024

    upload_chunk_size_kb: int = 1024

    max_filename_length: int = 255

    # ------------------------------------------------------------------
    # Pydantic Settings
    # ------------------------------------------------------------------

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    """Return the cached application settings."""
    return Settings()


settings = get_settings()