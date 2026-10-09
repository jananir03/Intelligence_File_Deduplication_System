from celery import Celery

from app.core.config import settings


celery_app = Celery(
    "file_deduplication",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
)


celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=True,
    task_track_started=True,
    worker_prefetch_multiplier=1,
    task_acks_late=True,
    task_reject_on_worker_lost=True,
)


@celery_app.task(
    name="tasks.health_check"
)
def health_check_task() -> dict[str, str]:
    """
    Basic Celery worker health check.
    """

    return {
        "status": "success",
        "message": "Celery worker is running.",
    }


# Import task modules after celery_app has been
# created so decorators can register tasks.
from app.tasks import file_hash_tasks  # noqa: E402,F401