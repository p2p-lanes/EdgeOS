from fastapi import APIRouter

from app.api import (
    application,
    application_review,
    approval_strategy,
    attendee,
    auth,
    coupon,
    dashboard,
    email_template,
    form_field,
    group,
    human,
    payment,
    popup,
    popup_reviewer,
    product,
    tenant,
    upload,
    user,
)

api_router = APIRouter()

# Core resources
api_router.include_router(user.router)
api_router.include_router(auth.router)
api_router.include_router(tenant.router)
api_router.include_router(human.router)
api_router.include_router(popup.router)

# Popup-related resources
api_router.include_router(product.router)
api_router.include_router(coupon.router)
api_router.include_router(group.router)
api_router.include_router(form_field.router)
api_router.include_router(email_template.router)

# Approval system resources (registered before application so static paths
# like /applications/pending-review are matched before /{application_id})
api_router.include_router(approval_strategy.router)
api_router.include_router(popup_reviewer.router)
api_router.include_router(application_review.router)

# Application flow resources
api_router.include_router(application.router)
api_router.include_router(attendee.router)
api_router.include_router(payment.router)

# Utility resources
api_router.include_router(upload.router)

# Dashboard
api_router.include_router(dashboard.router)
