import uuid
from typing import Annotated

from fastapi import APIRouter, Header, HTTPException, status

from app.api.approval_strategy.crud import approval_strategies_crud
from app.api.approval_strategy.schemas import (
    ApprovalStrategyCreate,
    ApprovalStrategyType,
)
from app.api.popup import crud
from app.api.popup.schemas import PopupCreate, PopupPublic, PopupStatus, PopupUpdate
from app.api.shared.enums import UserRole
from app.api.shared.response import ListModel, PaginationLimit, PaginationSkip, Paging
from app.core.dependencies.users import (
    CurrentHuman,
    CurrentUser,
    CurrentWriter,
    HumanTenantSession,
    TenantSession,
)

router = APIRouter(prefix="/popups", tags=["popups"])


@router.get("", response_model=ListModel[PopupPublic])
async def list_popups(
    db: TenantSession,
    _: CurrentUser,
    search: str | None = None,
    skip: PaginationSkip = 0,
    limit: PaginationLimit = 100,
) -> ListModel[PopupPublic]:
    popups, total = crud.find(
        db, skip=skip, limit=limit, search=search, search_fields=["name"]
    )

    return ListModel[PopupPublic](
        results=[PopupPublic.model_validate(p) for p in popups],
        paging=Paging(
            offset=skip,
            limit=limit,
            total=total,
        ),
    )


@router.get("/{popup_id}", response_model=PopupPublic)
async def get_popup(
    popup_id: uuid.UUID,
    db: TenantSession,
    _: CurrentUser,
) -> PopupPublic:
    popup = crud.get(db, popup_id)

    if not popup:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Popup not found",
        )

    return PopupPublic.model_validate(popup)


@router.post("", response_model=PopupPublic, status_code=status.HTTP_201_CREATED)
async def create_popup(
    popup_in: PopupCreate,
    db: TenantSession,
    current_user: CurrentWriter,
    x_tenant_id: Annotated[str | None, Header(alias="X-Tenant-Id")] = None,
) -> PopupPublic:
    if current_user.role == UserRole.SUPERADMIN:
        if x_tenant_id:
            popup_in.tenant_id = uuid.UUID(x_tenant_id)
        elif popup_in.tenant_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Superadmin must provide tenant_id",
            )
    else:
        popup_in.tenant_id = current_user.tenant_id

    existing = crud.get_by_slug(db, popup_in.slug)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A popup with this slug already exists",
        )

    popup = crud.create(db, popup_in)

    # Create default auto-accept approval strategy for the popup
    approval_strategies_crud.create_for_popup(
        db,
        popup_id=popup.id,
        tenant_id=popup.tenant_id,
        strategy_in=ApprovalStrategyCreate(
            strategy_type=ApprovalStrategyType.AUTO_ACCEPT
        ),
    )

    return PopupPublic.model_validate(popup)


@router.patch("/{popup_id}", response_model=PopupPublic)
async def update_popup(
    popup_id: uuid.UUID,
    popup_in: PopupUpdate,
    db: TenantSession,
    _current_user: CurrentWriter,
) -> PopupPublic:
    popup = crud.get(db, popup_id)

    if not popup:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Popup not found",
        )

    if popup_in.slug and popup_in.slug != popup.slug:
        existing = crud.get_by_slug(db, popup_in.slug)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A popup with this slug already exists",
            )

    updated = crud.update(db, popup, popup_in)
    return PopupPublic.model_validate(updated)


@router.delete("/{popup_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_popup(
    popup_id: uuid.UUID,
    db: TenantSession,
    _current_user: CurrentWriter,
) -> None:
    popup = crud.get(db, popup_id)

    if not popup:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Popup not found",
        )

    crud.delete(db, popup)


@router.get("/portal/list", response_model=list[PopupPublic])
async def list_portal_popups(
    db: HumanTenantSession,
    _: CurrentHuman,
) -> list[PopupPublic]:
    """List active popups for the current human's tenant (Portal)."""
    popups, _ = crud.find(db, status=PopupStatus.active, limit=100)
    return [PopupPublic.model_validate(p) for p in popups]


@router.get("/portal/{slug}", response_model=PopupPublic)
async def get_portal_popup(
    slug: str,
    db: HumanTenantSession,
    _: CurrentHuman,
) -> PopupPublic:
    """Get a popup by slug (Portal)."""
    popup = crud.get_by_slug(db, slug)

    if not popup or popup.status != PopupStatus.active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    return PopupPublic.model_validate(popup)
