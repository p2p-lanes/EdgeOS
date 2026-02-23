import uuid
from typing import Any

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr

from app.api.email_template import crud
from app.api.email_template.schemas import (
    EmailTemplateCreate,
    EmailTemplatePublic,
    EmailTemplateType,
    EmailTemplateUpdate,
)
from app.api.shared.enums import UserRole
from app.api.shared.response import ListModel, PaginationLimit, PaginationSkip, Paging
from app.core.dependencies.users import CurrentUser, CurrentWriter, TenantSession

router = APIRouter(prefix="/email-templates", tags=["email-templates"])


# =========================================================================
# Static routes (MUST be before /{template_id} to avoid path conflicts)
# =========================================================================


class TemplateVariable(BaseModel):
    name: str
    label: str | None = None
    type: str
    description: str
    required: bool = True
    group: str | None = None


class TemplateTypeInfo(BaseModel):
    type: str
    label: str
    description: str
    category: str
    default_subject: str
    variables: list[TemplateVariable]


class PreviewRequest(BaseModel):
    html_content: str
    template_type: str
    subject: str | None = None
    preview_variables: dict[str, Any] | None = None


class PreviewResponse(BaseModel):
    rendered_html: str
    rendered_subject: str | None = None


class SendTestRequest(BaseModel):
    html_content: str
    template_type: str
    subject: str | None = None
    to_email: EmailStr
    custom_variables: dict[str, Any] | None = None


@router.get("/types", response_model=list[TemplateTypeInfo])
async def list_template_types(
    _: CurrentUser,
) -> list[TemplateTypeInfo]:
    from app.services.email.templates import TEMPLATE_TYPE_METADATA

    return [TemplateTypeInfo(**meta) for meta in TEMPLATE_TYPE_METADATA]


@router.get("/default/{template_type}")
async def get_default_template(
    template_type: EmailTemplateType,
    _: CurrentUser,
) -> dict[str, str]:
    from app.services.email.templates import flatten_template

    html = flatten_template(template_type)
    return {"html_content": html}


@router.post("/preview", response_model=PreviewResponse)
async def preview_template(
    body: PreviewRequest,
    _: CurrentUser,
) -> PreviewResponse:
    try:
        EmailTemplateType(body.template_type)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid template type: {body.template_type}",
        )

    variables = body.preview_variables or {}

    from app.services.email.service import get_email_service

    service = get_email_service()

    try:
        rendered_html = service.render_preview_template(body.html_content, variables)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Template rendering error: {e}",
        )

    rendered_subject = None
    if body.subject:
        from jinja2.sandbox import SandboxedEnvironment

        from app.services.email.templates import PreservingUndefined

        env = SandboxedEnvironment(undefined=PreservingUndefined)
        rendered_subject = env.from_string(body.subject).render(**variables)

    return PreviewResponse(
        rendered_html=rendered_html, rendered_subject=rendered_subject
    )


@router.post("/send-test", status_code=status.HTTP_200_OK)
async def send_test_email(
    body: SendTestRequest,
    _: CurrentWriter,
) -> dict[str, str]:
    try:
        EmailTemplateType(body.template_type)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid template type: {body.template_type}",
        )

    variables = body.custom_variables or {}

    from app.services.email.service import get_email_service

    service = get_email_service()

    try:
        rendered_html = service.render_preview_template(body.html_content, variables)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Template rendering error: {e}",
        )

    rendered_subject = body.subject or "Test Email"
    if body.subject:
        from jinja2.sandbox import SandboxedEnvironment

        from app.services.email.templates import PreservingUndefined

        env = SandboxedEnvironment(undefined=PreservingUndefined)
        rendered_subject = env.from_string(body.subject).render(**variables)

    success = await service.send_email(
        to=body.to_email,
        subject=f"[TEST] {rendered_subject}",
        html_content=rendered_html,
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send test email",
        )

    return {"message": f"Test email sent to {body.to_email}"}


# =========================================================================
# CRUD routes
# =========================================================================


@router.get("", response_model=ListModel[EmailTemplatePublic])
async def list_email_templates(
    db: TenantSession,
    _: CurrentUser,
    popup_id: uuid.UUID | None = None,
    skip: PaginationSkip = 0,
    limit: PaginationLimit = 100,
) -> ListModel[EmailTemplatePublic]:
    if popup_id:
        templates, total = crud.email_template_crud.find_by_popup(
            db, popup_id=popup_id, skip=skip, limit=limit
        )
    else:
        templates, total = crud.email_template_crud.find(db, skip=skip, limit=limit)

    return ListModel[EmailTemplatePublic](
        results=[EmailTemplatePublic.model_validate(t) for t in templates],
        paging=Paging(offset=skip, limit=limit, total=total),
    )


@router.get("/{template_id}", response_model=EmailTemplatePublic)
async def get_email_template(
    template_id: uuid.UUID,
    db: TenantSession,
    _: CurrentUser,
) -> EmailTemplatePublic:
    template = crud.email_template_crud.get(db, template_id)

    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email template not found",
        )

    return EmailTemplatePublic.model_validate(template)


@router.post(
    "", response_model=EmailTemplatePublic, status_code=status.HTTP_201_CREATED
)
async def create_email_template(
    template_in: EmailTemplateCreate,
    db: TenantSession,
    current_user: CurrentWriter,
) -> EmailTemplatePublic:
    # Validate template_type
    try:
        EmailTemplateType(template_in.template_type)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid template type: {template_in.template_type}",
        )

    # Check uniqueness
    existing = crud.email_template_crud.get_by_popup_and_type(
        db, template_in.popup_id, template_in.template_type
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A template for this type already exists in this popup",
        )

    if current_user.role == UserRole.SUPERADMIN:
        from app.api.popup.crud import popups_crud

        popup = popups_crud.get(db, template_in.popup_id)
        if not popup:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Popup not found",
            )
        tenant_id = popup.tenant_id
    else:
        tenant_id = current_user.tenant_id

    from app.api.email_template.models import EmailTemplates

    template_data = template_in.model_dump()
    template_data["tenant_id"] = tenant_id
    template = EmailTemplates(**template_data)

    db.add(template)
    db.commit()
    db.refresh(template)

    return EmailTemplatePublic.model_validate(template)


@router.patch("/{template_id}", response_model=EmailTemplatePublic)
async def update_email_template(
    template_id: uuid.UUID,
    template_in: EmailTemplateUpdate,
    db: TenantSession,
    _current_user: CurrentWriter,
) -> EmailTemplatePublic:
    template = crud.email_template_crud.get(db, template_id)

    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email template not found",
        )

    updated = crud.email_template_crud.update(db, template, template_in)
    return EmailTemplatePublic.model_validate(updated)


@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_email_template(
    template_id: uuid.UUID,
    db: TenantSession,
    _current_user: CurrentWriter,
) -> None:
    template = crud.email_template_crud.get(db, template_id)

    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email template not found",
        )

    crud.email_template_crud.delete(db, template)
