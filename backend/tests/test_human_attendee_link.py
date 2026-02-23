"""Tests for human-attendee linking feature.

This tests the flow where:
1. Main applicant creates application with spouse attendee
2. Spouse later logs in with same email
3. Spouse's Human record gets linked to existing Attendee record
4. Spouse can see their tickets via /applications/my/tickets
"""

import uuid

from sqlmodel import Session

from app.api.attendee.crud import attendees_crud
from app.api.attendee.models import Attendees
from app.api.human.models import Humans


class TestHumanAttendeeLink:
    """Test human-attendee linking functionality."""

    def test_create_attendee_links_existing_human(self, db: Session):
        """When creating attendee with email, link to existing Human if found."""
        from app.api.application.models import Applications
        from app.api.popup.models import Popups
        from app.api.tenant.models import Tenants

        # Create tenant first (FK requirement)
        tenant_id = uuid.uuid4()
        tenant = Tenants(
            id=tenant_id,
            name="Test Tenant",
            slug=f"test-tenant-{uuid.uuid4().hex[:8]}",
        )
        db.add(tenant)
        db.flush()

        # Create spouse human
        human = Humans(
            id=uuid.uuid4(),
            tenant_id=tenant_id,
            email="spouse@example.com",
        )
        db.add(human)
        db.flush()

        # Create popup
        popup = Popups(
            id=uuid.uuid4(),
            tenant_id=tenant_id,
            name="Test Popup",
            slug=f"test-popup-{uuid.uuid4().hex[:8]}",
        )
        db.add(popup)
        db.flush()

        # Create main human (applicant)
        main_human = Humans(
            id=uuid.uuid4(),
            tenant_id=tenant_id,
            email="main@example.com",
        )
        db.add(main_human)
        db.flush()

        # Create application
        application = Applications(
            id=uuid.uuid4(),
            tenant_id=tenant_id,
            popup_id=popup.id,
            human_id=main_human.id,
        )
        db.add(application)
        db.flush()

        # Create spouse attendee with email matching existing human
        attendee = attendees_crud.create_internal(
            db,
            tenant_id=tenant_id,
            application_id=application.id,
            name="Spouse Name",
            category="spouse",
            check_in_code=f"TEST{uuid.uuid4().hex[:4].upper()}",
            email="spouse@example.com",  # Same email as existing human
        )

        # Verify attendee was linked to existing human
        assert attendee.human_id == human.id
        db.rollback()

    def test_create_attendee_no_human_found(self, db: Session):
        """When creating attendee with email, human_id is None if no Human found."""
        from app.api.application.models import Applications
        from app.api.popup.models import Popups
        from app.api.tenant.models import Tenants

        tenant_id = uuid.uuid4()
        tenant = Tenants(
            id=tenant_id,
            name="Test Tenant 2",
            slug=f"test-tenant-2-{uuid.uuid4().hex[:8]}",
        )
        db.add(tenant)
        db.flush()

        popup = Popups(
            id=uuid.uuid4(),
            tenant_id=tenant_id,
            name="Test Popup 2",
            slug=f"test-popup-2-{uuid.uuid4().hex[:8]}",
        )
        db.add(popup)
        db.flush()

        main_human = Humans(
            id=uuid.uuid4(),
            tenant_id=tenant_id,
            email="main2@example.com",
        )
        db.add(main_human)
        db.flush()

        application = Applications(
            id=uuid.uuid4(),
            tenant_id=tenant_id,
            popup_id=popup.id,
            human_id=main_human.id,
        )
        db.add(application)
        db.flush()

        # Create attendee with email that doesn't match any human
        attendee = attendees_crud.create_internal(
            db,
            tenant_id=tenant_id,
            application_id=application.id,
            name="Spouse Name",
            category="spouse",
            check_in_code=f"TEST{uuid.uuid4().hex[:4].upper()}",
            email="nonexistent@example.com",
        )

        # Verify attendee was NOT linked (no human with that email)
        assert attendee.human_id is None
        db.rollback()

    def test_link_attendees_to_human(self, db: Session):
        """Test linking existing unlinked attendees to a new human."""
        from app.api.application.models import Applications
        from app.api.popup.models import Popups
        from app.api.tenant.models import Tenants

        tenant_id = uuid.uuid4()
        tenant = Tenants(
            id=tenant_id,
            name="Test Tenant 3",
            slug=f"test-tenant-3-{uuid.uuid4().hex[:8]}",
        )
        db.add(tenant)
        db.flush()

        popup = Popups(
            id=uuid.uuid4(),
            tenant_id=tenant_id,
            name="Test Popup 3",
            slug=f"test-popup-3-{uuid.uuid4().hex[:8]}",
        )
        db.add(popup)
        db.flush()

        main_human = Humans(
            id=uuid.uuid4(),
            tenant_id=tenant_id,
            email="main3@example.com",
        )
        db.add(main_human)
        db.flush()

        application = Applications(
            id=uuid.uuid4(),
            tenant_id=tenant_id,
            popup_id=popup.id,
            human_id=main_human.id,
        )
        db.add(application)
        db.flush()

        # Create attendee without human_id (simulating old data or spouse added before login)
        attendee = Attendees(
            id=uuid.uuid4(),
            tenant_id=tenant_id,
            application_id=application.id,
            name="Spouse Name",
            category="spouse",
            check_in_code=f"TEST{uuid.uuid4().hex[:4].upper()}",
            email="future-spouse@example.com",
            human_id=None,  # Not linked yet
        )
        db.add(attendee)
        db.flush()

        # Now create the human (simulating spouse logging in)
        spouse_human = Humans(
            id=uuid.uuid4(),
            tenant_id=tenant_id,
            email="future-spouse@example.com",
        )
        db.add(spouse_human)
        db.flush()

        # Link attendees to the new human
        linked_count = attendees_crud.link_attendees_to_human(
            db,
            human_id=spouse_human.id,
            email=spouse_human.email,
            tenant_id=tenant_id,
        )

        # Verify
        assert linked_count == 1
        db.refresh(attendee)
        assert attendee.human_id == spouse_human.id
        db.rollback()

    def test_find_by_human(self, db: Session):
        """Test finding attendees by human_id."""
        from app.api.application.models import Applications
        from app.api.popup.models import Popups
        from app.api.tenant.models import Tenants

        tenant_id = uuid.uuid4()
        tenant = Tenants(
            id=tenant_id,
            name="Test Tenant 4",
            slug=f"test-tenant-4-{uuid.uuid4().hex[:8]}",
        )
        db.add(tenant)
        db.flush()

        popup = Popups(
            id=uuid.uuid4(),
            tenant_id=tenant_id,
            name="Test Popup 4",
            slug=f"test-popup-4-{uuid.uuid4().hex[:8]}",
        )
        db.add(popup)
        db.flush()

        human = Humans(
            id=uuid.uuid4(),
            tenant_id=tenant_id,
            email="test-find@example.com",
        )
        db.add(human)
        db.flush()

        application = Applications(
            id=uuid.uuid4(),
            tenant_id=tenant_id,
            popup_id=popup.id,
            human_id=human.id,
        )
        db.add(application)
        db.flush()

        # Create two attendees linked to this human
        attendee1 = Attendees(
            id=uuid.uuid4(),
            tenant_id=tenant_id,
            application_id=application.id,
            name="Attendee 1",
            category="main",
            check_in_code=f"FIND{uuid.uuid4().hex[:4].upper()}",
            email="test-find@example.com",
            human_id=human.id,
        )
        attendee2 = Attendees(
            id=uuid.uuid4(),
            tenant_id=tenant_id,
            application_id=application.id,
            name="Attendee 2",
            category="spouse",
            check_in_code=f"FIND{uuid.uuid4().hex[:4].upper()}",
            email="test-find@example.com",
            human_id=human.id,
        )
        db.add(attendee1)
        db.add(attendee2)
        db.flush()

        # Find by human
        attendees, total = attendees_crud.find_by_human(db, human_id=human.id)

        assert total == 2
        assert len(attendees) == 2
        assert {a.id for a in attendees} == {attendee1.id, attendee2.id}
        db.rollback()
