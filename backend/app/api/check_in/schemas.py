import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict
from sqlmodel import DateTime, Field, SQLModel


class CheckInBase(SQLModel):
    """Base check-in schema."""

    tenant_id: uuid.UUID = Field(foreign_key="tenants.id", index=True)
    attendee_id: uuid.UUID = Field(foreign_key="attendees.id", unique=True, index=True)
    arrival_date: datetime | None = Field(
        default=None, nullable=True, sa_type=DateTime(timezone=True)
    )
    departure_date: datetime | None = Field(
        default=None, nullable=True, sa_type=DateTime(timezone=True)
    )
    qr_check_in: bool = Field(default=False)
    qr_scan_timestamp: datetime | None = Field(
        default=None, nullable=True, sa_type=DateTime(timezone=True)
    )


class CheckInCreate(BaseModel):
    """Check-in schema for creation."""

    attendee_id: uuid.UUID
    arrival_date: datetime | None = None
    departure_date: datetime | None = None
    qr_check_in: bool = False
    qr_scan_timestamp: datetime | None = None


class CheckInUpdate(BaseModel):
    """Check-in schema for updates."""

    arrival_date: datetime | None = None
    departure_date: datetime | None = None
    qr_check_in: bool | None = None
    qr_scan_timestamp: datetime | None = None


class CheckInPublic(CheckInBase):
    """Check-in schema for API responses."""

    id: uuid.UUID
    created_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
