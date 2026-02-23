import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict
from sqlmodel import Field, SQLModel


class PopupReviewerBase(SQLModel):
    """Base schema for popup reviewers.

    A PopupReviewer designates a user as a reviewer for a specific popup's applications.
    """

    popup_id: uuid.UUID = Field(foreign_key="popups.id", index=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    tenant_id: uuid.UUID = Field(foreign_key="tenants.id", index=True)

    # Per-reviewer settings
    is_required: bool = Field(
        default=False
    )  # For ALL_REVIEWERS: must this user review?
    weight_multiplier: float = Field(default=1.0)  # For WEIGHTED: multiply vote weight


class PopupReviewerCreate(BaseModel):
    """Schema for adding a reviewer to a popup."""

    user_id: uuid.UUID
    is_required: bool = False
    weight_multiplier: float = 1.0


class PopupReviewerUpdate(BaseModel):
    """Schema for updating a popup reviewer."""

    is_required: bool | None = None
    weight_multiplier: float | None = None


class PopupReviewerPublic(BaseModel):
    """PopupReviewer schema for API responses."""

    id: uuid.UUID
    popup_id: uuid.UUID
    user_id: uuid.UUID
    tenant_id: uuid.UUID
    is_required: bool
    weight_multiplier: float
    created_at: datetime | None = None

    # Include user details
    user_email: str | None = None
    user_full_name: str | None = None

    model_config = ConfigDict(from_attributes=True)
