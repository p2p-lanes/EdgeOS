import uuid

from fastapi import APIRouter, HTTPException, status

from app.api.group import crud
from app.api.group.models import Groups
from app.api.group.schemas import (
    GroupAdminUpdate,
    GroupCreate,
    GroupMemberBatch,
    GroupMemberBatchResult,
    GroupMemberCreate,
    GroupMemberPublic,
    GroupMemberUpdate,
    GroupPublic,
    GroupUpdate,
    GroupWithMembers,
)
from app.api.shared.enums import UserRole
from app.api.shared.response import ListModel, PaginationLimit, PaginationSkip, Paging
from app.core.dependencies.users import (
    CurrentHuman,
    CurrentUser,
    CurrentWriter,
    SessionDep,
    TenantSession,
)
from app.utils.utils import slugify

router = APIRouter(prefix="/groups", tags=["groups"])


def _check_leader_permission(group: Groups, human_id: uuid.UUID) -> None:
    """Check if human is a leader of the group."""
    if not group.is_leader(human_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a leader of this group",
        )


@router.get("", response_model=ListModel[GroupPublic])
async def list_groups(
    db: TenantSession,
    _: CurrentUser,
    popup_id: uuid.UUID | None = None,
    search: str | None = None,
    skip: PaginationSkip = 0,
    limit: PaginationLimit = 100,
) -> ListModel[GroupPublic]:
    """List all groups (BO only)."""
    if popup_id:
        groups, total = crud.groups_crud.find_by_popup(
            db, popup_id=popup_id, skip=skip, limit=limit, search=search
        )
    else:
        groups, total = crud.groups_crud.find(
            db, skip=skip, limit=limit, search=search, search_fields=["name"]
        )

    return ListModel[GroupPublic](
        results=[GroupPublic.model_validate(g) for g in groups],
        paging=Paging(offset=skip, limit=limit, total=total),
    )


@router.get("/{group_id}", response_model=GroupWithMembers)
async def get_group(
    group_id: uuid.UUID,
    db: TenantSession,
    _: CurrentUser,
) -> GroupWithMembers:
    """Get a single group with members (BO only)."""
    group = crud.groups_crud.get_with_members(db, group_id)

    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found",
        )

    # Build members list from applications (relationships already eager loaded)
    members = []
    for application in group.applications:
        products = []
        for attendee in application.attendees:
            for ap in attendee.attendee_products:
                products.append(ap.product)

        human = application.human
        member = GroupMemberPublic(
            id=application.human_id,
            first_name=human.first_name or "",
            last_name=human.last_name or "",
            email=human.email,
            telegram=human.telegram,
            organization=human.organization,
            role=human.role,
            gender=human.gender,
            local_resident=None,
            products=products,
        )
        members.append(member)

    return GroupWithMembers(
        **GroupPublic.model_validate(group).model_dump(),
        members=members,
    )


@router.post("", response_model=GroupPublic, status_code=status.HTTP_201_CREATED)
async def create_group(
    group_in: GroupCreate,
    db: TenantSession,
    current_user: CurrentWriter,
) -> GroupPublic:
    """Create a new group (BO only)."""

    # Generate slug if not provided
    slug = group_in.slug or slugify(group_in.name)

    # Check for existing group with same slug in popup
    existing = crud.groups_crud.get_by_slug(db, slug, group_in.popup_id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A group with this slug already exists in this popup",
        )

    # Get tenant_id
    if current_user.role == UserRole.SUPERADMIN:
        from app.api.popup.crud import popups_crud

        popup = popups_crud.get(db, group_in.popup_id)
        if not popup:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Popup not found",
            )
        tenant_id = popup.tenant_id
    else:
        tenant_id = current_user.tenant_id

    # Create group
    group_data = group_in.model_dump()
    group_data["tenant_id"] = tenant_id
    group_data["slug"] = slug
    group = Groups(**group_data)

    db.add(group)
    db.commit()
    db.refresh(group)

    return GroupPublic.model_validate(group)


@router.patch("/{group_id}", response_model=GroupPublic)
async def update_group(
    group_id: uuid.UUID,
    group_in: GroupAdminUpdate,
    db: TenantSession,
    _current_user: CurrentWriter,
) -> GroupPublic:
    """Update a group (BO only - full admin access)."""

    group = crud.groups_crud.get(db, group_id)
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found",
        )

    # Check slug uniqueness if being updated
    if group_in.slug and group_in.slug != group.slug:
        existing = crud.groups_crud.get_by_slug(db, group_in.slug, group.popup_id)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A group with this slug already exists in this popup",
            )

    updated = crud.groups_crud.update(db, group, group_in)  # type: ignore[arg-type]
    return GroupPublic.model_validate(updated)


@router.delete("/{group_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_group(
    group_id: uuid.UUID,
    db: TenantSession,
    _current_user: CurrentWriter,
) -> None:
    """Delete a group (BO only)."""

    group = crud.groups_crud.get(db, group_id)
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found",
        )

    # Check if group has applications with products
    for app in group.applications:
        for attendee in app.attendees:
            if attendee.products:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cannot delete group with members that have purchased products",
                )

    crud.groups_crud.delete(db, group)


@router.get("/my/groups", response_model=ListModel[GroupPublic])
async def list_my_groups(
    db: SessionDep,
    current_human: CurrentHuman,
    skip: PaginationSkip = 0,
    limit: PaginationLimit = 100,
) -> ListModel[GroupPublic]:
    """List groups where current human is a leader (Portal)."""
    groups, total = crud.groups_crud.find_by_leader(
        db, human_id=current_human.id, skip=skip, limit=limit
    )

    return ListModel[GroupPublic](
        results=[GroupPublic.model_validate(g) for g in groups],
        paging=Paging(offset=skip, limit=limit, total=total),
    )


@router.get("/my/{group_id}", response_model=GroupWithMembers)
async def get_my_group(
    group_id: uuid.UUID,
    db: SessionDep,
    current_human: CurrentHuman,
) -> GroupWithMembers:
    """Get a group where current human is a leader (Portal)."""
    group = crud.groups_crud.get_with_members(db, group_id)

    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found",
        )

    _check_leader_permission(group, current_human.id)

    # Build members list (relationships already eager loaded)
    members = []
    for application in group.applications:
        products = []
        for attendee in application.attendees:
            for ap in attendee.attendee_products:
                products.append(ap.product)

        human = application.human
        member = GroupMemberPublic(
            id=application.human_id,
            first_name=human.first_name or "",
            last_name=human.last_name or "",
            email=human.email,
            telegram=human.telegram,
            organization=human.organization,
            role=human.role,
            gender=human.gender,
            local_resident=None,
            products=products,
        )
        members.append(member)

    return GroupWithMembers(
        **GroupPublic.model_validate(group).model_dump(),
        members=members,
    )


@router.patch("/my/{group_id}", response_model=GroupPublic)
async def update_my_group(
    group_id: uuid.UUID,
    group_in: GroupUpdate,
    db: SessionDep,
    current_human: CurrentHuman,
) -> GroupPublic:
    """Update a group where current human is a leader (Portal - limited fields)."""
    group = crud.groups_crud.get(db, group_id)

    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found",
        )

    _check_leader_permission(group, current_human.id)

    updated = crud.groups_crud.update(db, group, group_in)
    return GroupPublic.model_validate(updated)


@router.post(
    "/my/{group_id}/members",
    response_model=GroupMemberPublic,
    status_code=status.HTTP_201_CREATED,
)
async def add_group_member(
    group_id: uuid.UUID,
    member_in: GroupMemberCreate,
    db: SessionDep,
    current_human: CurrentHuman,
) -> GroupMemberPublic:
    """Add a member to a group (Portal - leader only)."""
    from app.api.application.crud import applications_crud
    from app.api.application.schemas import ApplicationAdminCreate, ApplicationStatus
    from app.api.human.crud import humans_crud

    group = crud.groups_crud.get(db, group_id)
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found",
        )

    _check_leader_permission(group, current_human.id)

    # Get or create human (Human stores identity only, profile goes in Application)
    human = humans_crud.get_by_email(db, member_in.email, group.tenant_id)
    if not human:
        from app.api.human.models import Humans

        human = Humans(tenant_id=group.tenant_id, email=member_in.email)
        db.add(human)
        db.flush()

    # Validate member addition
    crud.groups_crud.validate_member_addition(group, human.id, update_existing=False)

    # Check if human is red-flagged - they are automatically rejected
    if human.red_flag:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot add red-flagged human to group. They are automatically rejected.",
        )

    # Check for existing application
    application = applications_crud.get_by_human_popup(db, human.id, group.popup_id)

    if not application:
        # Create new application with ACCEPTED status
        # Note: local_resident and created_by_leader are not on ApplicationAdminCreate
        # These would need schema changes to support
        app_data = ApplicationAdminCreate(
            popup_id=group.popup_id,
            group_id=group.id,
            first_name=member_in.first_name,
            last_name=member_in.last_name,
            email=member_in.email,
            telegram=member_in.telegram,
            organization=member_in.organization,
            role=member_in.role,
            gender=member_in.gender,
            status=ApplicationStatus.ACCEPTED,
        )
        application = applications_crud.create_internal(
            db,
            app_data,
            group.tenant_id,
            human.id,
        )
    else:
        # Update existing application and human profile
        application.group_id = group.id
        application.status = ApplicationStatus.ACCEPTED
        # Update human profile
        human.first_name = member_in.first_name
        human.last_name = member_in.last_name
        human.telegram = member_in.telegram
        human.organization = member_in.organization
        human.role = member_in.role
        human.gender = member_in.gender
        db.add(human)
        db.add(application)

    # Add to group members
    if not crud.groups_crud.is_member(db, group.id, human.id):
        crud.groups_crud.add_member(db, group.id, human.id)

    db.commit()
    db.refresh(application)
    db.refresh(human)

    # Get products
    products = []
    for attendee in application.attendees:
        products.extend(attendee.products)

    return GroupMemberPublic(
        id=human.id,
        first_name=human.first_name or "",
        last_name=human.last_name or "",
        email=human.email,
        telegram=human.telegram,
        organization=human.organization,
        role=human.role,
        gender=human.gender,
        local_resident=None,
        products=products,
    )


@router.post(
    "/my/{group_id}/members/batch",
    response_model=list[GroupMemberBatchResult],
    status_code=status.HTTP_207_MULTI_STATUS,
)
async def add_group_members_batch(
    group_id: uuid.UUID,
    batch: GroupMemberBatch,
    db: SessionDep,
    current_human: CurrentHuman,
) -> list[GroupMemberBatchResult]:
    """Add multiple members to a group (Portal - leader only)."""
    from loguru import logger

    group = crud.groups_crud.get(db, group_id)
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found",
        )

    _check_leader_permission(group, current_human.id)

    results = []
    for member in batch.members:
        try:
            # Use the same logic as single member add
            result = await add_group_member(group_id, member, db, current_human)
            results.append(
                GroupMemberBatchResult(
                    **result.model_dump(),
                    success=True,
                    err_msg=None,
                )
            )
        except HTTPException as e:
            logger.warning(f"Failed to add member {member.email}: {e.detail}")
            results.append(
                GroupMemberBatchResult(
                    id=uuid.uuid4(),  # Placeholder
                    first_name=member.first_name,
                    last_name=member.last_name,
                    email=member.email,
                    telegram=member.telegram,
                    organization=member.organization,
                    role=member.role,
                    gender=member.gender,
                    local_resident=member.local_resident,
                    products=[],
                    success=False,
                    err_msg=str(e.detail),
                )
            )
        except Exception as e:
            logger.error(f"Error adding member {member.email}: {e}")
            raise

    return results


@router.put("/my/{group_id}/members/{human_id}", response_model=GroupMemberPublic)
async def update_group_member(
    group_id: uuid.UUID,
    human_id: uuid.UUID,
    member_in: GroupMemberUpdate,
    db: SessionDep,
    current_human: CurrentHuman,
) -> GroupMemberPublic:
    """Update a member in a group (Portal - leader only)."""
    from app.api.application.crud import applications_crud

    group = crud.groups_crud.get(db, group_id)
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found",
        )

    _check_leader_permission(group, current_human.id)

    # Check if human is a member
    if not crud.groups_crud.is_member(db, group.id, human_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found in group",
        )

    # Get application and human
    application = applications_crud.get_by_human_popup(db, human_id, group.popup_id)
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    # Update human profile fields (not application)
    from app.api.human.crud import humans_crud

    human = humans_crud.get(db, human_id)
    if not human:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Human not found",
        )

    update_data = member_in.model_dump(exclude_unset=True)
    # Remove local_resident as it doesn't exist on Human model
    update_data.pop("local_resident", None)
    for field, value in update_data.items():
        setattr(human, field, value)

    db.add(human)
    db.commit()
    db.refresh(human)

    # Get products
    products = []
    for attendee in application.attendees:
        products.extend(attendee.products)

    return GroupMemberPublic(
        id=human_id,
        first_name=human.first_name or "",
        last_name=human.last_name or "",
        email=human.email,
        telegram=human.telegram,
        organization=human.organization,
        role=human.role,
        gender=human.gender,
        local_resident=None,
        products=products,
    )


@router.delete(
    "/my/{group_id}/members/{human_id}", status_code=status.HTTP_204_NO_CONTENT
)
async def remove_group_member(
    group_id: uuid.UUID,
    human_id: uuid.UUID,
    db: SessionDep,
    current_human: CurrentHuman,
) -> None:
    """Remove a member from a group (Portal - leader only)."""
    from app.api.application.crud import applications_crud

    group = crud.groups_crud.get(db, group_id)
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found",
        )

    _check_leader_permission(group, current_human.id)

    # Check if human is a member
    if not crud.groups_crud.is_member(db, group.id, human_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found in group",
        )

    # Get application
    application = applications_crud.get_by_human_popup(db, human_id, group.popup_id)
    if application:
        # Check if member has products
        for attendee in application.attendees:
            if attendee.products:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cannot remove member with purchased products",
                )

        # Remove group association (don't delete application)
        # Note: created_by_leader tracking not implemented on model
        application.group_id = None
        db.add(application)

    # Remove from group members
    crud.groups_crud.remove_member(db, group.id, human_id)
    db.commit()


@router.get("/public/{group_slug}", response_model=GroupPublic)
async def get_group_public(
    group_slug: str,
    db: SessionDep,
) -> GroupPublic:
    """Get a group by slug (public - for invite links)."""
    group = crud.groups_crud.get_by_slug(db, group_slug)

    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found",
        )

    return GroupPublic.model_validate(group)
