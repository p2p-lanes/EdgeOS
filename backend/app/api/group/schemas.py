import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, field_validator
from sqlalchemy import Numeric, Text
from sqlmodel import Column, Field, SQLModel


class GroupBase(SQLModel):
    """Base group schema."""

    tenant_id: uuid.UUID = Field(foreign_key="tenants.id", index=True)
    popup_id: uuid.UUID = Field(foreign_key="popups.id", index=True)
    name: str = Field(index=True)
    slug: str = Field(unique=True, index=True)
    description: str | None = Field(default=None, nullable=True, sa_type=Text())
    discount_percentage: Decimal = Field(
        default=Decimal("0"), sa_column=Column(Numeric(5, 2), nullable=False)
    )
    max_members: int | None = Field(default=None, nullable=True)
    welcome_message: str | None = Field(default=None, nullable=True, sa_type=Text())
    is_ambassador_group: bool = Field(default=False)
    ambassador_id: uuid.UUID | None = Field(
        default=None, foreign_key="humans.id", nullable=True, index=True
    )


class GroupPublic(GroupBase):
    """Group schema for API responses."""

    id: uuid.UUID
    created_at: datetime | None = None
    updated_at: datetime | None = None
    whitelisted_emails: list["GroupWhitelistedEmailPublic"] = []
    is_open: bool = True  # True if no whitelisted emails (accepts all)

    model_config = ConfigDict(from_attributes=True)


class GroupCreate(BaseModel):
    """Group schema for creation."""

    popup_id: uuid.UUID
    name: str
    slug: str | None = None  # Auto-generated if not provided
    description: str | None = None
    discount_percentage: Decimal = Decimal("0")
    max_members: int | None = None
    welcome_message: str | None = None
    is_ambassador_group: bool = False
    ambassador_id: uuid.UUID | None = None
    whitelisted_emails: list[str] | None = None  # List of email strings to whitelist

    @field_validator("discount_percentage")
    @classmethod
    def validate_discount(cls, v: Decimal) -> Decimal:
        if v < 0 or v > 100:
            raise ValueError("discount_percentage must be between 0 and 100")
        return v

    model_config = ConfigDict(str_strip_whitespace=True)


class GroupUpdate(BaseModel):
    """Group schema for updates (limited fields for leaders)."""

    description: str | None = None
    welcome_message: str | None = None
    max_members: int | None = None


class GroupAdminUpdate(BaseModel):
    """Group schema for admin updates (full access)."""

    name: str | None = None
    slug: str | None = None
    description: str | None = None
    discount_percentage: Decimal | None = None
    max_members: int | None = None
    welcome_message: str | None = None
    is_ambassador_group: bool | None = None
    ambassador_id: uuid.UUID | None = None
    whitelisted_emails: list[str] | None = None  # List of email strings to whitelist


class GroupWhitelistedEmailPublic(BaseModel):
    """Schema for whitelisted email response."""

    id: uuid.UUID
    email: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ========================
# Group Member Schemas
# ========================


class GroupMemberCreate(BaseModel):
    """Schema for adding a member to a group."""

    first_name: str
    last_name: str
    email: str
    telegram: str | None = None
    organization: str | None = None
    role: str | None = None
    gender: str | None = None
    local_resident: bool | None = None

    @field_validator("email")
    @classmethod
    def clean_email(cls, v: str) -> str:
        return v.lower().strip()

    @field_validator("first_name", "last_name")
    @classmethod
    def validate_required(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("This field cannot be empty")
        return v.strip()

    model_config = ConfigDict(str_strip_whitespace=True)


class GroupMemberUpdate(BaseModel):
    """Schema for updating a group member."""

    first_name: str | None = None
    last_name: str | None = None
    email: str | None = None
    telegram: str | None = None
    organization: str | None = None
    role: str | None = None
    gender: str | None = None
    local_resident: bool | None = None

    @field_validator("email")
    @classmethod
    def clean_email(cls, v: str | None) -> str | None:
        if v is not None:
            return v.lower().strip()
        return v


class GroupMemberBatch(BaseModel):
    """Schema for batch member creation."""

    members: list[GroupMemberCreate]
    update_existing: bool = False

    @field_validator("members")
    @classmethod
    def validate_members(cls, v: list[GroupMemberCreate]) -> list[GroupMemberCreate]:
        if not v:
            raise ValueError("Members list cannot be empty")
        return v


class GroupMemberPublic(BaseModel):
    """Schema for member response with products."""

    id: uuid.UUID  # human_id
    first_name: str
    last_name: str
    email: str
    telegram: str | None = None
    organization: str | None = None
    role: str | None = None
    gender: str | None = None
    local_resident: bool | None = None
    products: list = []  # List of ProductPublic

    model_config = ConfigDict(from_attributes=True)


class GroupMemberBatchResult(GroupMemberPublic):
    """Schema for batch member result."""

    success: bool
    err_msg: str | None = None


class GroupWithMembers(GroupPublic):
    """Group with members list."""

    members: list[GroupMemberPublic] = []


# ========================
# Group Leader Schemas
# ========================


class GroupLeaderBase(SQLModel):
    """Base schema for group leaders link table."""

    tenant_id: uuid.UUID = Field(foreign_key="tenants.id", index=True)
    group_id: uuid.UUID = Field(foreign_key="groups.id", primary_key=True)
    human_id: uuid.UUID = Field(foreign_key="humans.id", primary_key=True, index=True)


class GroupMembersBase(SQLModel):
    """Base schema for group members link table."""

    tenant_id: uuid.UUID = Field(foreign_key="tenants.id", index=True)
    group_id: uuid.UUID = Field(foreign_key="groups.id", primary_key=True)
    human_id: uuid.UUID = Field(foreign_key="humans.id", primary_key=True, index=True)


class GroupProductsBase(SQLModel):
    """Base schema for group products link table."""

    tenant_id: uuid.UUID = Field(foreign_key="tenants.id", index=True)
    group_id: uuid.UUID = Field(foreign_key="groups.id", primary_key=True)
    product_id: uuid.UUID = Field(foreign_key="products.id", primary_key=True, index=True)
