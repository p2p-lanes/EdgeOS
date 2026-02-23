import uuid
from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict
from sqlalchemy import Text
from sqlmodel import Field, SQLModel


class ReviewDecision(StrEnum):
    """Decision options for application reviews."""

    STRONG_YES = "strong_yes"
    YES = "yes"
    NO = "no"
    STRONG_NO = "strong_no"


class ApplicationReviewBase(SQLModel):
    """Base schema for application reviews.

    An ApplicationReview records a reviewer's decision on a specific application.
    """

    application_id: uuid.UUID = Field(foreign_key="applications.id", index=True)
    reviewer_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    tenant_id: uuid.UUID = Field(foreign_key="tenants.id", index=True)

    decision: ReviewDecision
    notes: str | None = Field(default=None, max_length=2000, sa_type=Text())


class ApplicationReviewCreate(BaseModel):
    """Schema for submitting a review."""

    decision: ReviewDecision
    notes: str | None = None


class ApplicationReviewUpdate(BaseModel):
    """Schema for updating a review."""

    decision: ReviewDecision | None = None
    notes: str | None = None


class ApplicationReviewPublic(BaseModel):
    """ApplicationReview schema for API responses."""

    id: uuid.UUID
    application_id: uuid.UUID
    reviewer_id: uuid.UUID
    tenant_id: uuid.UUID
    decision: ReviewDecision
    notes: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None

    # Include reviewer details
    reviewer_email: str | None = None
    reviewer_full_name: str | None = None

    model_config = ConfigDict(from_attributes=True)


class ReviewSummary(BaseModel):
    """Summary of reviews for an application."""

    total_reviews: int
    strong_yes_count: int
    yes_count: int
    no_count: int
    strong_no_count: int
    weighted_score: int | None = None  # Only for weighted strategy
    reviews: list[ApplicationReviewPublic]

    model_config = ConfigDict(from_attributes=True)
