import uuid
from decimal import Decimal

from fastapi import APIRouter, Query
from sqlalchemy import func
from sqlmodel import select

from app.api.application.models import Applications
from app.api.application.schemas import ApplicationStatus
from app.api.attendee.models import Attendees
from app.api.attendee.schemas import AttendeeCategory
from app.api.dashboard.schemas import (
    ApplicationStats,
    AttendeeStats,
    DashboardStats,
    PaymentStats,
)
from app.api.payment.models import Payments
from app.api.payment.schemas import PaymentStatus
from app.core.dependencies.users import CurrentUser, TenantSession

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    db: TenantSession,
    _: CurrentUser,
    popup_id: uuid.UUID = Query(..., description="Popup ID to get stats for"),
) -> DashboardStats:
    """Get registration statistics for a popup.

    Returns aggregated statistics for applications, attendees, and payments
    in a single API call for efficient dashboard rendering.
    """
    # Get application statistics
    application_stats = _get_application_stats(db, popup_id)

    # Get attendee statistics
    attendee_stats = _get_attendee_stats(db, popup_id)

    # Get payment statistics
    payment_stats = _get_payment_stats(db, popup_id)

    return DashboardStats(
        applications=application_stats,
        attendees=attendee_stats,
        payments=payment_stats,
    )


def _get_application_stats(db: TenantSession, popup_id: uuid.UUID) -> ApplicationStats:
    """Get application statistics for a popup."""
    # Get counts by status
    status_counts = db.exec(
        select(Applications.status, func.count(Applications.id))
        .where(Applications.popup_id == popup_id)
        .group_by(Applications.status)
    ).all()

    stats = ApplicationStats()
    for status_value, count in status_counts:
        stats.total += count
        if status_value == ApplicationStatus.DRAFT.value:
            stats.draft = count
        elif status_value == ApplicationStatus.IN_REVIEW.value:
            stats.in_review = count
        elif status_value == ApplicationStatus.ACCEPTED.value:
            stats.accepted = count
        elif status_value == ApplicationStatus.REJECTED.value:
            stats.rejected = count
        elif status_value == ApplicationStatus.WITHDRAWN.value:
            stats.withdrawn = count

    return stats


def _get_attendee_stats(db: TenantSession, popup_id: uuid.UUID) -> AttendeeStats:
    """Get attendee statistics for a popup."""
    # Get attendees through applications for this popup
    category_counts = db.exec(
        select(Attendees.category, func.count(Attendees.id))
        .join(Applications, Attendees.application_id == Applications.id)
        .where(Applications.popup_id == popup_id)
        .group_by(Attendees.category)
    ).all()

    stats = AttendeeStats()
    for category_value, count in category_counts:
        stats.total += count
        if category_value == AttendeeCategory.MAIN.value:
            stats.main = count
        elif category_value == AttendeeCategory.SPOUSE.value:
            stats.spouse = count
        elif category_value == AttendeeCategory.KID.value:
            stats.kid = count

    return stats


def _get_payment_stats(db: TenantSession, popup_id: uuid.UUID) -> PaymentStats:
    """Get payment statistics for a popup."""
    # Get payments through applications for this popup
    # Using raw SQL for aggregation to get both count and sum
    payment_data = db.exec(
        select(
            Payments.status,
            func.count(Payments.id),
            func.coalesce(func.sum(Payments.amount), Decimal("0")),
            func.coalesce(func.sum(Payments.discount_value), Decimal("0")),
        )
        .join(Applications, Payments.application_id == Applications.id)
        .where(Applications.popup_id == popup_id)
        .group_by(Payments.status)
    ).all()

    stats = PaymentStats()
    for status_value, count, amount_sum, discount_sum in payment_data:
        stats.total += count
        stats.total_revenue += amount_sum
        stats.total_discounts += discount_sum

        if status_value == PaymentStatus.PENDING.value:
            stats.pending = count
            stats.pending_revenue = amount_sum
        elif status_value == PaymentStatus.APPROVED.value:
            stats.approved = count
            stats.approved_revenue = amount_sum
        elif status_value == PaymentStatus.REJECTED.value:
            stats.rejected = count
        elif status_value == PaymentStatus.EXPIRED.value:
            stats.expired = count
        elif status_value == PaymentStatus.CANCELLED.value:
            stats.cancelled = count

    return stats
