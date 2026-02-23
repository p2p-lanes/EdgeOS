from sqlmodel import SQLModel

# Application & Attendee models
from app.api.application.models import Applications, ApplicationSnapshots
from app.api.application.schemas import (
    ApplicationCreate,
    ApplicationPublic,
    ApplicationSnapshotPublic,
    ApplicationUpdate,
)
from app.api.application_review.models import ApplicationReviews
from app.api.application_review.schemas import (
    ApplicationReviewCreate,
    ApplicationReviewPublic,
    ReviewDecision,
)
from app.api.approval_strategy.models import ApprovalStrategies
from app.api.approval_strategy.schemas import (
    ApprovalStrategyCreate,
    ApprovalStrategyPublic,
    ApprovalStrategyType,
    ApprovalStrategyUpdate,
)
from app.api.attendee.models import AttendeeProducts, Attendees
from app.api.attendee.schemas import AttendeeCreate, AttendeePublic, AttendeeUpdate

# Auth
from app.api.auth.pending_human_models import PendingHumans
from app.api.check_in.models import CheckIns
from app.api.check_in.schemas import CheckInCreate, CheckInPublic, CheckInUpdate
from app.api.coupon.models import Coupons
from app.api.coupon.schemas import CouponCreate, CouponPublic, CouponUpdate

# Email templates
from app.api.email_template.models import EmailTemplates
from app.api.email_template.schemas import (
    EmailTemplateCreate,
    EmailTemplatePublic,
    EmailTemplateType,
    EmailTemplateUpdate,
)

# Form fields
from app.api.form_field.models import FormFields
from app.api.form_field.schemas import FormFieldCreate, FormFieldPublic, FormFieldUpdate

# Group models
from app.api.group.models import (
    GroupLeaders,
    GroupMembers,
    GroupProducts,
    Groups,
    GroupWhitelistedEmails,
)
from app.api.group.schemas import GroupCreate, GroupPublic, GroupUpdate

# Core models
from app.api.human.models import Humans
from app.api.human.schemas import HumanCreate, HumanPublic, HumanUpdate

# Payment models
from app.api.payment.models import PaymentProducts, Payments
from app.api.payment.schemas import PaymentCreate, PaymentPublic, PaymentUpdate
from app.api.popup.models import Popups
from app.api.popup.schemas import PopupCreate, PopupPublic, PopupUpdate
from app.api.popup_reviewer.models import PopupReviewers
from app.api.popup_reviewer.schemas import (
    PopupReviewerCreate,
    PopupReviewerPublic,
    PopupReviewerUpdate,
)
from app.api.product.models import Products
from app.api.product.schemas import ProductCreate, ProductPublic, ProductUpdate
from app.api.tenant.credential_models import TenantCredentials
from app.api.tenant.models import Tenants
from app.api.tenant.schemas import TenantCreate, TenantPublic, TenantUpdate
from app.api.user.models import Users
from app.api.user.schemas import UserCreate, UserPublic, UserUpdate

__all__ = [
    "SQLModel",
    # Auth
    "PendingHumans",
    # Core models
    "Humans",
    "HumanCreate",
    "HumanPublic",
    "HumanUpdate",
    "Popups",
    "PopupCreate",
    "PopupPublic",
    "PopupUpdate",
    "TenantCredentials",
    "Tenants",
    "TenantCreate",
    "TenantPublic",
    "TenantUpdate",
    "Users",
    "UserCreate",
    "UserPublic",
    "UserUpdate",
    # Product & Coupon
    "Products",
    "ProductCreate",
    "ProductPublic",
    "ProductUpdate",
    "Coupons",
    "CouponCreate",
    "CouponPublic",
    "CouponUpdate",
    # Email templates
    "EmailTemplates",
    "EmailTemplateCreate",
    "EmailTemplatePublic",
    "EmailTemplateType",
    "EmailTemplateUpdate",
    # Form fields
    "FormFields",
    "FormFieldCreate",
    "FormFieldPublic",
    "FormFieldUpdate",
    # Groups
    "Groups",
    "GroupLeaders",
    "GroupMembers",
    "GroupProducts",
    "GroupWhitelistedEmails",
    "GroupCreate",
    "GroupPublic",
    "GroupUpdate",
    # Application & Attendee
    "Applications",
    "ApplicationSnapshots",
    "ApplicationCreate",
    "ApplicationPublic",
    "ApplicationSnapshotPublic",
    "ApplicationUpdate",
    "Attendees",
    "AttendeeProducts",
    "AttendeeCreate",
    "AttendeePublic",
    "AttendeeUpdate",
    # Check-ins
    "CheckIns",
    "CheckInCreate",
    "CheckInPublic",
    "CheckInUpdate",
    # Payments
    "Payments",
    "PaymentProducts",
    "PaymentCreate",
    "PaymentPublic",
    "PaymentUpdate",
    # Approval system
    "ApprovalStrategies",
    "ApprovalStrategyCreate",
    "ApprovalStrategyPublic",
    "ApprovalStrategyType",
    "ApprovalStrategyUpdate",
    "PopupReviewers",
    "PopupReviewerCreate",
    "PopupReviewerPublic",
    "PopupReviewerUpdate",
    "ApplicationReviews",
    "ApplicationReviewCreate",
    "ApplicationReviewPublic",
    "ReviewDecision",
]
