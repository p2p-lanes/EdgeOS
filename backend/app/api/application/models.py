import uuid
from datetime import UTC, datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Index, UniqueConstraint, text
from sqlalchemy.dialects.postgresql import UUID
from sqlmodel import Column, DateTime, Field, Relationship, func

from app.api.application.schemas import (
    ApplicationBase,
    ApplicationSnapshotBase,
    ApplicationStatus,
)

if TYPE_CHECKING:
    from app.api.application_review.models import ApplicationReviews
    from app.api.attendee.models import Attendees
    from app.api.group.models import Groups
    from app.api.human.models import Humans
    from app.api.payment.models import Payments
    from app.api.popup.models import Popups
    from app.api.tenant.models import Tenants


class ApplicationSnapshots(ApplicationSnapshotBase, table=True):
    """Snapshot of application and human profile at a point in time.

    Created when:
    - Application is submitted (event="submitted")
    - Application is accepted (event="accepted")
    - Application is updated after submission (event="updated")
    """

    __tablename__ = "application_snapshots"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        sa_column=Column(
            UUID(as_uuid=True),
            primary_key=True,
        ),
    )

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        sa_column=Column(
            DateTime(timezone=True), server_default=func.now(), nullable=False
        ),
    )

    # Relationships
    application: "Applications" = Relationship(back_populates="snapshots")


class Applications(ApplicationBase, table=True):
    """Application model - forms submitted by humans to participate in popups.

    Profile data (name, contact, etc.) is stored on the Human model.
    Application only contains popup-specific data (referral, custom_fields, etc.).
    """

    __table_args__ = (
        UniqueConstraint("human_id", "popup_id", name="uq_application_human_popup"),
        Index("ix_applications_popup_status", "popup_id", "status"),
        Index(
            "ix_applications_active_status",
            "popup_id",
            "submitted_at",
            postgresql_where=text("status IN ('in review', 'accepted')"),
        ),
        Index(
            "ix_applications_custom_fields",
            "custom_fields",
            postgresql_using="gin",
        ),
    )

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        sa_column=Column(
            UUID(as_uuid=True),
            primary_key=True,
        ),
    )

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        sa_column=Column(
            DateTime(timezone=True), server_default=func.now(), nullable=False
        ),
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        sa_column=Column(
            DateTime(timezone=True),
            server_default=func.now(),
            onupdate=func.now(),
            nullable=False,
        ),
    )

    # Relationships
    tenant: "Tenants" = Relationship(back_populates="applications")
    popup: "Popups" = Relationship(back_populates="applications")
    human: "Humans" = Relationship(back_populates="applications")
    group: Optional["Groups"] = Relationship(back_populates="applications")
    attendees: list["Attendees"] = Relationship(
        back_populates="application",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )
    payments: list["Payments"] = Relationship(back_populates="application")
    snapshots: list["ApplicationSnapshots"] = Relationship(
        back_populates="application",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )
    reviews: list["ApplicationReviews"] = Relationship(
        back_populates="application",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )

    @property
    def red_flag(self) -> bool:
        """Check if the human is flagged.

        Note: Accesses the `human` relationship. Ensure the application
        is loaded with `selectinload(Applications.human)` to avoid N+1 queries.
        """
        return self.human.red_flag if self.human else False

    @property
    def brings_spouse(self) -> bool:
        """Check if application includes a spouse attendee.

        Note: Accesses the `attendees` relationship. Ensure the application
        is loaded with `selectinload(Applications.attendees)` to avoid N+1 queries.
        """
        return any(a.category == "spouse" for a in self.attendees)

    @property
    def brings_kids(self) -> bool:
        """Check if application includes kid attendees.

        Note: Accesses the `attendees` relationship. Ensure the application
        is loaded with `selectinload(Applications.attendees)` to avoid N+1 queries.
        """
        return any(a.category == "kid" for a in self.attendees)

    @property
    def kid_count(self) -> int:
        """Count number of kid attendees.

        Note: Accesses the `attendees` relationship. Ensure the application
        is loaded with `selectinload(Applications.attendees)` to avoid N+1 queries.
        """
        return sum(1 for a in self.attendees if a.category == "kid")

    def get_main_attendee(self) -> "Attendees | None":
        """Get the main attendee for this application.

        Note: Accesses the `attendees` relationship. Ensure the application
        is loaded with `selectinload(Applications.attendees)` to avoid N+1 queries.
        """
        for attendee in self.attendees:
            if attendee.category == "main":
                return attendee
        return None

    def get_all_products(self) -> list:
        """Get all products from all attendees.

        Note: Accesses nested relationships. Ensure the application is loaded with:
        ```
        selectinload(Applications.attendees)
            .selectinload(Attendees.attendee_products)
            .selectinload(AttendeeProducts.product)
        ```
        """
        products = []
        for attendee in self.attendees:
            products.extend(attendee.products)
        return products

    def has_products(self) -> bool:
        """Check if any attendee has products.

        Note: Accesses nested relationships. Ensure the application is loaded with:
        ```
        selectinload(Applications.attendees)
            .selectinload(Attendees.attendee_products)
        ```
        """
        return any(attendee.has_products() for attendee in self.attendees)

    def compute_effective_status(self) -> str:
        """Compute the effective status based on validation rules."""
        if self.status != ApplicationStatus.ACCEPTED.value:
            return self.status

        return ApplicationStatus.ACCEPTED.value

    def create_snapshot(self, event: str) -> "ApplicationSnapshots":
        """Create a snapshot of the current application and human profile state."""
        return ApplicationSnapshots(
            tenant_id=self.tenant_id,
            application_id=self.id,
            event=event,
            # Human profile snapshot
            first_name=self.human.first_name if self.human else None,
            last_name=self.human.last_name if self.human else None,
            email=self.human.email if self.human else "",
            telegram=self.human.telegram if self.human else None,
            organization=self.human.organization if self.human else None,
            role=self.human.role if self.human else None,
            gender=self.human.gender if self.human else None,
            age=self.human.age if self.human else None,
            residence=self.human.residence if self.human else None,
            # Application data snapshot
            referral=self.referral,
            info_not_shared=self.info_not_shared,
            custom_fields=self.custom_fields,
            status=self.status,
        )
