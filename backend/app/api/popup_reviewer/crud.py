import uuid

from sqlmodel import Session, select

from app.api.popup_reviewer.models import PopupReviewers
from app.api.popup_reviewer.schemas import (
    PopupReviewerCreate,
    PopupReviewerUpdate,
)
from app.api.shared.crud import BaseCRUD


class PopupReviewersCRUD(
    BaseCRUD[PopupReviewers, PopupReviewerCreate, PopupReviewerUpdate]
):
    """CRUD operations for PopupReviewers."""

    def __init__(self) -> None:
        super().__init__(PopupReviewers)

    def get_by_popup_user(
        self, session: Session, popup_id: uuid.UUID, user_id: uuid.UUID
    ) -> PopupReviewers | None:
        """Get reviewer by popup_id and user_id."""
        statement = select(PopupReviewers).where(
            PopupReviewers.popup_id == popup_id,
            PopupReviewers.user_id == user_id,
        )
        return session.exec(statement).first()

    def find_by_popup(
        self,
        session: Session,
        popup_id: uuid.UUID,
        skip: int = 0,
        limit: int = 100,
    ) -> tuple[list[PopupReviewers], int]:
        """Find all reviewers for a popup."""
        from sqlmodel import func

        statement = select(PopupReviewers).where(PopupReviewers.popup_id == popup_id)

        count_statement = select(func.count()).select_from(statement.subquery())
        total = session.exec(count_statement).one()

        statement = statement.offset(skip).limit(limit)
        results = list(session.exec(statement).all())

        return results, total

    def find_all_by_popup(
        self,
        session: Session,
        popup_id: uuid.UUID,
    ) -> list[PopupReviewers]:
        """Find all reviewers for a popup without pagination.

        Use this when you need all reviewers (e.g., for approval calculation).
        Reviewers are bounded by design (typically < 10 per popup).
        """
        statement = select(PopupReviewers).where(PopupReviewers.popup_id == popup_id)
        return list(session.exec(statement).all())

    def find_by_user(
        self,
        session: Session,
        user_id: uuid.UUID,
    ) -> list[PopupReviewers]:
        """Find all popups a user is assigned to review."""
        statement = select(PopupReviewers).where(PopupReviewers.user_id == user_id)
        return list(session.exec(statement).all())

    def create_reviewer(
        self,
        session: Session,
        popup_id: uuid.UUID,
        tenant_id: uuid.UUID,
        reviewer_in: PopupReviewerCreate,
    ) -> PopupReviewers:
        """Add a reviewer to a popup."""
        db_obj = PopupReviewers(
            popup_id=popup_id,
            tenant_id=tenant_id,
            user_id=reviewer_in.user_id,
            is_required=reviewer_in.is_required,
            weight_multiplier=reviewer_in.weight_multiplier,
        )
        session.add(db_obj)
        session.commit()
        session.refresh(db_obj)
        return db_obj


popup_reviewers_crud = PopupReviewersCRUD()
