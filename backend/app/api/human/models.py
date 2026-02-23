import uuid
from typing import TYPE_CHECKING

from sqlalchemy import UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlmodel import Column, Field, Relationship

from app.api.group.models import GroupLeaders, GroupMembers
from app.api.human.schemas import HumanBase

if TYPE_CHECKING:
    from app.api.application.models import Applications
    from app.api.attendee.models import Attendees
    from app.api.group.models import Groups
    from app.api.tenant.models import Tenants


class Humans(HumanBase, table=True):
    __table_args__ = (
        UniqueConstraint("email", "tenant_id", name="uq_human_email_tenant_id"),
    )

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        sa_column=Column(
            UUID(as_uuid=True),
            primary_key=True,
        ),
    )

    tenant: "Tenants" = Relationship(back_populates="humans")

    # Applications submitted by this human
    applications: list["Applications"] = Relationship(back_populates="human")

    # Attendee records linked to this human (includes spouse attendees they later claimed)
    attendees: list["Attendees"] = Relationship(back_populates="human")

    # Groups where this human is a leader
    led_groups: list["Groups"] = Relationship(
        back_populates="leaders",
        link_model=GroupLeaders,
    )

    # Groups where this human is a member
    groups_as_member: list["Groups"] = Relationship(
        back_populates="members",
        link_model=GroupMembers,
    )

    @property
    def latest_application(self) -> "Applications | None":
        if not self.applications:
            return None
        return max(self.applications, key=lambda a: a.created_at)

    @property
    def display_name(self) -> str:
        if self.first_name or self.last_name:
            return f"{self.first_name or ''} {self.last_name or ''}".strip()
        return self.email

    @property
    def full_name(self) -> str | None:
        if self.first_name or self.last_name:
            return f"{self.first_name or ''} {self.last_name or ''}".strip()
        return None
