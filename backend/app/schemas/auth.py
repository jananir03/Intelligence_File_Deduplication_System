from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserRegisterRequest(BaseModel):
    """
    Request body used when creating a new user.
    """

    username: str = Field(
        min_length=3,
        max_length=100,
    )

    email: EmailStr

    password: str = Field(
        min_length=8,
        max_length=72,
    )


class UserResponse(BaseModel):
    """
    Public user information.

    Password hashes are intentionally excluded.
    """

    model_config = ConfigDict(
        from_attributes=True,
    )

    id: int
    username: str
    email: EmailStr
    is_active: bool
    created_at: datetime
    updated_at: datetime


class TokenResponse(BaseModel):
    """
    JWT authentication response.
    """

    access_token: str
    token_type: str = "bearer"


class LoginResponse(TokenResponse):
    """
    Login response containing the authenticated user.
    """

    user: UserResponse