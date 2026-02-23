import uuid

from sqlmodel import Session, select

from app.api.human.models import Humans
from app.api.human.schemas import HumanCreate, HumanUpdate
from app.api.shared.crud import BaseCRUD


class HumansCRUD(BaseCRUD[Humans, HumanCreate, HumanUpdate]):
    def __init__(self) -> None:
        super().__init__(Humans)

    def get_by_email(
        self, session: Session, email: str, tenant_id: uuid.UUID | None = None
    ) -> Humans | None:
        statement = select(Humans).where(Humans.email == email)
        if tenant_id:
            statement = statement.where(Humans.tenant_id == tenant_id)
        return session.exec(statement).first()

    def create_internal(
        self, session: Session, human_data: HumanCreate, tenant_id: uuid.UUID
    ) -> Humans:
        """Create a human with explicit tenant_id (for admin-created humans)."""
        db_obj = Humans(**human_data.model_dump(), tenant_id=tenant_id)
        session.add(db_obj)
        session.commit()
        session.refresh(db_obj)
        return db_obj


humans_crud = HumansCRUD()
