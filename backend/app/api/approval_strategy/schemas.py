import uuid
from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict
from sqlmodel import Field, SQLModel


class ApprovalStrategyType(StrEnum):
    """Types of approval strategies."""

    AUTO_ACCEPT = "auto_accept"  # Skip review, auto-accept on submit
    ANY_REVIEWER = "any_reviewer"  # Any single reviewer can accept
    ALL_REVIEWERS = "all_reviewers"  # All designated reviewers must approve
    THRESHOLD = "threshold"  # N out of M reviewers must approve
    WEIGHTED = "weighted"  # Weighted votes (strong yes = 2, yes = 1, etc.)
    # Note: If no strategy exists for a popup, applications are auto-accepted


class ApprovalStrategyBase(SQLModel):
    """Base schema for approval strategies.

    An ApprovalStrategy defines the rules for reviewing and accepting applications
    for a specific popup.
    """

    popup_id: uuid.UUID = Field(foreign_key="popups.id", index=True, unique=True)
    tenant_id: uuid.UUID = Field(foreign_key="tenants.id", index=True)

    strategy_type: ApprovalStrategyType = ApprovalStrategyType.ANY_REVIEWER

    # Threshold config (for THRESHOLD strategy)
    required_approvals: int = Field(default=1, ge=1)

    # Weighted config (for WEIGHTED strategy)
    accept_threshold: int = Field(default=2)
    reject_threshold: int = Field(default=-2)
    strong_yes_weight: int = Field(default=2)
    yes_weight: int = Field(default=1)
    no_weight: int = Field(default=-1)
    strong_no_weight: int = Field(default=-2)


class ApprovalStrategyCreate(BaseModel):
    """Schema for creating an approval strategy."""

    strategy_type: ApprovalStrategyType = ApprovalStrategyType.ANY_REVIEWER
    required_approvals: int = 1
    accept_threshold: int = 2
    reject_threshold: int = -2
    strong_yes_weight: int = 2
    yes_weight: int = 1
    no_weight: int = -1
    strong_no_weight: int = -2


class ApprovalStrategyUpdate(BaseModel):
    """Schema for updating an approval strategy."""

    strategy_type: ApprovalStrategyType | None = None
    required_approvals: int | None = None
    accept_threshold: int | None = None
    reject_threshold: int | None = None
    strong_yes_weight: int | None = None
    yes_weight: int | None = None
    no_weight: int | None = None
    strong_no_weight: int | None = None


class ApprovalStrategyPublic(BaseModel):
    """ApprovalStrategy schema for API responses."""

    id: uuid.UUID
    popup_id: uuid.UUID
    tenant_id: uuid.UUID

    strategy_type: ApprovalStrategyType
    required_approvals: int
    accept_threshold: int
    reject_threshold: int
    strong_yes_weight: int
    yes_weight: int
    no_weight: int
    strong_no_weight: int

    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
