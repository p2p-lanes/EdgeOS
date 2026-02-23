from decimal import Decimal

from pydantic import BaseModel


class ApplicationStats(BaseModel):
    """Statistics for applications."""

    total: int = 0
    draft: int = 0
    in_review: int = 0
    accepted: int = 0
    rejected: int = 0
    withdrawn: int = 0


class AttendeeStats(BaseModel):
    """Statistics for attendees."""

    total: int = 0
    main: int = 0
    spouse: int = 0
    kid: int = 0


class PaymentStats(BaseModel):
    """Statistics for payments."""

    total: int = 0
    pending: int = 0
    approved: int = 0
    rejected: int = 0
    expired: int = 0
    cancelled: int = 0
    # Revenue metrics
    total_revenue: Decimal = Decimal("0")
    pending_revenue: Decimal = Decimal("0")
    approved_revenue: Decimal = Decimal("0")
    total_discounts: Decimal = Decimal("0")


class RecentActivity(BaseModel):
    """Recent activity item."""

    type: str  # "application", "attendee", "payment"
    description: str
    timestamp: str


class DashboardStats(BaseModel):
    """Complete dashboard statistics."""

    applications: ApplicationStats
    attendees: AttendeeStats
    payments: PaymentStats
