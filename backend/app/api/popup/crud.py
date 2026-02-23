from sqlmodel import Session

from app.api.popup.models import Popups
from app.api.popup.schemas import PopupCreate, PopupUpdate
from app.api.shared.crud import BaseCRUD


class PopupsCRUD(BaseCRUD[Popups, PopupCreate, PopupUpdate]):
    def __init__(self) -> None:
        super().__init__(Popups)

    def get_by_slug(self, session: Session, slug: str) -> Popups | None:
        return self.get_by_field(session, "slug", slug)


popups_crud = PopupsCRUD()
