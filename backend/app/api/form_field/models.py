import uuid
from typing import TYPE_CHECKING

from sqlalchemy import UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlmodel import Column, Field, Relationship

from app.api.form_field.schemas import FormFieldBase

if TYPE_CHECKING:
    from app.api.popup.models import Popups
    from app.api.tenant.models import Tenants


class FormFields(FormFieldBase, table=True):
    __table_args__ = (
        UniqueConstraint("name", "popup_id", name="uq_form_field_name_popup"),
    )

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        sa_column=Column(
            UUID(as_uuid=True),
            primary_key=True,
        ),
    )

    tenant: "Tenants" = Relationship(back_populates="form_fields")
    popup: "Popups" = Relationship(back_populates="form_fields")
