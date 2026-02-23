import uuid
from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, field_validator
from sqlmodel import Field, SQLModel


class AttendeeCategory(str, Enum):
    """Categories for attendees."""

    MAIN = "main"
    SPOUSE = "spouse"
    KID = "kid"


class AttendeeBase(SQLModel):
    """Base attendee schema."""

    tenant_id: uuid.UUID = Field(foreign_key="tenants.id", index=True)
    application_id: uuid.UUID = Field(foreign_key="applications.id", index=True)
    human_id: uuid.UUID | None = Field(
        default=None, foreign_key="humans.id", index=True, nullable=True
    )
    name: str
    category: str = Field(index=True)  # main, spouse, kid
    email: str | None = Field(default=None, nullable=True)
    gender: str | None = Field(default=None, nullable=True)
    check_in_code: str = Field(index=True)
    poap_url: str | None = Field(default=None, nullable=True)


class AttendeePublic(AttendeeBase):
    """Attendee schema for API responses."""

    id: uuid.UUID
    created_at: datetime | None = None
    updated_at: datetime | None = None
    products: list = []  # List of ProductWithQuantity
    human_id: uuid.UUID | None = None

    model_config = ConfigDict(from_attributes=True)


class AttendeeCreate(BaseModel):
    """Attendee schema for creation (by user)."""

    name: str
    category: str  # main, spouse, kid
    email: str | None = None
    gender: str | None = None

    @field_validator("email")
    @classmethod
    def clean_email(cls, v: str | None) -> str | None:
        if v:
            return v.lower().strip()
        return None

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: str) -> str:
        allowed = [c.value for c in AttendeeCategory]
        if v not in allowed:
            raise ValueError(f"Category must be one of: {', '.join(allowed)}")
        return v

    model_config = ConfigDict(str_strip_whitespace=True)


class CompanionCreate(BaseModel):
    """Schema for creating companion attendees (spouse/kids) during application.

    Used when submitting an application with family members.
    Category is restricted to spouse/kid (main is auto-created from applicant).
    """

    name: str
    category: str  # spouse or kid only
    email: str | None = None
    gender: str | None = None

    @field_validator("email")
    @classmethod
    def clean_email(cls, v: str | None) -> str | None:
        if v:
            return v.lower().strip()
        return None

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: str) -> str:
        allowed = [AttendeeCategory.SPOUSE.value, AttendeeCategory.KID.value]
        if v not in allowed:
            raise ValueError(f"Category must be one of: {', '.join(allowed)}")
        return v

    model_config = ConfigDict(str_strip_whitespace=True)


class AttendeeUpdate(BaseModel):
    """Attendee schema for updates."""

    name: str | None = None
    email: str | None = None
    gender: str | None = None
    # Category cannot be changed once set if products exist

    @field_validator("email")
    @classmethod
    def clean_email(cls, v: str | None) -> str | None:
        if v:
            return v.lower().strip()
        return None


class AttendeeInternalCreate(AttendeeCreate):
    """Internal attendee schema with all fields."""

    application_id: uuid.UUID
    check_in_code: str


# ========================
# Attendee Products Schemas
# ========================


class AttendeeProductsBase(SQLModel):
    """Base schema for attendee products link table."""

    tenant_id: uuid.UUID = Field(foreign_key="tenants.id", index=True)
    attendee_id: uuid.UUID = Field(foreign_key="attendees.id", primary_key=True)
    product_id: uuid.UUID = Field(
        foreign_key="products.id", primary_key=True, index=True
    )
    quantity: int = Field(default=1)


class AttendeeProductPublic(BaseModel):
    """Schema for attendee product with quantity."""

    attendee_id: uuid.UUID
    product_id: uuid.UUID
    quantity: int

    model_config = ConfigDict(from_attributes=True)


# ========================
# Ticket Schemas (for ticket retrieval)
# ========================


class TicketProduct(BaseModel):
    """Minimal product data for tickets."""

    name: str
    category: str | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None
    quantity: int = 1


class AttendeeWithTickets(BaseModel):
    """Attendee with ticket/product information."""

    id: uuid.UUID
    name: str
    email: str | None
    category: str
    check_in_code: str
    popup_id: uuid.UUID
    popup_name: str
    popup_slug: str | None = None
    products: list[TicketProduct]
