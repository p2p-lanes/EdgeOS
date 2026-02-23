import uuid
from datetime import UTC, datetime
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlmodel import Column, DateTime, Field, Relationship, SQLModel

from app.api.shared.enums import CredentialType

if TYPE_CHECKING:
    from app.api.tenant.models import Tenants


class TenantCredentials(SQLModel, table=True):
    __tablename__ = "tenant_credentials"
    __table_args__ = (
        UniqueConstraint(
            "tenant_id", "credential_type", name="uq_tenant_credentials_type"
        ),
    )

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        sa_column=Column(
            UUID(as_uuid=True),
            primary_key=True,
        ),
    )
    tenant_id: uuid.UUID = Field(
        sa_column=Column(
            UUID(as_uuid=True),
            ForeignKey("tenants.id"),
            nullable=False,
        ),
    )
    credential_type: CredentialType = Field(default=CredentialType.CRUD)
    db_username: str = Field(max_length=255)
    db_password_encrypted: str = Field(max_length=512)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )

    tenant: "Tenants" = Relationship(back_populates="credentials")
