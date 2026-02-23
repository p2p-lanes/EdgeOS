import uuid
from typing import TYPE_CHECKING

from fastapi import APIRouter, HTTPException, status

from app.api.approval_strategy.crud import approval_strategies_crud
from app.api.approval_strategy.schemas import (
    ApprovalStrategyCreate,
    ApprovalStrategyPublic,
    ApprovalStrategyUpdate,
)
from app.api.shared.enums import UserRole
from app.core.dependencies.users import CurrentUser, CurrentWriter, TenantSession

if TYPE_CHECKING:
    from app.api.user.schemas import UserPublic

router = APIRouter(prefix="/popups", tags=["approval-strategies"])


def _get_tenant_id(
    current_user: "UserPublic", x_tenant_id: uuid.UUID | None
) -> uuid.UUID:
    """Get tenant_id from user or header."""
    if current_user.role == UserRole.SUPERADMIN:
        if x_tenant_id:
            return x_tenant_id
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="X-Tenant-Id header required for superadmin",
        )
    if current_user.tenant_id:
        return current_user.tenant_id
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="User has no tenant assigned",
    )


@router.get("/{popup_id}/approval-strategy", response_model=ApprovalStrategyPublic)
async def get_approval_strategy(
    popup_id: uuid.UUID,
    db: TenantSession,
    _: CurrentUser,
) -> ApprovalStrategyPublic:
    """Get approval strategy for a popup."""
    from app.api.popup.crud import popups_crud

    # Verify popup exists
    popup = popups_crud.get(db, popup_id)
    if not popup:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Popup not found",
        )

    strategy = approval_strategies_crud.get_by_popup(db, popup_id)
    if not strategy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Approval strategy not configured for this popup",
        )

    return ApprovalStrategyPublic.model_validate(strategy)


@router.post(
    "/{popup_id}/approval-strategy",
    response_model=ApprovalStrategyPublic,
    status_code=status.HTTP_201_CREATED,
)
async def create_or_update_approval_strategy(
    popup_id: uuid.UUID,
    strategy_in: ApprovalStrategyCreate,
    db: TenantSession,
    _current_user: CurrentWriter,
) -> ApprovalStrategyPublic:
    """Create or update approval strategy for a popup."""
    from app.api.popup.crud import popups_crud

    # Verify popup exists
    popup = popups_crud.get(db, popup_id)
    if not popup:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Popup not found",
        )

    # Check if strategy already exists
    existing = approval_strategies_crud.get_by_popup(db, popup_id)
    if existing:
        # Update existing strategy
        strategy = approval_strategies_crud.update(
            db, existing, ApprovalStrategyUpdate(**strategy_in.model_dump())
        )
    else:
        # Create new strategy
        strategy = approval_strategies_crud.create_for_popup(
            db, popup_id, popup.tenant_id, strategy_in
        )

    return ApprovalStrategyPublic.model_validate(strategy)


@router.patch("/{popup_id}/approval-strategy", response_model=ApprovalStrategyPublic)
async def update_approval_strategy(
    popup_id: uuid.UUID,
    strategy_in: ApprovalStrategyUpdate,
    db: TenantSession,
    _current_user: CurrentWriter,
) -> ApprovalStrategyPublic:
    """Update approval strategy for a popup."""
    from app.api.popup.crud import popups_crud

    # Verify popup exists
    popup = popups_crud.get(db, popup_id)
    if not popup:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Popup not found",
        )

    strategy = approval_strategies_crud.get_by_popup(db, popup_id)
    if not strategy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Approval strategy not configured for this popup",
        )

    strategy = approval_strategies_crud.update(db, strategy, strategy_in)
    return ApprovalStrategyPublic.model_validate(strategy)


@router.delete("/{popup_id}/approval-strategy", status_code=status.HTTP_204_NO_CONTENT)
async def delete_approval_strategy(
    popup_id: uuid.UUID,
    db: TenantSession,
    _current_user: CurrentWriter,
) -> None:
    """Delete approval strategy for a popup (revert to manual review)."""
    from app.api.popup.crud import popups_crud

    # Verify popup exists
    popup = popups_crud.get(db, popup_id)
    if not popup:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Popup not found",
        )

    strategy = approval_strategies_crud.get_by_popup(db, popup_id)
    if not strategy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Approval strategy not configured for this popup",
        )

    approval_strategies_crud.delete(db, strategy)
