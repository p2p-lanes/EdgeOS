import uuid
from datetime import UTC, datetime

from sqlmodel import Session, select

from app.api.approval_strategy.models import ApprovalStrategies
from app.api.approval_strategy.schemas import (
    ApprovalStrategyCreate,
    ApprovalStrategyUpdate,
)
from app.api.shared.crud import BaseCRUD


class ApprovalStrategiesCRUD(
    BaseCRUD[ApprovalStrategies, ApprovalStrategyCreate, ApprovalStrategyUpdate]
):
    """CRUD operations for ApprovalStrategies."""

    def __init__(self) -> None:
        super().__init__(ApprovalStrategies)

    def get_by_popup(
        self, session: Session, popup_id: uuid.UUID
    ) -> ApprovalStrategies | None:
        """Get approval strategy by popup_id."""
        statement = select(ApprovalStrategies).where(
            ApprovalStrategies.popup_id == popup_id
        )
        return session.exec(statement).first()

    def create_for_popup(
        self,
        session: Session,
        popup_id: uuid.UUID,
        tenant_id: uuid.UUID,
        strategy_in: ApprovalStrategyCreate,
    ) -> ApprovalStrategies:
        """Create approval strategy for a popup."""
        db_obj = ApprovalStrategies(
            popup_id=popup_id,
            tenant_id=tenant_id,
            **strategy_in.model_dump(),
        )
        session.add(db_obj)
        session.commit()
        session.refresh(db_obj)
        return db_obj

    def update(
        self,
        session: Session,
        db_obj: ApprovalStrategies,
        obj_in: ApprovalStrategyUpdate,
    ) -> ApprovalStrategies:
        """Update approval strategy."""
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)

        db_obj.updated_at = datetime.now(UTC)

        session.add(db_obj)
        session.commit()
        session.refresh(db_obj)
        return db_obj


approval_strategies_crud = ApprovalStrategiesCRUD()
