import secrets
import uuid

from fastapi import HTTPException, status
from sqlalchemy import desc
from sqlalchemy.orm import selectinload
from sqlmodel import Session, col, func, select

from app.api.group.models import (
    GroupLeaders,
    GroupMembers,
    Groups,
    GroupWhitelistedEmails,
)
from app.api.group.schemas import GroupCreate, GroupUpdate
from app.api.shared.crud import BaseCRUD


def generate_random_slug() -> str:
    """Generate a random hex string for slug (8 characters)."""
    return secrets.token_hex(4)


class GroupsCRUD(BaseCRUD[Groups, GroupCreate, GroupUpdate]):
    """CRUD operations for Groups."""

    def __init__(self) -> None:
        super().__init__(Groups)

    def get_by_slug(
        self, session: Session, slug: str, popup_id: uuid.UUID | None = None
    ) -> Groups | None:
        """Get a group by slug, optionally filtering by popup_id."""
        statement = select(Groups).where(Groups.slug == slug)
        if popup_id:
            statement = statement.where(Groups.popup_id == popup_id)
        return session.exec(statement).first()

    def get_with_members(self, session: Session, group_id: uuid.UUID) -> Groups | None:
        """Get a group with eager loaded applications, attendees, and products.

        Use this when you need to access group.applications and their nested
        attendees/products to avoid N+1 queries.
        """
        from app.api.application.models import Applications
        from app.api.attendee.models import AttendeeProducts, Attendees

        statement = (
            select(Groups)
            .where(Groups.id == group_id)
            .options(
                selectinload(Groups.applications)  # type: ignore[arg-type]
                .selectinload(Applications.attendees)  # ty: ignore[invalid-argument-type]
                .selectinload(Attendees.attendee_products)  # ty: ignore[invalid-argument-type]
                .selectinload(AttendeeProducts.product),  # ty: ignore[invalid-argument-type]
                selectinload(Groups.applications).selectinload(  # type: ignore[arg-type]
                    Applications.human  # ty: ignore[invalid-argument-type]
                ),
            )
        )
        return session.exec(statement).first()

    def find_by_leader(
        self,
        session: Session,
        human_id: uuid.UUID,
        skip: int = 0,
        limit: int = 100,
    ) -> tuple[list[Groups], int]:
        """Find groups where human is a leader."""
        statement = (
            select(Groups)
            .join(GroupLeaders, GroupLeaders.group_id == Groups.id)  # type: ignore[arg-type]
            .where(GroupLeaders.human_id == human_id)
        )

        # Get total count
        count_statement = select(func.count()).select_from(statement.subquery())
        total = session.exec(count_statement).one()

        # Apply pagination and ordering
        statement = statement.order_by(desc(Groups.created_at))  # type: ignore[arg-type]
        statement = statement.offset(skip).limit(limit)
        results = list(session.exec(statement).all())

        return results, total

    def find_by_popup(
        self,
        session: Session,
        popup_id: uuid.UUID,
        skip: int = 0,
        limit: int = 100,
        search: str | None = None,
    ) -> tuple[list[Groups], int]:
        """Find groups by popup_id."""
        statement = select(Groups).where(Groups.popup_id == popup_id)

        # Apply text search if provided
        if search:
            search_term = f"%{search}%"
            statement = statement.where(col(Groups.name).ilike(search_term))

        count_statement = select(func.count()).select_from(statement.subquery())
        total = session.exec(count_statement).one()

        statement = statement.order_by(desc(Groups.created_at))  # type: ignore[arg-type]
        statement = statement.offset(skip).limit(limit)
        results = list(session.exec(statement).all())

        return results, total

    def validate_member_addition(
        self,
        group: Groups,
        human_id: uuid.UUID,
        update_existing: bool = False,
    ) -> None:
        """
        Validate if a human can be added to a group.

        Raises:
            HTTPException: If validation fails.
        """
        members_ids = [member.id for member in group.members]

        if human_id in members_ids:
            if not update_existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Human is already a member of this group",
                )
            return

        if group.max_members is not None and len(group.members) >= group.max_members:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Group has reached maximum members",
            )

    def add_leader(
        self, session: Session, group_id: uuid.UUID, human_id: uuid.UUID
    ) -> None:
        """Add a leader to a group."""
        leader = GroupLeaders(group_id=group_id, human_id=human_id)
        session.add(leader)
        session.commit()

    def remove_leader(
        self, session: Session, group_id: uuid.UUID, human_id: uuid.UUID
    ) -> None:
        """Remove a leader from a group."""
        statement = select(GroupLeaders).where(
            GroupLeaders.group_id == group_id, GroupLeaders.human_id == human_id
        )
        leader = session.exec(statement).first()
        if leader:
            session.delete(leader)
            session.commit()

    def add_member(
        self, session: Session, group_id: uuid.UUID, human_id: uuid.UUID
    ) -> None:
        """Add a member to a group."""
        member = GroupMembers(group_id=group_id, human_id=human_id)
        session.add(member)
        session.commit()

    def remove_member(
        self, session: Session, group_id: uuid.UUID, human_id: uuid.UUID
    ) -> None:
        """Remove a member from a group."""
        statement = select(GroupMembers).where(
            GroupMembers.group_id == group_id, GroupMembers.human_id == human_id
        )
        member = session.exec(statement).first()
        if member:
            session.delete(member)
            session.commit()

    def is_member(
        self, session: Session, group_id: uuid.UUID, human_id: uuid.UUID
    ) -> bool:
        """Check if a human is a member of a group."""
        statement = select(GroupMembers).where(
            GroupMembers.group_id == group_id, GroupMembers.human_id == human_id
        )
        return session.exec(statement).first() is not None

    def generate_unique_slug(
        self, session: Session, popup_id: uuid.UUID, prefix: str
    ) -> str:
        """Generate a unique slug for a group."""
        slug = f"{prefix}-{generate_random_slug()}"
        while self.get_by_slug(session, slug, popup_id):
            slug = f"{prefix}-{generate_random_slug()}"
        return slug

    def create_ambassador_group(
        self,
        session: Session,
        *,
        tenant_id: uuid.UUID,
        popup_id: uuid.UUID,
        popup_slug: str,
        human_id: uuid.UUID,
        human_name: str,
    ) -> Groups:
        """Create an ambassador group for a human.

        Args:
            session: Database session
            tenant_id: Tenant ID
            popup_id: Popup ID
            popup_slug: Popup slug (used as prefix for group slug)
            human_id: Human ID (ambassador)
            human_name: Human's full name

        Returns:
            Created Groups model
        """
        from loguru import logger

        # Generate unique slug using popup slug as prefix
        slug = f"{popup_slug}-{generate_random_slug()}"
        while self.get_by_slug(session, slug, popup_id):
            logger.info("Ambassador group slug already exists: %s", slug)
            slug = f"{popup_slug}-{generate_random_slug()}"

        description = (
            "You're invited to skip the application process and proceed directly to checkout. "
            "Provide your information below to secure your ticket(s)!"
        )
        welcome_message = f"This is a personal invite link from {human_name}."

        group = Groups(
            tenant_id=tenant_id,
            popup_id=popup_id,
            name=f"{human_name} Invite List",
            slug=slug,
            description=description,
            discount_percentage=0,
            max_members=None,
            welcome_message=welcome_message,
            is_ambassador_group=True,
            ambassador_id=human_id,
        )
        session.add(group)
        session.flush()  # Get group ID

        # Add human as leader
        leader = GroupLeaders(
            tenant_id=tenant_id,
            group_id=group.id,
            human_id=human_id,
        )
        session.add(leader)

        logger.info("Ambassador group created: %s %s", group.id, group.slug)

        return group

    def get_ambassador_group(
        self,
        session: Session,
        popup_id: uuid.UUID,
        human_id: uuid.UUID,
    ) -> Groups | None:
        """Get existing ambassador group for a human in a popup."""
        statement = select(Groups).where(
            Groups.popup_id == popup_id,
            Groups.ambassador_id == human_id,
        )
        return session.exec(statement).first()

    def create(
        self,
        session: Session,
        obj_in: GroupCreate,
        tenant_id: uuid.UUID | None = None,
    ) -> Groups:
        """Create a group with optional whitelisted emails."""
        data = obj_in.model_dump(exclude={"whitelisted_emails"})
        if tenant_id:
            data["tenant_id"] = tenant_id

        group = Groups(**data)
        session.add(group)
        session.flush()  # Get group ID

        # Add whitelisted emails if provided
        if hasattr(obj_in, "whitelisted_emails") and obj_in.whitelisted_emails:
            for email in obj_in.whitelisted_emails:
                wl_email = GroupWhitelistedEmails(
                    tenant_id=group.tenant_id,
                    group_id=group.id,
                    email=email.lower().strip(),
                )
                session.add(wl_email)

        session.commit()
        session.refresh(group)
        return group

    def update_whitelisted_emails(
        self,
        session: Session,
        group: Groups,
        emails: list[str],
        tenant_id: uuid.UUID,
    ) -> Groups:
        """Update whitelisted emails for a group (replace all)."""
        # Delete existing whitelisted emails
        for wl in list(group.whitelisted_emails):
            session.delete(wl)

        # Add new whitelisted emails
        for email in emails:
            wl_email = GroupWhitelistedEmails(
                tenant_id=tenant_id,
                group_id=group.id,
                email=email.lower().strip(),
            )
            session.add(wl_email)

        session.commit()
        session.refresh(group)
        return group

    def update(
        self,
        session: Session,
        db_obj: Groups,
        obj_in: GroupUpdate,
    ) -> Groups:
        """Update a group with optional whitelisted emails update."""
        # Handle whitelisted_emails update if provided
        whitelisted_emails = getattr(obj_in, "whitelisted_emails", None)
        if whitelisted_emails is not None:
            self.update_whitelisted_emails(
                session, db_obj, whitelisted_emails, db_obj.tenant_id
            )

        # Update other fields
        update_data = obj_in.model_dump(
            exclude_unset=True, exclude={"whitelisted_emails"}
        )
        for field, value in update_data.items():
            setattr(db_obj, field, value)

        session.add(db_obj)
        session.commit()
        session.refresh(db_obj)
        return db_obj

    def is_email_whitelisted(
        self, session: Session, group_id: uuid.UUID, email: str
    ) -> bool:
        """Check if email is whitelisted for a group."""
        stmt = select(GroupWhitelistedEmails).where(
            GroupWhitelistedEmails.group_id == group_id,
            func.lower(GroupWhitelistedEmails.email) == email.lower(),
        )
        return session.exec(stmt).first() is not None


groups_crud = GroupsCRUD()
