import uuid
from typing import TYPE_CHECKING, Optional

from sqlalchemy.dialects.postgresql import UUID
from sqlmodel import Column, Field, Relationship

from app.api.popup.schemas import PopupBase

if TYPE_CHECKING:
    from app.api.application.models import Applications
    from app.api.approval_strategy.models import ApprovalStrategies
    from app.api.coupon.models import Coupons
    from app.api.email_template.models import EmailTemplates
    from app.api.form_field.models import FormFields
    from app.api.group.models import Groups
    from app.api.popup_reviewer.models import PopupReviewers
    from app.api.product.models import Products
    from app.api.tenant.models import Tenants


class Popups(PopupBase, table=True):
    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        sa_column=Column(
            UUID(as_uuid=True),
            primary_key=True,
        ),
    )

    tenant: "Tenants" = Relationship(back_populates="popups")

    # Popup-scoped resources
    products: list["Products"] = Relationship(
        back_populates="popup", cascade_delete=True
    )
    coupons: list["Coupons"] = Relationship(back_populates="popup", cascade_delete=True)
    groups: list["Groups"] = Relationship(back_populates="popup", cascade_delete=True)

    # Applications for this popup
    applications: list["Applications"] = Relationship(
        back_populates="popup", cascade_delete=True
    )

    # Form field definitions
    form_fields: list["FormFields"] = Relationship(
        back_populates="popup", cascade_delete=True
    )

    # Email template customizations
    email_templates: list["EmailTemplates"] = Relationship(
        back_populates="popup", cascade_delete=True
    )

    # Approval configuration
    approval_strategy: Optional["ApprovalStrategies"] = Relationship(
        back_populates="popup",
        sa_relationship_kwargs={"cascade": "all, delete-orphan", "uselist": False},
    )
    reviewers: list["PopupReviewers"] = Relationship(
        back_populates="popup", cascade_delete=True
    )
