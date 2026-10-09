from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_active_user
from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.db.database import get_db
from app.models.audit_log import AuditLog
from app.models.user import User
from app.schemas.auth import (
    LoginResponse,
    TokenResponse,
    UserRegisterRequest,
    UserResponse,
)
from app.services.auth_service import (
    get_user_by_email,
    get_user_by_login,
    get_user_by_username,
)


router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Authentication"],
)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
def register(
    payload: UserRegisterRequest,
    request: Request,
    db: Session = Depends(get_db),
) -> User:
    """
    Register a new user account.
    """

    username = payload.username.strip()
    email = str(payload.email).strip().lower()

    if not username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username cannot be empty.",
        )

    existing_username = get_user_by_username(
        db=db,
        username=username,
    )

    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already exists.",
        )

    existing_email = get_user_by_email(
        db=db,
        email=email,
    )

    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already exists.",
        )

    user = User(
        username=username,
        email=email,
        password_hash=hash_password(payload.password),
        is_active=True,
    )

    db.add(user)

    try:
        db.flush()

        audit_log = AuditLog(
            user_id=user.id,
            action="REGISTER",
            entity_type="USER",
            entity_id=user.id,
            description="New user account registered.",
            ip_address=request.client.host if request.client else None,
        )

        db.add(audit_log)

        db.commit()
        db.refresh(user)

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username or email already exists.",
        )

    return user


@router.post(
    "/login",
    response_model=LoginResponse,
    summary="Login user",
)
def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> LoginResponse:
    """
    Authenticate using username or email and return a JWT.
    """

    user = get_user_by_login(
        db=db,
        login_value=form_data.username,
    )

    if user is None or not verify_password(
        form_data.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username/email or password.",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive.",
        )

    access_token = create_access_token(
        subject=str(user.id),
    )

    audit_log = AuditLog(
        user_id=user.id,
        action="LOGIN",
        entity_type="USER",
        entity_id=user.id,
        description="User logged in successfully.",
        ip_address=request.client.host if request.client else None,
    )

    db.add(audit_log)
    db.commit()

    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user=user,
    )


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current authenticated user",
)
def get_me(
    current_user: User = Depends(get_current_active_user),
) -> User:
    """
    Return the currently authenticated user.
    """

    return current_user