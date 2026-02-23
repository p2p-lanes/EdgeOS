import uuid
from collections.abc import Generator
from typing import TYPE_CHECKING, Annotated

from cachetools import TTLCache
from fastapi import Depends, Header, HTTPException, status
from sqlmodel import Session, select

from app.api.shared.enums import UserRole
from app.core.db import engine
from app.core.security import TokenPayload, get_token_payload

if TYPE_CHECKING:
    from app.api.human.schemas import HumanPublic
    from app.api.tenant.schemas import TenantPublic
    from app.api.user.schemas import UserPublic

# Cache authenticated users for 60 seconds to reduce DB round-trips
# Key: user_id (UUID), Value: UserPublic
_user_cache: TTLCache[uuid.UUID, "UserPublic"] = TTLCache(maxsize=1000, ttl=60)


def invalidate_user_cache(user_id: uuid.UUID) -> None:
    """Call this when a user is modified/deleted to invalidate their cache entry."""
    _user_cache.pop(user_id, None)


def get_session() -> Generator[Session]:
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_session)]


def fetch_authenticated_user(
    token_payload: Annotated[TokenPayload, Depends(get_token_payload)],
    db: SessionDep,
    require_token_type: str | None = "user",
) -> "UserPublic":
    from app.api.user.models import Users
    from app.api.user.schemas import UserPublic

    # Check token type if specified
    if require_token_type and token_payload.token_type != require_token_type:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"This endpoint requires a {require_token_type} token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user_id = uuid.UUID(token_payload.sub)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check cache first
    if user_id in _user_cache:
        return _user_cache[user_id]

    user = db.exec(select(Users).where(Users.id == user_id)).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if user.deleted:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is deactivated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_public = UserPublic.model_validate(user)
    _user_cache[user_id] = user_public
    return user_public


def get_current_user(
    token_payload: Annotated[TokenPayload, Depends(get_token_payload)],
    db: SessionDep,
) -> "UserPublic":
    return fetch_authenticated_user(token_payload, db)


def get_current_human(
    token_payload: Annotated[TokenPayload, Depends(get_token_payload)],
    db: SessionDep,
) -> "HumanPublic":
    from app.api.human.models import Humans
    from app.api.human.schemas import HumanPublic

    # Only allow human tokens
    if token_payload.token_type != "human":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This endpoint requires a human token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        human_id = uuid.UUID(token_payload.sub)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )

    human = db.exec(select(Humans).where(Humans.id == human_id)).first()

    if not human:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Human not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return HumanPublic.model_validate(human)


def get_superadmin(
    current_user: Annotated["UserPublic", Depends(get_current_user)],
) -> "UserPublic":
    if current_user.role != UserRole.SUPERADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Superadmin access required",
        )
    return current_user


def get_admin(
    current_user: Annotated["UserPublic", Depends(get_current_user)],
) -> "UserPublic":
    if current_user.role not in [UserRole.SUPERADMIN, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user


def require_write_permission(
    current_user: Annotated["UserPublic", Depends(get_current_user)],
) -> "UserPublic":
    if current_user.role == UserRole.VIEWER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Viewer role does not have write access",
        )
    return current_user


CurrentUser = Annotated["UserPublic", Depends(get_current_user)]
CurrentHuman = Annotated["HumanPublic", Depends(get_current_human)]
CurrentSuperadmin = Annotated["UserPublic", Depends(get_superadmin)]
CurrentAdmin = Annotated["UserPublic", Depends(get_admin)]
CurrentWriter = Annotated["UserPublic", Depends(require_write_permission)]


def get_current_tenant(
    db: SessionDep,
    x_tenant_id: Annotated[str, Header(alias="X-Tenant-Id")],
) -> "TenantPublic":
    from app.api.tenant.models import Tenants
    from app.api.tenant.schemas import TenantPublic

    try:
        tenant_id = uuid.UUID(x_tenant_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid tenant ID format",
        )

    tenant = db.exec(select(Tenants).where(Tenants.id == tenant_id)).first()

    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found",
        )

    if tenant.deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant is deactivated",
        )

    return TenantPublic.model_validate(tenant)


CurrentTenant = Annotated["TenantPublic", Depends(get_current_tenant)]


def get_tenant_session(
    current_user: CurrentUser,
    db: SessionDep,
    x_tenant_id: Annotated[str | None, Header(alias="X-Tenant-Id")] = None,
) -> Generator[Session]:
    from app.api.shared.enums import CredentialType
    from app.core.tenant_db import tenant_connection_manager

    if current_user.role == UserRole.SUPERADMIN:
        if not x_tenant_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="X-Tenant-Id header required for superadmin access to tenant data",
            )

        try:
            tenant_id = uuid.UUID(x_tenant_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid tenant ID format",
            )

        cached_cred = tenant_connection_manager.get_credential(
            db, tenant_id, CredentialType.CRUD
        )

        if not cached_cred:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Tenant credentials not configured",
            )

        tenant_engine = tenant_connection_manager.get_engine(
            tenant_id,
            CredentialType.CRUD,
            cached_cred.username,
            cached_cred.password,
        )

        with Session(tenant_engine) as tenant_session:
            yield tenant_session
        return

    if not current_user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User has no tenant assigned",
        )

    credential_type = (
        CredentialType.READONLY
        if current_user.role == UserRole.VIEWER
        else CredentialType.CRUD
    )

    cached_cred = tenant_connection_manager.get_credential(
        db, current_user.tenant_id, credential_type
    )

    if not cached_cred:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tenant credentials not configured",
        )

    tenant_engine = tenant_connection_manager.get_engine(
        current_user.tenant_id,
        credential_type,
        cached_cred.username,
        cached_cred.password,
    )

    with Session(tenant_engine) as tenant_session:
        yield tenant_session


TenantSession = Annotated[Session, Depends(get_tenant_session)]


def get_human_tenant_session(
    current_human: CurrentHuman,
    db: SessionDep,
) -> Generator[Session]:
    """Yield a tenant-scoped DB session for portal (human) routes.

    Uses the human's tenant_id to obtain a CRUD-scoped engine with RLS,
    mirroring the pattern used by get_tenant_session for backoffice users.
    """
    from app.api.shared.enums import CredentialType
    from app.core.tenant_db import tenant_connection_manager

    if not current_human.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Human has no tenant assigned",
        )

    cached_cred = tenant_connection_manager.get_credential(
        db, current_human.tenant_id, CredentialType.CRUD
    )

    if not cached_cred:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tenant credentials not configured",
        )

    tenant_engine = tenant_connection_manager.get_engine(
        current_human.tenant_id,
        CredentialType.CRUD,
        cached_cred.username,
        cached_cred.password,
    )

    with Session(tenant_engine) as tenant_session:
        yield tenant_session


HumanTenantSession = Annotated[Session, Depends(get_human_tenant_session)]
