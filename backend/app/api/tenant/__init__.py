from app.api.tenant.crud import tenants_crud as crud
from app.api.tenant.router import router

__all__ = ["router", "crud"]
