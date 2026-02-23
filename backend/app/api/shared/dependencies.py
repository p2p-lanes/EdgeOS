import uuid
from collections.abc import Generator
from typing import TYPE_CHECKING, Annotated

from fastapi import Depends, Header, HTTPException, status
from sqlmodel import Session, select

from app.api.shared.enums import UserRole
from app.core.db import engine
from app.core.security import TokenPayload, get_token_payload

if TYPE_CHECKING:
    from app.api.human.schemas import HumanPublic
    from app.api.tenant.schemas import TenantPublic
    from app.api.user.schemas import UserPublic


def get_session() -> Generator[Session]:
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_session)]


def get_current_user(
    token_payload: Annotated[TokenPayload, Depends(get_token_payload)],
    db: SessionDep,
) -> "UserPublic":
    from app.api.user.models import Users

    # Only allow user tokens
    if token_payload.token_type != "user":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This endpoint requires a user token",
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

    from app.api.user.schemas import UserPublic

    return UserPublic.model_validate(user)


CurrentUser = Annotated["UserPublic", Depends(get_current_user)]


def get_tenant_session(
    current_user: CurrentUser,
    db: SessionDep,
    x_tenant_id: Annotated[str | None, Header(alias="X-Tenant-Id")] = None,
) -> Generator[Session]:
    from app.api.shared.enums import CredentialType
    from app.api.tenant.credential_models import TenantCredentials
    from app.core.tenant_db import tenant_connection_manager
    from app.utils.encryption import decrypt

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

        credential = db.exec(
            select(TenantCredentials).where(
                TenantCredentials.tenant_id == tenant_id,
                TenantCredentials.credential_type == CredentialType.CRUD,
            )
        ).first()

        if not credential:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Tenant credentials not configured",
            )

        password = decrypt(credential.db_password_encrypted)
        tenant_engine = tenant_connection_manager.get_engine(
            tenant_id,
            CredentialType.CRUD,
            credential.db_username,
            password,
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

    credential = db.exec(
        select(TenantCredentials).where(
            TenantCredentials.tenant_id == current_user.tenant_id,
            TenantCredentials.credential_type == credential_type,
        )
    ).first()

    if not credential:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tenant credentials not configured",
        )

    password = decrypt(credential.db_password_encrypted)
    tenant_engine = tenant_connection_manager.get_engine(
        current_user.tenant_id,
        credential_type,
        credential.db_username,
        password,
    )

    with Session(tenant_engine) as tenant_session:
        yield tenant_session


TenantSession = Annotated[Session, Depends(get_tenant_session)]


def get_superadmin(
    current_user: CurrentUser,
) -> "UserPublic":
    if current_user.role != UserRole.SUPERADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Superadmin access required",
        )
    return current_user


CurrentSuperadmin = Annotated["UserPublic", Depends(get_superadmin)]


def get_admin(
    current_user: CurrentUser,
) -> "UserPublic":
    if current_user.role not in [UserRole.SUPERADMIN, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user


CurrentAdmin = Annotated["UserPublic", Depends(get_admin)]


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


CurrentHuman = Annotated["HumanPublic", Depends(get_current_human)]
