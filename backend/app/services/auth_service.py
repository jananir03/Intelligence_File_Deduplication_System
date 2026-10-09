from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.models.user import User


def get_user_by_id(
    db: Session,
    user_id: int,
) -> User | None:
    """
    Retrieve a user by primary key.
    """
    return db.scalar(
        select(User).where(User.id == user_id)
    )


def get_user_by_email(
    db: Session,
    email: str,
) -> User | None:
    """
    Retrieve a user by normalized email address.
    """
    return db.scalar(
        select(User).where(User.email == email)
    )


def get_user_by_username(
    db: Session,
    username: str,
) -> User | None:
    """
    Retrieve a user by username.
    """
    return db.scalar(
        select(User).where(User.username == username)
    )


def get_user_by_login(
    db: Session,
    login_value: str,
) -> User | None:
    """
    Retrieve a user using either username or email.
    """
    normalized_value = login_value.strip()

    statement = select(User).where(
        or_(
            User.username == normalized_value,
            User.email == normalized_value.lower(),
        )
    )

    return db.scalar(statement)