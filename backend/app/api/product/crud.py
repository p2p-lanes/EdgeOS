import uuid

from sqlmodel import Session, col, select

from app.api.product.models import Products
from app.api.product.schemas import ProductCategory, ProductCreate, ProductUpdate
from app.api.shared.crud import BaseCRUD

SORT_FIELDS = {"name", "price", "attendee_category", "is_active"}


class ProductsCRUD(BaseCRUD[Products, ProductCreate, ProductUpdate]):
    """CRUD operations for Products."""

    def __init__(self) -> None:
        super().__init__(Products)

    def get_by_slug(
        self, session: Session, slug: str, popup_id: uuid.UUID
    ) -> Products | None:
        """Get a product by slug and popup_id."""
        statement = select(Products).where(
            Products.slug == slug, Products.popup_id == popup_id
        )
        return session.exec(statement).first()

    def generate_unique_slug(
        self, session: Session, base_slug: str, popup_id: uuid.UUID
    ) -> str:
        """Generate a unique slug within a popup by appending a numeric suffix if needed."""
        if not self.get_by_slug(session, base_slug, popup_id):
            return base_slug

        counter = 1
        while True:
            candidate = f"{base_slug}-{counter}"
            if not self.get_by_slug(session, candidate, popup_id):
                return candidate
            counter += 1

    def find_by_popup(
        self,
        session: Session,
        popup_id: uuid.UUID,
        skip: int = 0,
        limit: int = 100,
        is_active: bool | None = None,
        category: ProductCategory | None = None,
        search: str | None = None,
        sort_by: str | None = None,
        sort_order: str = "desc",
    ) -> tuple[list[Products], int]:
        """Find products by popup_id with optional filters."""
        statement = select(Products).where(Products.popup_id == popup_id)

        if is_active is not None:
            statement = statement.where(Products.is_active == is_active)

        if category is not None:
            statement = statement.where(Products.category == category)

        if search:
            search_term = f"%{search}%"
            statement = statement.where(col(Products.name).ilike(search_term))

        from sqlmodel import func

        count_statement = select(func.count()).select_from(statement.subquery())
        total = session.exec(count_statement).one()

        validated_sort = sort_by if sort_by in SORT_FIELDS else None
        statement = self._apply_sorting(statement, validated_sort, sort_order)

        statement = statement.offset(skip).limit(limit)
        results = list(session.exec(statement).all())

        return results, total

    def get_by_ids(
        self, session: Session, ids: list[uuid.UUID]
    ) -> dict[uuid.UUID, Products]:
        """Get multiple products by their IDs and return as a dict."""
        if not ids:
            return {}
        statement = select(Products).where(Products.id.in_(ids))  # type: ignore[attr-defined]
        products = session.exec(statement).all()
        return {p.id: p for p in products}


products_crud = ProductsCRUD()
