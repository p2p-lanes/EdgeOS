"""
Type-safe email template context definitions.

Each Pydantic model defines the expected variables for a specific email template.
Use these types when calling EmailService.send_template_email() for IDE autocomplete.
"""

import datetime
from pathlib import Path
from typing import Any

from jinja2 import Environment, FileSystemLoader, Undefined
from pydantic import BaseModel

from app.api.email_template.schemas import EmailTemplateType

# =============================================================================
# Auth Templates
# =============================================================================


class LoginCodeUserContext(BaseModel):
    """Context for auth/login_code_user.html template.

    Used for backoffice user login verification.
    """

    user_name: str | None = None
    auth_code: str
    expiration_minutes: int = 15


class LoginCodeHumanContext(BaseModel):
    """Context for auth/login_code_human.html template.

    Used for portal/attendee login verification.
    """

    first_name: str | None = None
    auth_code: str
    expiration_minutes: int = 15


# =============================================================================
# Application Templates
# =============================================================================


class ApplicationReceivedContext(BaseModel):
    """Context for application/received.html template.

    Sent when an application is submitted for review.
    """

    first_name: str
    last_name: str
    email: str
    popup_name: str
    submitted_at: str | None = None
    portal_url: str | None = None


class ApplicationAcceptedContext(BaseModel):
    """Context for application/accepted.html template.

    Sent when an application is accepted.
    """

    first_name: str
    last_name: str
    popup_name: str
    payment_deadline: str | None = None
    discount_assigned: int | None = None
    portal_url: str | None = None


class ApplicationRejectedContext(BaseModel):
    """Context for application/rejected.html template.

    Sent when an application is not accepted.
    """

    first_name: str
    last_name: str
    popup_name: str


# =============================================================================
# Payment Templates
# =============================================================================


class PaymentProductItem(BaseModel):
    """Product item for payment email templates."""

    name: str
    price: float
    quantity: int


class PaymentAttendeeItem(BaseModel):
    """Attendee item for payment email templates."""

    name: str
    category: str
    products: list[PaymentProductItem] | None = None


class PaymentConfirmedContext(BaseModel):
    """Context for payment/confirmed.html template.

    Sent when a payment is successfully processed.
    """

    first_name: str
    popup_name: str
    payment_id: str
    amount: float
    currency: str
    products: list[PaymentProductItem] | None = None
    discount_value: int | None = None
    original_amount: float | None = None
    attendees: list[PaymentAttendeeItem] | None = None
    order_summary: str | None = None
    portal_url: str | None = None


class AbandonedCartContext(BaseModel):
    """Context for payment/abandoned_cart.html template.

    Sent when a payment is created but not completed (abandoned cart).
    """

    first_name: str
    popup_name: str
    amount: float
    currency: str
    products: list[PaymentProductItem] | None = None
    discount_value: int | None = None
    original_amount: float | None = None
    checkout_url: str | None = None
    order_summary: str | None = None


class EditPassesConfirmedContext(BaseModel):
    """Context for payment/edit_passes_confirmed.html template.

    Sent when pass modifications are processed.
    """

    first_name: str
    popup_name: str
    payment_id: str
    amount: float
    currency: str
    products: list[PaymentProductItem] | None = None
    credit_applied: float | None = None
    remaining_credit: float | None = None
    attendees: list[PaymentAttendeeItem] | None = None
    order_summary: str | None = None
    portal_url: str | None = None


# =============================================================================
# Template Name Constants
# =============================================================================


class EmailTemplates:
    """Constants for email template names.

    Use these constants instead of hardcoding template paths.
    """

    # Auth
    LOGIN_CODE_USER = "auth/login_code_user.html"
    LOGIN_CODE_HUMAN = "auth/login_code_human.html"

    # Application
    APPLICATION_RECEIVED = "application/received.html"
    APPLICATION_ACCEPTED = "application/accepted.html"
    APPLICATION_REJECTED = "application/rejected.html"

    # Payment
    PAYMENT_CONFIRMED = "payment/confirmed.html"
    ABANDONED_CART = "payment/abandoned_cart.html"
    EDIT_PASSES_CONFIRMED = "payment/edit_passes_confirmed.html"


# =============================================================================
# Template Type → File Path Mapping
# =============================================================================

TEMPLATE_TYPE_TO_FILE: dict[EmailTemplateType, str] = {
    EmailTemplateType.LOGIN_CODE_USER: "auth/login_code_user.html",
    EmailTemplateType.LOGIN_CODE_HUMAN: "auth/login_code_human.html",
    EmailTemplateType.APPLICATION_RECEIVED: "application/received.html",
    EmailTemplateType.APPLICATION_ACCEPTED: "application/accepted.html",
    EmailTemplateType.APPLICATION_REJECTED: "application/rejected.html",
    EmailTemplateType.PAYMENT_CONFIRMED: "payment/confirmed.html",
    EmailTemplateType.ABANDONED_CART: "payment/abandoned_cart.html",
    EmailTemplateType.EDIT_PASSES_CONFIRMED: "payment/edit_passes_confirmed.html",
}


# =============================================================================
# Template Type Metadata (for API /types endpoint)
# =============================================================================

_POPUP_EVENT_VARIABLES: list[dict[str, Any]] = [
    {
        "name": "popup_name",
        "label": "Name",
        "type": "string",
        "description": "Name of the event/popup",
        "required": True,
        "group": "Event",
    },
    {
        "name": "popup_image_url",
        "label": "Cover Image URL",
        "type": "string",
        "description": "Event cover image URL",
        "required": False,
        "group": "Event",
    },
    {
        "name": "popup_icon_url",
        "label": "Icon URL",
        "type": "string",
        "description": "Event icon/logo URL",
        "required": False,
        "group": "Event",
    },
    {
        "name": "popup_web_url",
        "label": "Website URL",
        "type": "string",
        "description": "Event website URL",
        "required": False,
        "group": "Event",
    },
    {
        "name": "popup_blog_url",
        "label": "Blog URL",
        "type": "string",
        "description": "Event blog URL",
        "required": False,
        "group": "Event",
    },
    {
        "name": "popup_twitter_url",
        "label": "Twitter/X URL",
        "type": "string",
        "description": "Event Twitter/X URL",
        "required": False,
        "group": "Event",
    },
    {
        "name": "popup_start_date",
        "label": "Start Date",
        "type": "string",
        "description": "Event start date",
        "required": False,
        "group": "Event",
    },
    {
        "name": "popup_end_date",
        "label": "End Date",
        "type": "string",
        "description": "Event end date",
        "required": False,
        "group": "Event",
    },
]

TEMPLATE_TYPE_METADATA: list[dict[str, Any]] = [
    # NOTE: Login code templates (LOGIN_CODE_USER, LOGIN_CODE_HUMAN) are excluded
    # because they have no popup context during auth flow and always use file-based defaults.
    {
        "type": EmailTemplateType.APPLICATION_RECEIVED,
        "label": "Application Received",
        "description": "Confirmation sent when an application is submitted.",
        "category": "Application",
        "default_subject": "Application Received for {{ popup_name }}",
        "variables": [
            {
                "name": "first_name",
                "label": "First Name",
                "type": "string",
                "description": "Applicant's first name",
                "required": True,
                "group": "Applicant",
            },
            {
                "name": "last_name",
                "label": "Last Name",
                "type": "string",
                "description": "Applicant's last name",
                "required": True,
                "group": "Applicant",
            },
            {
                "name": "email",
                "label": "Email",
                "type": "string",
                "description": "Applicant's email address",
                "required": True,
                "group": "Applicant",
            },
            {
                "name": "submitted_at",
                "label": "Submitted At",
                "type": "string",
                "description": "Submission date/time",
                "required": False,
                "group": "General",
            },
            {
                "name": "portal_url",
                "label": "Portal URL",
                "type": "string",
                "description": "Link to the attendee portal",
                "required": False,
                "group": "General",
            },
            *_POPUP_EVENT_VARIABLES,
        ],
    },
    {
        "type": EmailTemplateType.APPLICATION_ACCEPTED,
        "label": "Application Accepted",
        "description": "Sent when an application is approved.",
        "category": "Application",
        "default_subject": "Application Accepted - {{ popup_name }}",
        "variables": [
            {
                "name": "first_name",
                "label": "First Name",
                "type": "string",
                "description": "Applicant's first name",
                "required": True,
                "group": "Applicant",
            },
            {
                "name": "last_name",
                "label": "Last Name",
                "type": "string",
                "description": "Applicant's last name",
                "required": True,
                "group": "Applicant",
            },
            {
                "name": "payment_deadline",
                "label": "Payment Deadline",
                "type": "string",
                "description": "Payment deadline date",
                "required": False,
                "group": "General",
            },
            {
                "name": "discount_assigned",
                "label": "Discount",
                "type": "number",
                "description": "Discount percentage if assigned",
                "required": False,
                "group": "General",
            },
            {
                "name": "portal_url",
                "label": "Portal URL",
                "type": "string",
                "description": "Link to the attendee portal",
                "required": False,
                "group": "General",
            },
            *_POPUP_EVENT_VARIABLES,
        ],
    },
    {
        "type": EmailTemplateType.APPLICATION_REJECTED,
        "label": "Application Rejected",
        "description": "Sent when an application is not accepted.",
        "category": "Application",
        "default_subject": "Application Update - {{ popup_name }}",
        "variables": [
            {
                "name": "first_name",
                "label": "First Name",
                "type": "string",
                "description": "Applicant's first name",
                "required": True,
                "group": "Applicant",
            },
            {
                "name": "last_name",
                "label": "Last Name",
                "type": "string",
                "description": "Applicant's last name",
                "required": True,
                "group": "Applicant",
            },
            *_POPUP_EVENT_VARIABLES,
        ],
    },
    {
        "type": EmailTemplateType.PAYMENT_CONFIRMED,
        "label": "Payment Confirmed",
        "description": "Sent when a payment is successfully processed.",
        "category": "Payment",
        "default_subject": "Payment Confirmed - {{ popup_name }}",
        "variables": [
            {
                "name": "first_name",
                "label": "First Name",
                "type": "string",
                "description": "Payer's first name",
                "required": True,
                "group": "Applicant",
            },
            {
                "name": "payment_id",
                "label": "Payment ID",
                "type": "string",
                "description": "Payment reference ID",
                "required": True,
                "group": "Payment",
            },
            {
                "name": "amount",
                "label": "Amount",
                "type": "number",
                "description": "Total amount paid",
                "required": True,
                "group": "Payment",
            },
            {
                "name": "currency",
                "label": "Currency",
                "type": "string",
                "description": "Payment currency (e.g., USD)",
                "required": True,
                "group": "Payment",
            },
            {
                "name": "products",
                "label": "Products",
                "type": "array",
                "description": "List of purchased products",
                "required": False,
                "group": "Payment",
            },
            {
                "name": "discount_value",
                "label": "Discount %",
                "type": "number",
                "description": "Discount percentage applied",
                "required": False,
                "group": "Payment",
            },
            {
                "name": "original_amount",
                "label": "Original Amount",
                "type": "number",
                "description": "Amount before discount",
                "required": False,
                "group": "Payment",
            },
            {
                "name": "attendees",
                "label": "Attendees",
                "type": "array",
                "description": "List of attendees covered",
                "required": False,
                "group": "Payment",
            },
            {
                "name": "order_summary",
                "label": "Order Summary",
                "type": "string",
                "description": "Pre-rendered HTML summary of products and attendees",
                "required": False,
                "group": "Payment",
            },
            {
                "name": "portal_url",
                "label": "Portal URL",
                "type": "string",
                "description": "Link to the attendee portal",
                "required": False,
                "group": "General",
            },
            *_POPUP_EVENT_VARIABLES,
        ],
    },
    {
        "type": EmailTemplateType.ABANDONED_CART,
        "label": "Abandoned Cart",
        "description": "Sent when a payment is created but not completed (abandoned cart).",
        "category": "Payment",
        "default_subject": "Complete Your Purchase - {{ popup_name }}",
        "variables": [
            {
                "name": "first_name",
                "label": "First Name",
                "type": "string",
                "description": "Payer's first name",
                "required": True,
                "group": "Applicant",
            },
            {
                "name": "amount",
                "label": "Amount",
                "type": "number",
                "description": "Total amount due",
                "required": True,
                "group": "Payment",
            },
            {
                "name": "currency",
                "label": "Currency",
                "type": "string",
                "description": "Payment currency (e.g., USD)",
                "required": True,
                "group": "Payment",
            },
            {
                "name": "products",
                "label": "Products",
                "type": "array",
                "description": "List of products",
                "required": False,
                "group": "Payment",
            },
            {
                "name": "discount_value",
                "label": "Discount %",
                "type": "number",
                "description": "Discount percentage applied",
                "required": False,
                "group": "Payment",
            },
            {
                "name": "original_amount",
                "label": "Original Amount",
                "type": "number",
                "description": "Amount before discount",
                "required": False,
                "group": "Payment",
            },
            {
                "name": "order_summary",
                "label": "Order Summary",
                "type": "string",
                "description": "Pre-rendered HTML summary of products and attendees",
                "required": False,
                "group": "Payment",
            },
            {
                "name": "checkout_url",
                "label": "Checkout URL",
                "type": "string",
                "description": "Link to complete payment",
                "required": False,
                "group": "General",
            },
            *_POPUP_EVENT_VARIABLES,
        ],
    },
    {
        "type": EmailTemplateType.EDIT_PASSES_CONFIRMED,
        "label": "Pass Edit Confirmed",
        "description": "Sent when pass modifications are processed.",
        "category": "Payment",
        "default_subject": "Pass Changes Confirmed - {{ popup_name }}",
        "variables": [
            {
                "name": "first_name",
                "label": "First Name",
                "type": "string",
                "description": "Attendee's first name",
                "required": True,
                "group": "Applicant",
            },
            {
                "name": "payment_id",
                "label": "Payment ID",
                "type": "string",
                "description": "Payment reference ID",
                "required": True,
                "group": "Payment",
            },
            {
                "name": "amount",
                "label": "Amount",
                "type": "number",
                "description": "New total amount",
                "required": True,
                "group": "Payment",
            },
            {
                "name": "currency",
                "label": "Currency",
                "type": "string",
                "description": "Payment currency (e.g., USD)",
                "required": True,
                "group": "Payment",
            },
            {
                "name": "products",
                "label": "Products",
                "type": "array",
                "description": "Updated product list",
                "required": False,
                "group": "Payment",
            },
            {
                "name": "credit_applied",
                "label": "Credit Applied",
                "type": "number",
                "description": "Credit applied from previous payment",
                "required": False,
                "group": "Payment",
            },
            {
                "name": "remaining_credit",
                "label": "Remaining Credit",
                "type": "number",
                "description": "Remaining credit balance",
                "required": False,
                "group": "Payment",
            },
            {
                "name": "attendees",
                "label": "Attendees",
                "type": "array",
                "description": "Updated attendee list",
                "required": False,
                "group": "Payment",
            },
            {
                "name": "order_summary",
                "label": "Order Summary",
                "type": "string",
                "description": "Pre-rendered HTML summary of products and attendees",
                "required": False,
                "group": "Payment",
            },
            {
                "name": "portal_url",
                "label": "Portal URL",
                "type": "string",
                "description": "Link to the attendee portal",
                "required": False,
                "group": "General",
            },
            *_POPUP_EVENT_VARIABLES,
        ],
    },
]


# =============================================================================
# Template Flattening Utility
# =============================================================================


class PreservingUndefined(Undefined):
    """Custom Undefined that preserves Jinja2 variable syntax as {{ var_name }}.

    Used during template flattening and live preview to resolve inheritance/includes
    while keeping variables as editable placeholders.

    Handles arithmetic, string concatenation, and format filters so that
    complex template expressions (``original_amount - amount``,
    ``' ' + user_name``, ``"%.2f"|format(value)``) don't crash.
    """

    def __str__(self) -> str:
        name: str = self._undefined_name  # type: ignore[assignment]
        return "{{ " + name + " }}"

    def __iter__(self):
        return iter([])

    def __bool__(self) -> bool:
        return True

    def __getattr__(self, name: str) -> "PreservingUndefined":
        return PreservingUndefined(name=f"{self._undefined_name}.{name}")

    # String concatenation: ' ' + user_name → ' {{ user_name }}'
    def __add__(self, other: object) -> str:
        return str(self) + str(other)

    def __radd__(self, other: object) -> str:
        return str(other) + str(self)

    # Arithmetic — return 0 so expressions like `original_amount - amount`
    # resolve to a number that downstream filters (e.g. "%.2f"|format) can use.
    def __sub__(self, other: object) -> int:
        return 0

    def __rsub__(self, other: object) -> int:
        return 0

    def __mul__(self, other: object) -> int:
        return 0

    def __rmul__(self, other: object) -> int:
        return 0

    # Comparisons — return True so {% if amount > 0 %} blocks render
    def __gt__(self, other: object) -> bool:
        return True

    def __lt__(self, other: object) -> bool:
        return True

    def __ge__(self, other: object) -> bool:
        return True

    def __le__(self, other: object) -> bool:
        return True

    def __eq__(self, other: object) -> bool:
        return False

    def __ne__(self, other: object) -> bool:
        return True

    # For "%.2f"|format(value) — Python's % formatting calls float()
    def __float__(self) -> float:
        return 0.0

    def __int__(self) -> int:
        return 0


def flatten_template(template_type: EmailTemplateType) -> str:
    """Resolve template inheritance into a self-contained HTML document.

    Resolves {% extends %} and {% include %} but preserves {{ variable }}
    placeholders so users can edit them in the Monaco editor.
    """
    from app.core.config import settings

    template_dir = Path("app/templates/emails")
    file_path = TEMPLATE_TYPE_TO_FILE[template_type]

    env = Environment(
        loader=FileSystemLoader(str(template_dir)),
        undefined=PreservingUndefined,
        autoescape=False,
        trim_blocks=True,
        lstrip_blocks=True,
    )
    env.globals.update(
        {
            "project_name": settings.PROJECT_NAME,
            "current_year": datetime.datetime.now().year,
        }
    )

    template = env.get_template(file_path)
    return template.render()
