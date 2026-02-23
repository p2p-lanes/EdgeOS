from app.services.email.service import (
    EmailService,
    compute_order_summary,
    get_email_service,
)
from app.services.email.templates import (
    AbandonedCartContext,
    ApplicationAcceptedContext,
    ApplicationReceivedContext,
    ApplicationRejectedContext,
    EditPassesConfirmedContext,
    EmailTemplates,
    LoginCodeHumanContext,
    LoginCodeUserContext,
    PaymentAttendeeItem,
    PaymentConfirmedContext,
    PaymentProductItem,
)

__all__ = [
    "EmailService",
    "get_email_service",
    # Template name constants
    "EmailTemplates",
    # Auth contexts
    "LoginCodeUserContext",
    "LoginCodeHumanContext",
    # Application contexts
    "ApplicationReceivedContext",
    "ApplicationAcceptedContext",
    "ApplicationRejectedContext",
    # Payment contexts
    "PaymentConfirmedContext",
    "AbandonedCartContext",
    "EditPassesConfirmedContext",
    "PaymentProductItem",
    "PaymentAttendeeItem",
    # Helpers
    "compute_order_summary",
]
