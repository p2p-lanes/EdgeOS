import uuid

from pydantic import BaseModel, EmailStr, Field


# User (backoffice) authentication schemas
class UserAuth(BaseModel):
    """Request to login a user."""

    email: EmailStr


class UserVerify(BaseModel):
    """Request to authenticate a user."""

    email: EmailStr
    code: str = Field(min_length=6, max_length=6, pattern=r"^\d{6}$")


# Human (external app) authentication schemas
class HumanAuth(BaseModel):
    """Request to initiate human authentication."""

    tenant_id: uuid.UUID
    email: str
    picture_url: str | None = None
    red_flag: bool = False


class HumanVerify(BaseModel):
    """Request to verify human authentication code."""

    email: str
    tenant_id: uuid.UUID
    code: str = Field(min_length=6, max_length=6, pattern=r"^\d{6}$")


# Response schemas
class AuthTokenResponse(BaseModel):
    """Response containing JWT access token."""

    access_token: str
    token_type: str = "bearer"


class AuthCodeSentResponse(BaseModel):
    """Response after successfully sending auth code."""

    message: str
    email: str
    expires_in_minutes: int = 15
