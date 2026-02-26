import uuid

from fastapi import APIRouter, HTTPException, status
from sqlmodel import select

from app.api.application_review.crud import application_reviews_crud
from app.api.application_review.schemas import (
    ApplicationReviewCreate,
    ApplicationReviewPublic,
    ReviewDecision,
    ReviewSummary,
)
from app.api.shared.enums import UserRole
from app.api.shared.response import ListModel, PaginationLimit, PaginationSkip, Paging
from app.api.user.models import Users
from app.core.db import engine
from app.core.dependencies.users import CurrentUser, CurrentWriter, TenantSession

router = APIRouter(prefix="/applications", tags=["application-reviews"])


def _review_to_public(
    review, reviewer_email: str | None = None, reviewer_full_name: str | None = None
) -> ApplicationReviewPublic:
    """Convert review to public schema with reviewer details.

    Reviewer details are passed explicitly to avoid accessing the users table
    through the relationship, which tenant credentials don't have access to.
    """
    return ApplicationReviewPublic(
        id=review.id,
        application_id=review.application_id,
        reviewer_id=review.reviewer_id,
        tenant_id=review.tenant_id,
        decision=review.decision,
        notes=review.notes,
        created_at=review.created_at,
        updated_at=review.updated_at,
        reviewer_email=reviewer_email,
        reviewer_full_name=reviewer_full_name,
    )


def _get_reviewer_details(reviewer_ids: list[uuid.UUID]) -> dict[uuid.UUID, Users]:
    """Fetch reviewer details from users table using main engine.

    Tenant sessions don't have access to the users table, so we use
    the main engine to fetch reviewer details.
    """
    if not reviewer_ids:
        return {}

    from sqlalchemy import Column
    from sqlmodel import Session

    with Session(engine) as session:
        id_col: Column = Users.id  # ty:ignore[invalid-assignment]
        statement = select(Users).where(id_col.in_(reviewer_ids))
        users = session.exec(statement).all()
        return {user.id: user for user in users}


def _reviews_to_public_list(reviews: list) -> list[ApplicationReviewPublic]:
    """Convert multiple reviews to public schema, fetching reviewer details in batch."""
    if not reviews:
        return []

    reviewer_ids = [r.reviewer_id for r in reviews]
    reviewers = _get_reviewer_details(reviewer_ids)

    return [
        _review_to_public(
            r,
            reviewer_email=reviewers.get(r.reviewer_id, Users()).email,
            reviewer_full_name=reviewers.get(r.reviewer_id, Users()).full_name,
        )
        for r in reviews
    ]


@router.get(
    "/{application_id}/reviews", response_model=ListModel[ApplicationReviewPublic]
)
async def list_reviews(
    application_id: uuid.UUID,
    db: TenantSession,
    _: CurrentUser,
    skip: PaginationSkip = 0,
    limit: PaginationLimit = 100,
) -> ListModel[ApplicationReviewPublic]:
    """List reviews for an application."""
    from app.api.application.crud import applications_crud

    # Verify application exists
    application = applications_crud.get(db, application_id)
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    reviews, total = application_reviews_crud.find_by_application(
        db, application_id, skip, limit
    )

    return ListModel[ApplicationReviewPublic](
        results=_reviews_to_public_list(reviews),
        paging=Paging(offset=skip, limit=limit, total=total),
    )


@router.get("/{application_id}/reviews/summary", response_model=ReviewSummary)
async def get_review_summary(
    application_id: uuid.UUID,
    db: TenantSession,
    _: CurrentUser,
) -> ReviewSummary:
    """Get a summary of reviews for an application."""
    from app.api.application.crud import applications_crud
    from app.api.approval_strategy.crud import approval_strategies_crud
    from app.api.approval_strategy.schemas import ApprovalStrategyType

    # Verify application exists
    application = applications_crud.get(db, application_id)
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    # Get reviews for display and counts using SQL aggregation
    reviews = application_reviews_crud.find_all_by_application(db, application_id)
    counts = application_reviews_crud.count_by_decision(db, application_id)

    # Calculate weighted score using SQL aggregation if applicable
    weighted_score = None
    strategy = approval_strategies_crud.get_by_popup(db, application.popup_id)
    if strategy and strategy.strategy_type == ApprovalStrategyType.WEIGHTED:
        weighted_score = application_reviews_crud.calculate_weighted_score(
            db,
            application_id,
            strong_yes_weight=strategy.strong_yes_weight,
            yes_weight=strategy.yes_weight,
            no_weight=strategy.no_weight,
            strong_no_weight=strategy.strong_no_weight,
        )

    return ReviewSummary(
        total_reviews=len(reviews),
        strong_yes_count=counts[ReviewDecision.STRONG_YES],
        yes_count=counts[ReviewDecision.YES],
        no_count=counts[ReviewDecision.NO],
        strong_no_count=counts[ReviewDecision.STRONG_NO],
        weighted_score=weighted_score,
        reviews=_reviews_to_public_list(reviews),
    )


@router.post(
    "/{application_id}/reviews",
    response_model=ApplicationReviewPublic,
    status_code=status.HTTP_201_CREATED,
)
async def submit_review(
    application_id: uuid.UUID,
    review_in: ApplicationReviewCreate,
    db: TenantSession,
    current_user: CurrentWriter,
) -> ApplicationReviewPublic:
    """Submit or update a review for an application.

    If the reviewer has already reviewed this application, their review is updated.
    After submitting, the application status is recalculated based on the approval strategy.
    """
    from app.api.application.crud import applications_crud
    from app.api.application.schemas import ApplicationStatus
    from app.services.approval.calculator import approval_calculator

    # Verify application exists
    application = applications_crud.get(db, application_id)
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    # Prevent reviewing draft applications - they must be submitted first
    if application.status == ApplicationStatus.DRAFT.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot review a draft application. The applicant must submit it first.",
        )

    # Get tenant_id
    tenant_id = current_user.tenant_id
    if current_user.role == UserRole.SUPERADMIN:
        tenant_id = application.tenant_id

    if not tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User has no tenant assigned",
        )

    # Create or update the review
    review = application_reviews_crud.upsert_review(
        db, application_id, current_user.id, tenant_id, review_in
    )

    # Recalculate application status based on strategy
    approval_calculator.recalculate_status(db, application)

    return _review_to_public(review, current_user.email, current_user.full_name)


@router.get("/pending-review", response_model=ListModel)
async def list_pending_reviews(
    db: TenantSession,
    current_user: CurrentWriter,
    popup_id: uuid.UUID | None = None,
    skip: PaginationSkip = 0,
    limit: PaginationLimit = 100,
):
    """List applications pending review by the current user.

    Returns IN_REVIEW applications the user has not yet reviewed.
    If the user is a designated reviewer, scopes to their assigned popups.
    Otherwise (admin without reviewer assignment), returns all IN_REVIEW
    applications they haven't reviewed yet.
    """
    from app.api.application.crud import applications_crud
    from app.api.application.schemas import ApplicationPublic, ApplicationStatus
    from app.api.popup_reviewer.crud import popup_reviewers_crud

    reviewer_assignments = popup_reviewers_crud.find_by_user(db, current_user.id)

    if reviewer_assignments:
        popup_ids = [r.popup_id for r in reviewer_assignments]
        if popup_id and popup_id in popup_ids:
            popup_ids = [popup_id]
        elif popup_id:
            return ListModel(
                results=[],
                paging=Paging(offset=skip, limit=limit, total=0),
            )

        candidates = []
        for pid in popup_ids:
            apps, _ = applications_crud.find_by_popup(
                db, pid, limit=1000, status_filter=ApplicationStatus.IN_REVIEW
            )
            candidates.extend(apps)
    else:
        candidates, _ = applications_crud.find_by_status(
            db,
            status_filter=ApplicationStatus.IN_REVIEW,
            popup_id=popup_id,
            limit=1000,
        )

    pending_apps = []
    for app in candidates:
        existing_review = application_reviews_crud.get_by_application_reviewer(
            db, app.id, current_user.id
        )
        if not existing_review:
            pending_apps.append(app)

    total = len(pending_apps)
    paginated = pending_apps[skip : skip + limit]

    return ListModel(
        results=[ApplicationPublic.model_validate(a) for a in paginated],
        paging=Paging(offset=skip, limit=limit, total=total),
    )


@router.get("/my-reviews", response_model=ListModel[ApplicationReviewPublic])
async def list_my_reviews(
    db: TenantSession,
    current_user: CurrentWriter,
    skip: PaginationSkip = 0,
    limit: PaginationLimit = 100,
) -> ListModel[ApplicationReviewPublic]:
    """List reviews submitted by the current user."""

    reviews, total = application_reviews_crud.find_by_reviewer(
        db, current_user.id, skip, limit
    )

    return ListModel[ApplicationReviewPublic](
        results=[_review_to_public(r) for r in reviews],
        paging=Paging(offset=skip, limit=limit, total=total),
    )
