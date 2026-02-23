import uuid

from fastapi import APIRouter, HTTPException, status
from loguru import logger

from app.api.shared.enums import UserRole
from app.api.shared.response import ListModel, PaginationLimit, PaginationSkip, Paging
from app.api.user import crud
from app.api.user.schemas import UserCreate, UserPublic, UserUpdate
from app.core.dependencies.users import CurrentAdmin, CurrentUser, SessionDep

router = APIRouter(prefix="/users", tags=["users"])

ROLE_HIERARCHY = {
    UserRole.SUPERADMIN: [UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.VIEWER],
    UserRole.ADMIN: [UserRole.ADMIN, UserRole.VIEWER],
    UserRole.VIEWER: [],
}


@router.get("", response_model=ListModel[UserPublic])
async def list_users(
    db: SessionDep,
    current_user: CurrentAdmin,
    skip: PaginationSkip = 0,
    limit: PaginationLimit = 100,
    tenant_id: uuid.UUID | None = None,
    role: UserRole | None = None,
    search: str | None = None,
) -> ListModel[UserPublic]:
    # Admins can only see users in their tenant
    if current_user.role == UserRole.ADMIN:
        tenant_id = current_user.tenant_id

    users, total = crud.find_filtered(
        db, tenant_id=tenant_id, role=role, skip=skip, limit=limit, search=search
    )

    return ListModel[UserPublic](
        results=[UserPublic.model_validate(u) for u in users],
        paging=Paging(
            offset=skip,
            limit=limit,
            total=total,
        ),
    )


@router.get("/me", response_model=UserPublic)
async def get_current_user_info(
    current_user: CurrentUser,
) -> UserPublic:
    return current_user


@router.get("/{user_id}", response_model=UserPublic)
async def get_user(
    user_id: uuid.UUID,
    db: SessionDep,
    current_user: CurrentAdmin,
) -> UserPublic:
    user = crud.get(db, user_id)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Admins can only view users in their tenant
    if current_user.role == UserRole.ADMIN and user.tenant_id != current_user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access users from other tenants",
        )

    return UserPublic.model_validate(user)


@router.post("", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_in: UserCreate,
    db: SessionDep,
    current_user: CurrentUser,
) -> UserPublic:
    allowed_roles = ROLE_HIERARCHY.get(current_user.role, [])
    if user_in.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Cannot create user with role '{user_in.role.value}'",
        )

    if current_user.role == UserRole.SUPERADMIN:
        # Superadmins can create superadmins (no tenant) or must provide tenant_id for others
        if user_in.role != UserRole.SUPERADMIN and user_in.tenant_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Superadmin must provide tenant_id for non-superadmin users",
            )
        # Superadmins creating other superadmins should not have tenant_id
        if user_in.role == UserRole.SUPERADMIN:
            user_in.tenant_id = None
    else:
        # Non-superadmins: derive tenant_id from current user (ignore any provided value)
        user_in.tenant_id = current_user.tenant_id

    existing = crud.get_by_email(db, user_in.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An user with this email already exists",
        )

    user = crud.create(db, user_in)
    logger.info(f"User created: {user.email} by {current_user.email}")

    return UserPublic.model_validate(user)


@router.patch("/{user_id}", response_model=UserPublic)
async def update_user(
    user_id: uuid.UUID,
    user_in: UserUpdate,
    db: SessionDep,
    current_user: CurrentAdmin,
) -> UserPublic:
    user = crud.get(db, user_id)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Admins can only update users in their tenant
    if current_user.role == UserRole.ADMIN and user.tenant_id != current_user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot update users from other tenants",
        )

    # Admins cannot change roles to superadmin or promote to a higher level
    if current_user.role == UserRole.ADMIN and user_in.role:
        allowed_roles = ROLE_HIERARCHY.get(current_user.role, [])
        if user_in.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Cannot assign role '{user_in.role.value}'",
            )

    if user_in.email and user_in.email != user.email:
        existing = crud.get_by_email(db, user_in.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An user with this email already exists",
            )

    updated = crud.update(db, user, user_in)
    logger.info(f"User updated: {updated.email} by {current_user.email}")

    return UserPublic.model_validate(updated)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: uuid.UUID,
    db: SessionDep,
    current_user: CurrentAdmin,
) -> None:
    user = crud.get(db, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Admins can only delete users in their tenant
    if current_user.role == UserRole.ADMIN and user.tenant_id != current_user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete users from other tenants",
        )

    # Admins cannot delete admins (only themselves, which is blocked below)
    if (
        current_user.role == UserRole.ADMIN
        and user.role == UserRole.ADMIN
        and user.id != current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete other admins",
        )

    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete yourself",
        )

    crud.soft_delete(db, user)
    logger.info(f"User deleted: {user.email} by {current_user.email}")
