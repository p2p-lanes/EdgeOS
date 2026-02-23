import uuid
from typing import Any

from fastapi import APIRouter, HTTPException, status

from app.api.form_field import crud
from app.api.form_field.schemas import FormFieldCreate, FormFieldPublic, FormFieldUpdate
from app.api.shared.enums import UserRole
from app.api.shared.response import ListModel, PaginationLimit, PaginationSkip, Paging
from app.core.dependencies.users import (
    CurrentHuman,
    CurrentUser,
    CurrentWriter,
    HumanTenantSession,
    TenantSession,
)

router = APIRouter(prefix="/form-fields", tags=["form-fields"])


@router.get("", response_model=ListModel[FormFieldPublic])
async def list_form_fields(
    db: TenantSession,
    _: CurrentUser,
    popup_id: uuid.UUID | None = None,
    search: str | None = None,
    skip: PaginationSkip = 0,
    limit: PaginationLimit = 100,
) -> ListModel[FormFieldPublic]:
    if popup_id:
        fields, total = crud.form_fields_crud.find_by_popup(
            db, popup_id=popup_id, skip=skip, limit=limit, search=search
        )
    else:
        fields, total = crud.form_fields_crud.find(
            db, skip=skip, limit=limit, search=search, search_fields=["label", "name"]
        )

    return ListModel[FormFieldPublic](
        results=[FormFieldPublic.model_validate(f) for f in fields],
        paging=Paging(offset=skip, limit=limit, total=total),
    )


@router.get("/{field_id}", response_model=FormFieldPublic)
async def get_form_field(
    field_id: uuid.UUID,
    db: TenantSession,
    _: CurrentUser,
) -> FormFieldPublic:
    field = crud.form_fields_crud.get(db, field_id)

    if not field:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Form field not found",
        )

    return FormFieldPublic.model_validate(field)


@router.post("", response_model=FormFieldPublic, status_code=status.HTTP_201_CREATED)
async def create_form_field(
    field_in: FormFieldCreate,
    db: TenantSession,
    current_user: CurrentWriter,
) -> FormFieldPublic:
    existing = crud.form_fields_crud.get_by_name(db, field_in.name, field_in.popup_id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A form field with this name already exists in this popup",
        )

    if current_user.role == UserRole.SUPERADMIN:
        from app.api.popup.crud import popups_crud

        popup = popups_crud.get(db, field_in.popup_id)
        if not popup:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Popup not found",
            )
        tenant_id = popup.tenant_id
    else:
        tenant_id = current_user.tenant_id

    from app.api.form_field.models import FormFields

    field_data = field_in.model_dump()
    field_data["tenant_id"] = tenant_id
    field = FormFields(**field_data)

    db.add(field)
    db.commit()
    db.refresh(field)

    return FormFieldPublic.model_validate(field)


@router.patch("/{field_id}", response_model=FormFieldPublic)
async def update_form_field(
    field_id: uuid.UUID,
    field_in: FormFieldUpdate,
    db: TenantSession,
    _current_user: CurrentWriter,
) -> FormFieldPublic:
    field = crud.form_fields_crud.get(db, field_id)

    if not field:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Form field not found",
        )

    if field_in.name and field_in.name != field.name:
        existing = crud.form_fields_crud.get_by_name(db, field_in.name, field.popup_id)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A form field with this name already exists in this popup",
            )

    updated = crud.form_fields_crud.update(db, field, field_in)
    return FormFieldPublic.model_validate(updated)


@router.delete("/{field_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_form_field(
    field_id: uuid.UUID,
    db: TenantSession,
    _current_user: CurrentWriter,
) -> None:
    field = crud.form_fields_crud.get(db, field_id)

    if not field:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Form field not found",
        )

    crud.form_fields_crud.delete(db, field)


@router.get("/schema/{popup_id}", response_model=dict[str, Any])
async def get_application_schema(
    popup_id: uuid.UUID,
    db: TenantSession,
    _: CurrentUser,
) -> dict[str, Any]:
    """Get the complete application schema for a popup.

    Returns a schema combining base application fields with
    custom form fields defined for the popup.
    """
    from app.api.popup.crud import popups_crud

    popup = popups_crud.get(db, popup_id)
    if not popup:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Popup not found",
        )

    return crud.form_fields_crud.build_schema_for_popup(db, popup_id)


@router.get("/portal/schema/{popup_id}", response_model=dict[str, Any])
async def get_portal_application_schema(
    popup_id: uuid.UUID,
    db: HumanTenantSession,
    _: CurrentHuman,
) -> dict[str, Any]:
    """Get the application form schema for a popup (Portal)."""
    from app.api.popup.crud import popups_crud

    popup = popups_crud.get(db, popup_id)
    if not popup:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Popup not found",
        )

    return crud.form_fields_crud.build_schema_for_popup(db, popup_id)
