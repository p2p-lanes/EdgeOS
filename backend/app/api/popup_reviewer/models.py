import uuid
from datetime import UTC, datetime
from typing import TYPE_CHECKING

from sqlalchemy import UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlmodel import Column, DateTime, Field, Relationship, func

from app.api.popup_reviewer.schemas import PopupReviewerBase

if TYPE_CHECKING:
    from app.api.popup.models import Popups
    from app.api.tenant.models import Tenants
    from app.api.user.models import Users


class PopupReviewers(PopupReviewerBase, table=True):
    """Designated reviewer for a popup.

    Assigns a user as a reviewer for applications to a specific popup.
    """

    __table_args__ = (
        UniqueConstraint("popup_id", "user_id", name="uq_popup_reviewer"),
    )

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        sa_column=Column(
            UUID(as_uuid=True),
            primary_key=True,
        ),
    )

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        sa_column=Column(
            DateTime(timezone=True), server_default=func.now(), nullable=False
        ),
    )

    # Relationships
    popup: "Popups" = Relationship(back_populates="reviewers")
    user: "Users" = Relationship()
    tenant: "Tenants" = Relationship()
