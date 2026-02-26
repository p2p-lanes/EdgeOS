import uuid
from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, field_validator
from sqlalchemy import String
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlmodel import Column, DateTime, Field, SQLModel

from app.api.attendee.schemas import AttendeePublic, CompanionCreate
from app.api.human.schemas import HumanPublic


class ApplicationStatus(str, Enum):
    """Status for applications."""

    DRAFT = "draft"
    IN_REVIEW = "in review"
    REJECTED = "rejected"
    ACCEPTED = "accepted"
    WITHDRAWN = "withdrawn"


class UserSettableStatus(str, Enum):
    """Statuses that users can set (subset of ApplicationStatus)."""

    DRAFT = "draft"
    IN_REVIEW = "in review"


class ApplicationBase(SQLModel):
    """Base schema for applications.

    An Application is a form submitted by a Human to participate in a Popup.
    Profile data lives on Human; Application only stores popup-specific data.
    """

    tenant_id: uuid.UUID = Field(foreign_key="tenants.id", index=True)
    popup_id: uuid.UUID = Field(foreign_key="popups.id", index=True)
    human_id: uuid.UUID = Field(foreign_key="humans.id", index=True)
    group_id: uuid.UUID | None = Field(
        default=None, foreign_key="groups.id", nullable=True, index=True
    )

    # Popup-specific fields
    referral: str | None = Field(default=None, nullable=True, max_length=255)

    info_not_shared: list[str] = Field(
        default_factory=list,
        sa_column=Column(ARRAY(String), nullable=False, server_default="{}"),
    )

    # Status and review
    status: str = Field(default=ApplicationStatus.DRAFT.value, index=True)

    # Dynamic form fields (popup-specific questions)
    custom_fields: dict = Field(
        default_factory=dict,
        sa_column=Column(JSONB, nullable=False, server_default="'{}'"),
    )
    custom_fields_schema: dict | None = Field(
        default=None,
        sa_column=Column(JSONB, nullable=True),
    )

    # Timestamps
    submitted_at: datetime | None = Field(
        default=None, nullable=True, sa_type=DateTime(timezone=True)
    )
    accepted_at: datetime | None = Field(
        default=None, nullable=True, sa_type=DateTime(timezone=True)
    )


class ApplicationPublic(BaseModel):
    """Application schema for API responses."""

    id: uuid.UUID
    tenant_id: uuid.UUID
    popup_id: uuid.UUID
    human_id: uuid.UUID
    group_id: uuid.UUID | None = None

    # Popup-specific
    referral: str | None = None
    info_not_shared: list[str] = []
    status: str
    custom_fields: dict = {}
    custom_fields_schema: dict | None = None

    # Timestamps
    submitted_at: datetime | None = None
    accepted_at: datetime | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None

    # Related data
    human: HumanPublic | None = None
    attendees: list[AttendeePublic] = []

    # Computed fields
    red_flag: bool = False
    brings_spouse: bool = False
    brings_kids: bool = False
    kid_count: int = 0

    model_config = ConfigDict(from_attributes=True)


class ApplicationCreate(BaseModel):
    """Application schema for creation.

    Profile fields can be provided here and will update the Human record.
    Companions (spouse/kids) can be added during initial submission.
    """

    popup_id: uuid.UUID

    # Profile fields (will be saved to Human)
    first_name: str
    last_name: str
    email: str | None = None
    telegram: str | None = None
    organization: str | None = None
    role: str | None = None
    gender: str | None = None
    age: str | None = None
    residence: str | None = None

    # Application-specific fields
    referral: str | None = None
    info_not_shared: list[str] | None = None
    custom_fields: dict | None = None
    status: UserSettableStatus | None = None
    human_id: uuid.UUID | None = None
    group_id: uuid.UUID | None = None  # Optional group to join

    # Companions (spouse/kids) to create along with application
    companions: list[CompanionCreate] | None = None

    @field_validator("email")
    @classmethod
    def clean_email(cls, v: str | None) -> str | None:
        if v:
            return v.lower().strip()
        return v

    model_config = ConfigDict(str_strip_whitespace=True)


class ApplicationUpdate(BaseModel):
    """Application schema for updates by the applicant.

    Profile fields will update the Human record.
    """

    # Profile fields (updates Human)
    first_name: str | None = None
    last_name: str | None = None
    telegram: str | None = None
    organization: str | None = None
    role: str | None = None
    gender: str | None = None
    age: str | None = None
    residence: str | None = None

    # Application-specific fields
    referral: str | None = None
    info_not_shared: list[str] | None = None
    custom_fields: dict | None = None
    status: UserSettableStatus | None = None


class ApplicationAdminUpdate(ApplicationUpdate):
    """Application schema for admin updates (can set any status)."""

    status: ApplicationStatus | None = None


class ApplicationAdminCreate(BaseModel):
    """Application schema for admin creation.

    Admins can create applications on behalf of users and set any status.
    If email is provided and human doesn't exist, a new Human record is created.
    Companions (spouse/kids) can be added during initial submission.
    """

    popup_id: uuid.UUID

    # Profile fields (will be saved to Human)
    first_name: str | None = None
    last_name: str | None = None
    email: str  # Required for admin creation
    telegram: str | None = None
    organization: str | None = None
    role: str | None = None
    gender: str | None = None
    age: str | None = None
    residence: str | None = None

    # Application-specific fields
    referral: str | None = None
    info_not_shared: list[str] | None = None
    custom_fields: dict | None = None
    status: ApplicationStatus = ApplicationStatus.DRAFT
    group_id: uuid.UUID | None = None

    # Companions (spouse/kids) to create along with application
    companions: list[CompanionCreate] | None = None

    @field_validator("email")
    @classmethod
    def clean_email(cls, v: str) -> str:
        return v.lower().strip()

    model_config = ConfigDict(str_strip_whitespace=True)


class ApplicationFilter(BaseModel):
    """Filters for application queries."""

    popup_id: uuid.UUID | None = None
    human_id: uuid.UUID | None = None
    status: ApplicationStatus | None = None
    email: str | None = None


class DirectoryProduct(BaseModel):
    """Minimal product info for directory participation display."""

    id: uuid.UUID
    name: str
    slug: str
    category: str | None = None
    duration_type: str | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None


class AssociatedAttendee(BaseModel):
    """Non-main attendee summary for directory."""

    name: str
    category: str
    gender: str | None = None
    email: str | None = None


class AttendeesDirectoryEntry(BaseModel):
    """Single entry in the attendees directory."""

    id: uuid.UUID  # application id

    # Human profile (from application.human)
    first_name: str | None = None
    last_name: str | None = None
    email: str | None = None
    telegram: str | None = None
    role: str | None = None
    organization: str | None = None
    residence: str | None = None
    age: str | None = None
    gender: str | None = None
    picture_url: str | None = None

    # Computed from attendees
    brings_kids: bool | str = False  # str "*" when hidden

    # Participation
    participation: list[DirectoryProduct] = []
    check_in: datetime | None = None
    check_out: datetime | None = None

    # Associated attendees (spouse/kids)
    associated_attendees: list[AssociatedAttendee] = []

    model_config = ConfigDict(from_attributes=True)


class ApplicationSnapshotBase(SQLModel):
    """Base schema for application snapshots.

    A snapshot captures the state of a Human's profile at the time of
    application submission or status change. This preserves historical data.
    """

    tenant_id: uuid.UUID = Field(foreign_key="tenants.id", index=True)
    application_id: uuid.UUID = Field(foreign_key="applications.id", index=True)

    # Snapshot trigger
    event: str = Field(max_length=50)  # e.g., "submitted", "accepted", "updated"

    # Human profile snapshot at this moment
    first_name: str | None = None
    last_name: str | None = None
    email: str
    telegram: str | None = None
    organization: str | None = None
    role: str | None = None
    gender: str | None = None
    age: str | None = None
    residence: str | None = None

    # Application data snapshot
    referral: str | None = None
    info_not_shared: list[str] = Field(
        default_factory=list,
        sa_column=Column(ARRAY(String), nullable=False, server_default="{}"),
    )
    custom_fields: dict = Field(
        default_factory=dict,
        sa_column=Column(JSONB, nullable=False, server_default="'{}'"),
    )
    status: str


class ApplicationSnapshotPublic(BaseModel):
    """Application snapshot for API responses."""

    id: uuid.UUID
    application_id: uuid.UUID
    event: str
    created_at: datetime

    # Human profile at snapshot time
    first_name: str | None = None
    last_name: str | None = None
    email: str
    telegram: str | None = None
    organization: str | None = None
    role: str | None = None
    gender: str | None = None
    age: str | None = None
    residence: str | None = None

    # Application data at snapshot time
    referral: str | None = None
    info_not_shared: list[str] = []
    custom_fields: dict = {}
    status: str

    model_config = ConfigDict(from_attributes=True)
