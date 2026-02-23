import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlmodel import Column, DateTime, Field, Relationship

from app.api.email_template.schemas import EmailTemplateBase

if TYPE_CHECKING:
    from app.api.popup.models import Popups
    from app.api.tenant.models import Tenants


class EmailTemplates(EmailTemplateBase, table=True):
    __tablename__ = "email_templates"
    __table_args__ = (
        UniqueConstraint(
            "popup_id", "template_type", name="uq_email_template_popup_type"
        ),
    )

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        sa_column=Column(
            UUID(as_uuid=True),
            primary_key=True,
        ),
    )

    created_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True), server_default=func.now(), nullable=False
        )
    )
    updated_at: datetime | None = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), onupdate=func.now(), nullable=True),
    )

    tenant: "Tenants" = Relationship(back_populates="email_templates")
    popup: "Popups" = Relationship(back_populates="email_templates")
