import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Index, UniqueConstraint, text
from sqlalchemy.dialects.postgresql import UUID
from sqlmodel import Column, Field, Relationship

from app.api.coupon.schemas import CouponBase

if TYPE_CHECKING:
    from app.api.payment.models import Payments
    from app.api.popup.models import Popups
    from app.api.tenant.models import Tenants


class Coupons(CouponBase, table=True):
    """Coupon code model for discounts."""

    __table_args__ = (
        UniqueConstraint("code", "popup_id", name="uq_coupon_code_popup_id"),
        Index("ix_coupons_popup_active", "popup_id", "is_active"),
        Index(
            "ix_coupons_active_lookup",
            "popup_id",
            "code",
            postgresql_where=text("is_active = true"),
        ),
    )

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        sa_column=Column(
            UUID(as_uuid=True),
            primary_key=True,
        ),
    )

    tenant: "Tenants" = Relationship(back_populates="coupons")
    popup: "Popups" = Relationship(back_populates="coupons")

    # Payments that used this coupon
    payments: list["Payments"] = Relationship(back_populates="coupon")
