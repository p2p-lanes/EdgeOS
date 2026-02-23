from app.api.user.crud import users_crud as crud
from app.api.user.router import router

__all__ = ["router", "crud"]
