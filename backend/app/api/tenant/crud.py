from sqlmodel import Session

from app.api.shared.crud import BaseCRUD
from app.api.tenant.models import Tenants
from app.api.tenant.schemas import TenantCreate, TenantUpdate


class TenantsCRUD(BaseCRUD[Tenants, TenantCreate, TenantUpdate]):
    def __init__(self) -> None:
        super().__init__(Tenants)

    def get_by_slug(self, session: Session, slug: str) -> Tenants | None:
        return self.get_by_field(session, "slug", slug)

    def create(self, session: Session, obj_in: TenantCreate) -> Tenants:
        from app.core.tenant_db import ensure_tenant_credentials

        tenant = super().create(session, obj_in)
        ensure_tenant_credentials(session, tenant.id)

        return tenant

    def soft_delete(self, session: Session, db_obj: Tenants) -> Tenants:
        from app.core.tenant_db import revoke_tenant_credentials

        revoke_tenant_credentials(session, db_obj.id)
        return super().soft_delete(session, db_obj)


tenants_crud = TenantsCRUD()
