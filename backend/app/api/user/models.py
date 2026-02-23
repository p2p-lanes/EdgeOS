import uuid
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Index, UniqueConstraint, text
from sqlalchemy.dialects.postgresql import UUID
from sqlmodel import Column, Field, Relationship

from app.api.user.schemas import UserBase

if TYPE_CHECKING:
    from app.api.tenant.models import Tenants


class Users(UserBase, table=True):
    __table_args__ = (
        UniqueConstraint("email", "tenant_id", name="uq_user_email_tenant_id"),
        Index("ix_users_active", "email", postgresql_where=text("deleted = false")),
    )

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        sa_column=Column(
            UUID(as_uuid=True),
            primary_key=True,
        ),
    )
    tenant: Optional["Tenants"] = Relationship(back_populates="users")
