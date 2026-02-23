import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Index, text
from sqlalchemy.dialects.postgresql import UUID
from sqlmodel import Column, Field, Relationship

from app.api.tenant.schemas import TenantBase

if TYPE_CHECKING:
    from app.api.application.models import Applications
    from app.api.attendee.models import Attendees
    from app.api.coupon.models import Coupons
    from app.api.email_template.models import EmailTemplates
    from app.api.form_field.models import FormFields
    from app.api.group.models import Groups
    from app.api.human.models import Humans
    from app.api.payment.models import Payments
    from app.api.popup.models import Popups
    from app.api.product.models import Products
    from app.api.tenant.credential_models import TenantCredentials
    from app.api.user.models import Users


class Tenants(TenantBase, table=True):
    __table_args__ = (
        Index("ix_tenants_active", "slug", postgresql_where=text("deleted = false")),
    )

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        sa_column=Column(
            UUID(as_uuid=True),
            primary_key=True,
        ),
    )

    # Core relationships
    popups: list["Popups"] = Relationship(back_populates="tenant", cascade_delete=True)
    users: list["Users"] = Relationship(back_populates="tenant", cascade_delete=True)
    credentials: list["TenantCredentials"] = Relationship(
        back_populates="tenant", cascade_delete=True
    )
    humans: list["Humans"] = Relationship(back_populates="tenant", cascade_delete=True)

    # Popup-related resources
    products: list["Products"] = Relationship(
        back_populates="tenant", cascade_delete=True
    )
    coupons: list["Coupons"] = Relationship(
        back_populates="tenant", cascade_delete=True
    )
    groups: list["Groups"] = Relationship(back_populates="tenant", cascade_delete=True)
    form_fields: list["FormFields"] = Relationship(
        back_populates="tenant", cascade_delete=True
    )
    email_templates: list["EmailTemplates"] = Relationship(
        back_populates="tenant", cascade_delete=True
    )

    # Application flow
    applications: list["Applications"] = Relationship(
        back_populates="tenant", cascade_delete=True
    )
    attendees: list["Attendees"] = Relationship(
        back_populates="tenant", cascade_delete=True
    )
    payments: list["Payments"] = Relationship(
        back_populates="tenant", cascade_delete=True
    )
