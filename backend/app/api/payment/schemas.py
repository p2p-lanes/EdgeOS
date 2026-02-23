import uuid
from datetime import datetime
from decimal import Decimal
from enum import Enum

from pydantic import BaseModel, ConfigDict, field_validator
from sqlalchemy import Numeric, Text
from sqlmodel import Column, Field, SQLModel


class PaymentSource(str, Enum):
    """Payment source/provider."""

    SIMPLEFI = "SimpleFI"
    STRIPE = "Stripe"


class PaymentStatus(str, Enum):
    """Payment status."""

    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    EXPIRED = "expired"
    CANCELLED = "cancelled"


class PaymentProductBase(SQLModel):
    """Base schema for payment product snapshot."""

    tenant_id: uuid.UUID = Field(foreign_key="tenants.id", index=True)
    payment_id: uuid.UUID = Field(foreign_key="payments.id", primary_key=True)
    product_id: uuid.UUID = Field(
        foreign_key="products.id", primary_key=True, index=True
    )
    attendee_id: uuid.UUID = Field(
        foreign_key="attendees.id", primary_key=True, index=True
    )
    quantity: int = Field(default=1)

    # Snapshot of product at time of purchase
    product_name: str
    product_description: str | None = Field(default=None, sa_type=Text())
    product_price: Decimal = Field(sa_column=Column(Numeric(10, 2), nullable=False))
    product_category: str


class PaymentBase(SQLModel):
    """Base payment schema."""

    tenant_id: uuid.UUID = Field(foreign_key="tenants.id", index=True)
    application_id: uuid.UUID = Field(foreign_key="applications.id", index=True)
    external_id: str | None = Field(default=None, nullable=True)
    status: str = Field(default=PaymentStatus.PENDING.value, index=True)
    amount: Decimal = Field(
        default=Decimal("0"), sa_column=Column(Numeric(10, 2), nullable=False)
    )
    currency: str = Field(default="USD")
    rate: Decimal | None = Field(
        default=None, sa_column=Column(Numeric(18, 8), nullable=True)
    )
    source: str | None = Field(default=None, nullable=True)
    checkout_url: str | None = Field(default=None, nullable=True)

    # Discount tracking
    coupon_id: uuid.UUID | None = Field(
        default=None, foreign_key="coupons.id", nullable=True, index=True
    )
    coupon_code: str | None = Field(default=None, nullable=True)
    discount_value: Decimal | None = Field(
        default=None, sa_column=Column(Numeric(10, 2), nullable=True)
    )

    # Edit passes (for modifying existing purchases)
    edit_passes: bool = Field(default=False)

    # Group discount tracking
    group_id: uuid.UUID | None = Field(
        default=None, foreign_key="groups.id", nullable=True, index=True
    )


# ========================
# Request/Response Schemas
# ========================


class PaymentProductRequest(BaseModel):
    """Product selection for payment."""

    product_id: uuid.UUID
    attendee_id: uuid.UUID
    quantity: int = 1


class PaymentProductResponse(BaseModel):
    """Payment product snapshot in response."""

    product_id: uuid.UUID
    attendee_id: uuid.UUID
    quantity: int
    product_name: str
    product_description: str | None = None
    product_price: Decimal
    product_category: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PaymentCreate(BaseModel):
    """Schema for creating a payment."""

    application_id: uuid.UUID
    products: list[PaymentProductRequest]
    coupon_code: str | None = None
    edit_passes: bool = False

    @field_validator("products", mode="before")
    @classmethod
    def validate_products(
        cls,
        v: list[PaymentProductRequest],
    ) -> list[PaymentProductRequest]:
        if not v:
            raise ValueError("At least one product must be selected")
        return v


class PaymentPreview(BaseModel):
    """Schema for payment preview (before creating)."""

    application_id: uuid.UUID
    products: list[PaymentProductRequest]
    original_amount: Decimal
    amount: Decimal
    currency: str = "USD"
    edit_passes: bool = False

    # Discount info
    coupon_id: uuid.UUID | None = None
    coupon_code: str | None = None
    discount_value: Decimal | None = None
    group_id: uuid.UUID | None = None

    # Payment provider response (populated on creation)
    status: str | None = None
    external_id: str | None = None
    checkout_url: str | None = None


class PaymentPublic(PaymentBase):
    """Payment schema for API responses."""

    id: uuid.UUID
    products_snapshot: list[PaymentProductResponse] = []
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class PaymentUpdate(BaseModel):
    """Schema for updating a payment (mainly status updates)."""

    status: PaymentStatus | None = None
    external_id: str | None = None
    source: PaymentSource | None = None
    rate: Decimal | None = None
    currency: str | None = None


class PaymentFilter(BaseModel):
    """Filters for payment queries."""

    application_id: uuid.UUID | None = None
    external_id: str | None = None
    status: PaymentStatus | None = None


# ========================
# SimpleFI Webhook Schemas
# ========================


class SimpleFICardPayment(BaseModel):
    """Card payment info from SimpleFI."""

    provider: str
    status: str
    coin: str = "USD"


class SimpleFIPriceDetails(BaseModel):
    """Price details for a SimpleFI transaction."""

    currency: str
    final_amount: float
    rate: float


class SimpleFITransaction(BaseModel):
    """Transaction details from SimpleFI."""

    id: str
    coin: str
    chain_id: int
    status: str
    price_details: SimpleFIPriceDetails


class SimpleFIPaymentInfo(BaseModel):
    """Payment info from SimpleFI."""

    coin: str
    hash: str
    amount: float
    paid_at: datetime


class SimpleFIPaymentRequest(BaseModel):
    """Payment request details from SimpleFI."""

    id: str
    order_id: int
    amount: float
    amount_paid: float
    currency: str
    reference: dict
    status: str
    status_detail: str
    transactions: list[SimpleFITransaction]
    card_payment: SimpleFICardPayment | None = None
    payments: list[SimpleFIPaymentInfo]


class SimpleFIData(BaseModel):
    """Data payload from SimpleFI webhook."""

    payment_request: SimpleFIPaymentRequest
    new_payment: SimpleFIPaymentInfo | SimpleFICardPayment | None = None


class SimpleFIWebhookPayload(BaseModel):
    """SimpleFI webhook payload schema."""

    id: str
    event_type: str
    entity_type: str
    entity_id: str
    data: SimpleFIData
