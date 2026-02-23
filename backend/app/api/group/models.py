import uuid
from datetime import UTC, datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Index, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlmodel import Column, DateTime, Field, Relationship, SQLModel, func

from app.api.group.schemas import (
    GroupBase,
    GroupLeaderBase,
    GroupMembersBase,
    GroupProductsBase,
)

if TYPE_CHECKING:
    from app.api.application.models import Applications
    from app.api.human.models import Humans
    from app.api.payment.models import Payments
    from app.api.popup.models import Popups
    from app.api.product.models import Products
    from app.api.tenant.models import Tenants


class GroupLeaders(GroupLeaderBase, table=True):
    """Link table for group leaders."""

    __tablename__ = "group_leaders"


class GroupMembers(GroupMembersBase, table=True):
    """Link table for group members."""

    __tablename__ = "group_members"


class GroupProducts(GroupProductsBase, table=True):
    """Link table for group products."""

    __tablename__ = "group_products"


class GroupWhitelistedEmails(SQLModel, table=True):
    """Whitelisted emails for group membership."""

    __tablename__ = "group_whitelisted_emails"
    __table_args__ = (
        UniqueConstraint("group_id", "email", name="uq_group_whitelisted_email"),
    )

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        sa_column=Column(
            UUID(as_uuid=True),
            primary_key=True,
        ),
    )
    tenant_id: uuid.UUID = Field(foreign_key="tenants.id", index=True)
    group_id: uuid.UUID = Field(foreign_key="groups.id", index=True)
    email: str = Field(index=True)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        sa_column=Column(
            DateTime(timezone=True), server_default=func.now(), nullable=False
        ),
    )

    # Relationship
    group: "Groups" = Relationship(back_populates="whitelisted_emails")


class Groups(GroupBase, table=True):
    """Group model for organizing applications and providing discounts."""

    __table_args__ = (
        UniqueConstraint("slug", "popup_id", name="uq_group_slug_popup"),
        Index("ix_groups_popup_ambassador", "popup_id", "is_ambassador_group"),
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
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        sa_column=Column(
            DateTime(timezone=True),
            server_default=func.now(),
            onupdate=func.now(),
            nullable=False,
        ),
    )

    # Relationships
    tenant: "Tenants" = Relationship(back_populates="groups")
    popup: "Popups" = Relationship(back_populates="groups")
    applications: list["Applications"] = Relationship(back_populates="group")

    # Many-to-many with humans for leaders
    leaders: list["Humans"] = Relationship(
        back_populates="led_groups",
        link_model=GroupLeaders,
    )

    # Many-to-many with humans for members
    members: list["Humans"] = Relationship(
        back_populates="groups_as_member",
        link_model=GroupMembers,
    )

    # Many-to-many with products
    products: list["Products"] = Relationship(
        link_model=GroupProducts,
    )

    # Ambassador relationship
    ambassador: Optional["Humans"] = Relationship(
        sa_relationship_kwargs={
            "foreign_keys": "[Groups.ambassador_id]",
        }
    )

    # Payments associated with this group's discount
    payments: list["Payments"] = Relationship(back_populates="group")

    # Whitelisted emails for membership
    whitelisted_emails: list["GroupWhitelistedEmails"] = Relationship(
        back_populates="group",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )

    def is_leader(self, human_id: uuid.UUID) -> bool:
        """Check if a human is a leader of this group."""
        return any(leader.id == human_id for leader in self.leaders)

    @property
    def is_open(self) -> bool:
        """A group is open if it has no whitelisted emails."""
        return len(self.whitelisted_emails) == 0

    def has_whitelisted_email(self, email: str) -> bool:
        """Check if email is whitelisted (case-insensitive)."""
        return email.lower() in [e.email.lower() for e in self.whitelisted_emails]
