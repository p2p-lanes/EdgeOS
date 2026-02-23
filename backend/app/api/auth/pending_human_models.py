import uuid
from datetime import datetime

from sqlalchemy import UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlmodel import Column, DateTime, Field, SQLModel


class PendingHumans(SQLModel, table=True):
    """Temporary table for humans during passwordless authentication."""

    __tablename__ = "pending_humans"
    __table_args__ = (
        UniqueConstraint("email", "tenant_id", name="uq_pending_human_email_tenant_id"),
    )

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        sa_column=Column(
            UUID(as_uuid=True),
            primary_key=True,
        ),
    )

    tenant_id: uuid.UUID = Field(foreign_key="tenants.id", index=True)
    email: str = Field(index=True, max_length=255)
    auth_code: str = Field(max_length=6)
    code_expiration: datetime = Field(index=True, sa_type=DateTime(timezone=True))
    attempts: int = Field(default=0)

    picture_url: str | None = Field(default=None, max_length=500)
    red_flag: bool = Field(default=False)
