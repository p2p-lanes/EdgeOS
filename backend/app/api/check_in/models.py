import uuid
from datetime import UTC, datetime
from typing import TYPE_CHECKING

from sqlalchemy.dialects.postgresql import UUID
from sqlmodel import Column, DateTime, Field, Relationship, func

from app.api.check_in.schemas import CheckInBase

if TYPE_CHECKING:
    from app.api.attendee.models import Attendees
    from app.api.tenant.models import Tenants


class CheckIns(CheckInBase, table=True):
    """Check-in model - tracks attendee arrival/departure and QR scans."""

    __tablename__ = "check_ins"

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
    tenant: "Tenants" = Relationship()
    attendee: "Attendees" = Relationship()
