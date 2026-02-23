import uuid

from fastapi import APIRouter, HTTPException, status

from app.api.shared.enums import CredentialType, UserRole
from app.api.shared.response import ListModel, PaginationLimit, PaginationSkip, Paging
from app.api.tenant import crud
from app.api.tenant.credential_schemas import CredentialInfo, TenantCredentialResponse
from app.api.tenant.schemas import TenantCreate, TenantPublic, TenantUpdate
from app.core.config import settings
from app.core.dependencies.users import CurrentAdmin, CurrentSuperadmin, SessionDep
from app.core.tenant_db import get_tenant_credential, revoke_tenant_credentials

router = APIRouter(prefix="/tenants", tags=["tenants"])


@router.get("/public/{slug}", response_model=TenantPublic)
async def get_tenant_by_slug(
    slug: str,
    db: SessionDep,
) -> TenantPublic:
    tenant = crud.get_by_slug(db, slug)

    if tenant is None or tenant.deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found",
        )

    return TenantPublic.model_validate(tenant)


@router.get("", response_model=ListModel[TenantPublic])
async def list_tenants(
    db: SessionDep,
    _: CurrentSuperadmin,
    search: str | None = None,
    skip: PaginationSkip = 0,
    limit: PaginationLimit = 100,
) -> ListModel[TenantPublic]:
    tenants, total = crud.find(
        db, skip=skip, limit=limit, search=search, search_fields=["name"]
    )

    return ListModel[TenantPublic](
        results=[TenantPublic.model_validate(t) for t in tenants],
        paging=Paging(
            offset=skip,
            limit=limit,
            total=total,
        ),
    )


@router.get("/{tenant_id}", response_model=TenantPublic)
async def get_tenant(
    tenant_id: uuid.UUID,
    db: SessionDep,
    current_user: CurrentAdmin,
) -> TenantPublic:
    # Admins can only view their own tenant
    if current_user.role == UserRole.ADMIN and current_user.tenant_id != tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access other tenants",
        )

    tenant = crud.get(db, tenant_id)

    if tenant is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found",
        )

    return TenantPublic.model_validate(tenant)


@router.post("", response_model=TenantPublic, status_code=status.HTTP_201_CREATED)
async def create_tenant(
    tenant_in: TenantCreate,
    db: SessionDep,
    _: CurrentSuperadmin,
) -> TenantPublic:
    existing = crud.get_by_slug(db, tenant_in.slug)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A tenant with this slug already exists",
        )

    tenant = crud.create(db, tenant_in)
    return TenantPublic.model_validate(tenant)


@router.patch("/{tenant_id}", response_model=TenantPublic)
async def update_tenant(
    tenant_id: uuid.UUID,
    tenant_in: TenantUpdate,
    db: SessionDep,
    current_user: CurrentAdmin,
) -> TenantPublic:
    # Admins can only update their own tenant
    if current_user.role == UserRole.ADMIN and current_user.tenant_id != tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot update other tenants",
        )

    tenant = crud.get(db, tenant_id)

    if tenant is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found",
        )

    if tenant_in.slug and tenant_in.slug != tenant.slug:
        existing = crud.get_by_slug(db, tenant_in.slug)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A tenant with this slug already exists",
            )

    updated = crud.update(db, tenant, tenant_in)
    return TenantPublic.model_validate(updated)


@router.delete("/{tenant_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tenant(
    tenant_id: uuid.UUID,
    db: SessionDep,
    _: CurrentSuperadmin,
) -> None:
    tenant = crud.get(db, tenant_id)

    if tenant is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found",
        )

    crud.soft_delete(db, tenant)


@router.get(
    "/{tenant_id}/credentials",
    response_model=TenantCredentialResponse,
)
async def get_credentials(
    tenant_id: uuid.UUID,
    db: SessionDep,
    _: CurrentSuperadmin,
) -> TenantCredentialResponse:
    credential_infos: list[CredentialInfo] = []

    for cred_type in CredentialType:
        result = get_tenant_credential(db, tenant_id, cred_type)
        if result:
            username, password = result
            credential_infos.append(
                CredentialInfo(
                    credential_type=cred_type,
                    db_username=username,
                    db_password=password,
                )
            )

    if not credential_infos:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant has no credentials configured",
        )

    return TenantCredentialResponse(
        credentials=credential_infos,
        db_host=settings.POSTGRES_SERVER,
        db_port=settings.POSTGRES_PORT,
        db_name=settings.POSTGRES_DB,
    )


@router.delete(
    "/{tenant_id}/credentials",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_credentials(
    tenant_id: uuid.UUID,
    db: SessionDep,
    _: CurrentSuperadmin,
) -> None:
    revoked = revoke_tenant_credentials(db, tenant_id)

    if not revoked:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant has no credentials to revoke",
        )
