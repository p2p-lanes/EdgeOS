import uuid

from fastapi import APIRouter, HTTPException, status
from sqlmodel import Session

from app.api.popup_reviewer.crud import popup_reviewers_crud
from app.api.popup_reviewer.models import PopupReviewers
from app.api.popup_reviewer.schemas import (
    PopupReviewerCreate,
    PopupReviewerPublic,
    PopupReviewerUpdate,
)
from app.api.shared.enums import UserRole
from app.api.shared.response import ListModel, PaginationLimit, PaginationSkip, Paging
from app.core.dependencies.users import (
    CurrentUser,
    CurrentWriter,
    SessionDep,
    TenantSession,
)

router = APIRouter(prefix="/popups", tags=["popup-reviewers"])


def _reviewer_to_public(
    reviewer: PopupReviewers, session: Session
) -> PopupReviewerPublic:
    """Convert reviewer to public schema with user details."""
    from app.api.user.crud import users_crud

    # Fetch user details from main session (not tenant session)
    user = users_crud.get(session, reviewer.user_id)

    return PopupReviewerPublic(
        id=reviewer.id,
        popup_id=reviewer.popup_id,
        user_id=reviewer.user_id,
        tenant_id=reviewer.tenant_id,
        is_required=reviewer.is_required,
        weight_multiplier=reviewer.weight_multiplier,
        created_at=reviewer.created_at,
        user_email=user.email if user else None,
        user_full_name=user.full_name if user else None,
    )


@router.get("/{popup_id}/reviewers", response_model=ListModel[PopupReviewerPublic])
async def list_reviewers(
    popup_id: uuid.UUID,
    db: TenantSession,
    session: SessionDep,
    _: CurrentUser,
    skip: PaginationSkip = 0,
    limit: PaginationLimit = 100,
) -> ListModel[PopupReviewerPublic]:
    """List designated reviewers for a popup."""
    from app.api.popup.crud import popups_crud

    # Verify popup exists
    popup = popups_crud.get(db, popup_id)
    if not popup:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Popup not found",
        )

    reviewers, total = popup_reviewers_crud.find_by_popup(db, popup_id, skip, limit)

    return ListModel[PopupReviewerPublic](
        results=[_reviewer_to_public(r, session) for r in reviewers],
        paging=Paging(offset=skip, limit=limit, total=total),
    )


@router.post(
    "/{popup_id}/reviewers",
    response_model=PopupReviewerPublic,
    status_code=status.HTTP_201_CREATED,
)
async def add_reviewer(
    popup_id: uuid.UUID,
    reviewer_in: PopupReviewerCreate,
    db: TenantSession,
    session: SessionDep,
    _current_user: CurrentWriter,
) -> PopupReviewerPublic:
    """Add a reviewer to a popup."""
    from app.api.popup.crud import popups_crud
    from app.api.user.crud import users_crud

    # Verify popup exists
    popup = popups_crud.get(db, popup_id)
    if not popup:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Popup not found",
        )

    # Verify user exists and has appropriate role (use main session for users table)
    user = users_crud.get(session, reviewer_in.user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Ensure user belongs to the same tenant as the popup
    if user.tenant_id != popup.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User does not belong to this tenant",
        )

    if user.role not in [UserRole.ADMIN, UserRole.SUPERADMIN]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only ADMIN or SUPERADMIN users can be reviewers",
        )

    # Check if already a reviewer
    existing = popup_reviewers_crud.get_by_popup_user(db, popup_id, reviewer_in.user_id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already a reviewer for this popup",
        )

    reviewer = popup_reviewers_crud.create_reviewer(
        db, popup_id, popup.tenant_id, reviewer_in
    )

    return _reviewer_to_public(reviewer, session)


@router.patch("/{popup_id}/reviewers/{user_id}", response_model=PopupReviewerPublic)
async def update_reviewer(
    popup_id: uuid.UUID,
    user_id: uuid.UUID,
    reviewer_in: PopupReviewerUpdate,
    db: TenantSession,
    session: SessionDep,
    _current_user: CurrentWriter,
) -> PopupReviewerPublic:
    """Update a reviewer's settings."""
    from app.api.popup.crud import popups_crud

    # Verify popup exists
    popup = popups_crud.get(db, popup_id)
    if not popup:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Popup not found",
        )

    reviewer = popup_reviewers_crud.get_by_popup_user(db, popup_id, user_id)
    if not reviewer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reviewer not found",
        )

    reviewer = popup_reviewers_crud.update(db, reviewer, reviewer_in)
    return _reviewer_to_public(reviewer, session)


@router.delete(
    "/{popup_id}/reviewers/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def remove_reviewer(
    popup_id: uuid.UUID,
    user_id: uuid.UUID,
    db: TenantSession,
    _current_user: CurrentWriter,
) -> None:
    """Remove a reviewer from a popup."""
    from app.api.popup.crud import popups_crud

    # Verify popup exists
    popup = popups_crud.get(db, popup_id)
    if not popup:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Popup not found",
        )

    reviewer = popup_reviewers_crud.get_by_popup_user(db, popup_id, user_id)
    if not reviewer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reviewer not found",
        )

    popup_reviewers_crud.delete(db, reviewer)
