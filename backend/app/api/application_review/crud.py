import uuid
from datetime import UTC, datetime

from sqlmodel import Session, func, select

from app.api.application_review.models import ApplicationReviews
from app.api.application_review.schemas import (
    ApplicationReviewCreate,
    ApplicationReviewUpdate,
    ReviewDecision,
)
from app.api.shared.crud import BaseCRUD


class ApplicationReviewsCRUD(
    BaseCRUD[ApplicationReviews, ApplicationReviewCreate, ApplicationReviewUpdate]
):
    """CRUD operations for ApplicationReviews."""

    def __init__(self) -> None:
        super().__init__(ApplicationReviews)

    def get_by_application_reviewer(
        self, session: Session, application_id: uuid.UUID, reviewer_id: uuid.UUID
    ) -> ApplicationReviews | None:
        """Get review by application and reviewer."""
        statement = select(ApplicationReviews).where(
            ApplicationReviews.application_id == application_id,
            ApplicationReviews.reviewer_id == reviewer_id,
        )
        return session.exec(statement).first()

    def find_by_application(
        self,
        session: Session,
        application_id: uuid.UUID,
        skip: int = 0,
        limit: int = 100,
    ) -> tuple[list[ApplicationReviews], int]:
        """Find all reviews for an application."""
        statement = select(ApplicationReviews).where(
            ApplicationReviews.application_id == application_id
        )

        count_statement = select(func.count()).select_from(statement.subquery())
        total = session.exec(count_statement).one()

        statement = statement.offset(skip).limit(limit)
        results = list(session.exec(statement).all())

        return results, total

    def find_by_reviewer(
        self,
        session: Session,
        reviewer_id: uuid.UUID,
        skip: int = 0,
        limit: int = 100,
    ) -> tuple[list[ApplicationReviews], int]:
        """Find all reviews by a reviewer."""
        statement = select(ApplicationReviews).where(
            ApplicationReviews.reviewer_id == reviewer_id
        )

        count_statement = select(func.count()).select_from(statement.subquery())
        total = session.exec(count_statement).one()

        statement = statement.offset(skip).limit(limit)
        results = list(session.exec(statement).all())

        return results, total

    def create_review(
        self,
        session: Session,
        application_id: uuid.UUID,
        reviewer_id: uuid.UUID,
        tenant_id: uuid.UUID,
        review_in: ApplicationReviewCreate,
    ) -> ApplicationReviews:
        """Create a new review."""
        db_obj = ApplicationReviews(
            application_id=application_id,
            reviewer_id=reviewer_id,
            tenant_id=tenant_id,
            decision=review_in.decision,
            notes=review_in.notes,
        )
        session.add(db_obj)
        session.commit()
        session.refresh(db_obj)
        return db_obj

    def upsert_review(
        self,
        session: Session,
        application_id: uuid.UUID,
        reviewer_id: uuid.UUID,
        tenant_id: uuid.UUID,
        review_in: ApplicationReviewCreate,
    ) -> ApplicationReviews:
        """Create or update a review (reviewers can change their decision)."""
        existing = self.get_by_application_reviewer(
            session, application_id, reviewer_id
        )

        if existing:
            existing.decision = review_in.decision
            if review_in.notes is not None:
                existing.notes = review_in.notes
            existing.updated_at = datetime.now(UTC)
            session.add(existing)
            session.commit()
            session.refresh(existing)
            return existing

        return self.create_review(
            session, application_id, reviewer_id, tenant_id, review_in
        )

    def count_by_decision(
        self,
        session: Session,
        application_id: uuid.UUID,
    ) -> dict[ReviewDecision, int]:
        """Count reviews by decision type for an application using GROUP BY."""
        statement = (
            select(ApplicationReviews.decision, func.count())
            .where(ApplicationReviews.application_id == application_id)
            .group_by(ApplicationReviews.decision)
        )
        results = session.exec(statement).all()

        # Initialize all decisions to 0, then update with actual counts
        counts = dict.fromkeys(ReviewDecision, 0)
        for decision, count in results:
            counts[decision] = count

        return counts

    def calculate_weighted_score(
        self,
        session: Session,
        application_id: uuid.UUID,
        strong_yes_weight: int,
        yes_weight: int,
        no_weight: int,
        strong_no_weight: int,
    ) -> int:
        """Calculate weighted score for an application using SQL aggregation.

        This avoids fetching all reviews into Python - the calculation is done
        entirely in the database using CASE WHEN expressions.
        """
        from sqlalchemy import case, literal

        score_case = case(
            (  # ty: ignore[invalid-argument-type]
                ApplicationReviews.decision == ReviewDecision.STRONG_YES,
                literal(strong_yes_weight),
            ),
            (  # ty: ignore[invalid-argument-type]
                ApplicationReviews.decision == ReviewDecision.YES,
                literal(yes_weight),
            ),
            (  # ty: ignore[invalid-argument-type]
                ApplicationReviews.decision == ReviewDecision.NO,
                literal(no_weight),
            ),
            (  # ty: ignore[invalid-argument-type]
                ApplicationReviews.decision == ReviewDecision.STRONG_NO,
                literal(strong_no_weight),
            ),
            else_=literal(0),
        )

        statement = select(func.coalesce(func.sum(score_case), 0)).where(
            ApplicationReviews.application_id == application_id
        )
        return session.exec(statement).one()

    def find_all_by_application(
        self,
        session: Session,
        application_id: uuid.UUID,
    ) -> list[ApplicationReviews]:
        """Find all reviews for an application without pagination.

        Use this when you need all reviews (e.g., for approval calculation).
        For paginated results, use find_by_application() instead.
        """
        statement = select(ApplicationReviews).where(
            ApplicationReviews.application_id == application_id
        )
        return list(session.exec(statement).all())


application_reviews_crud = ApplicationReviewsCRUD()
