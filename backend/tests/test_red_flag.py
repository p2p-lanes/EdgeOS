"""Tests for red-flagged human automatic rejection.

Red-flagged humans should have their applications automatically rejected,
regardless of the approval method (manual, auto-accept, review-based, group).
"""

import uuid

from fastapi.testclient import TestClient
from sqlmodel import Session

from app.api.application.crud import RedFlaggedHumanError, applications_crud
from app.api.application.models import Applications
from app.api.application.schemas import ApplicationStatus
from app.api.approval_strategy.schemas import ApprovalStrategyType
from app.api.human.models import Humans
from app.api.popup.models import Popups
from app.api.tenant.models import Tenants
from app.services.approval.calculator import ApprovalCalculator


class TestRedFlagAutoReject:
    """Test that red-flagged humans have their applications automatically rejected."""

    def test_calculator_rejects_red_flagged_human(self) -> None:
        """ApprovalCalculator should return REJECTED when human is red-flagged."""
        calculator = ApprovalCalculator()

        # Even with auto-accept strategy, red-flagged should be rejected
        from app.api.approval_strategy.models import ApprovalStrategies

        strategy = ApprovalStrategies(
            id=uuid.uuid4(),
            popup_id=uuid.uuid4(),
            tenant_id=uuid.uuid4(),
            strategy_type=ApprovalStrategyType.AUTO_ACCEPT,
        )

        result = calculator.calculate_status(
            strategy=strategy,
            reviews=[],
            designated_reviewers=[],
            human_red_flag=True,
        )

        assert result == ApplicationStatus.REJECTED

    def test_calculator_allows_acceptance_for_non_flagged_human(self) -> None:
        """ApprovalCalculator should allow acceptance when human is not red-flagged."""
        calculator = ApprovalCalculator()

        from app.api.approval_strategy.models import ApprovalStrategies

        strategy = ApprovalStrategies(
            id=uuid.uuid4(),
            popup_id=uuid.uuid4(),
            tenant_id=uuid.uuid4(),
            strategy_type=ApprovalStrategyType.AUTO_ACCEPT,
        )

        result = calculator.calculate_status(
            strategy=strategy,
            reviews=[],
            designated_reviewers=[],
            human_red_flag=False,
        )

        assert result == ApplicationStatus.ACCEPTED

    def test_crud_accept_raises_for_red_flagged_human(
        self,
        db: Session,
        tenant_a: Tenants,
        popup_tenant_a: Popups,
    ) -> None:
        """CRUD accept() should raise RedFlaggedHumanError for red-flagged humans."""
        # Create red-flagged human
        human = Humans(
            tenant_id=tenant_a.id,
            email=f"red-flag-{uuid.uuid4().hex[:8]}@test.com",
            first_name="Red",
            last_name="Flagged",
            red_flag=True,
        )
        db.add(human)
        db.flush()

        # Create application
        application = Applications(
            tenant_id=tenant_a.id,
            popup_id=popup_tenant_a.id,
            human_id=human.id,
            status=ApplicationStatus.IN_REVIEW.value,
        )
        db.add(application)
        db.flush()

        # Attempt to accept should raise
        try:
            applications_crud.accept(db, application)
            raise AssertionError("Should have raised RedFlaggedHumanError")
        except RedFlaggedHumanError as e:
            assert "red-flagged" in str(e).lower()
        finally:
            db.rollback()

    def test_crud_submit_auto_rejects_red_flagged_human(
        self,
        db: Session,
        tenant_a: Tenants,
        popup_tenant_a: Popups,
    ) -> None:
        """CRUD submit() should auto-reject red-flagged humans."""
        # Create red-flagged human
        human = Humans(
            tenant_id=tenant_a.id,
            email=f"red-flag-submit-{uuid.uuid4().hex[:8]}@test.com",
            first_name="Red",
            last_name="Flagged",
            red_flag=True,
        )
        db.add(human)
        db.flush()

        # Create draft application
        application = Applications(
            tenant_id=tenant_a.id,
            popup_id=popup_tenant_a.id,
            human_id=human.id,
            status=ApplicationStatus.DRAFT.value,
        )
        db.add(application)
        db.flush()

        # Submit should auto-reject red-flagged human
        result = applications_crud.submit(db, application)

        # Red-flagged human should be rejected
        assert result.status == ApplicationStatus.REJECTED.value
        assert result.accepted_at is None

        db.rollback()


class TestRedFlagAPIEndpoints:
    """Test red-flag blocking through API endpoints."""

    def test_admin_cannot_accept_red_flagged_application(
        self,
        client: TestClient,
        db: Session,
        admin_token_tenant_a: str,
        tenant_a: Tenants,
        popup_tenant_a: Popups,
    ) -> None:
        """Admin PATCH to ACCEPTED status should fail for red-flagged human."""
        # Create red-flagged human
        human = Humans(
            tenant_id=tenant_a.id,
            email=f"red-flag-api-{uuid.uuid4().hex[:8]}@test.com",
            first_name="Red",
            last_name="Flagged",
            red_flag=True,
        )
        db.add(human)
        db.flush()

        # Create application in IN_REVIEW status
        application = Applications(
            tenant_id=tenant_a.id,
            popup_id=popup_tenant_a.id,
            human_id=human.id,
            status=ApplicationStatus.IN_REVIEW.value,
        )
        db.add(application)
        db.commit()
        db.refresh(application)

        try:
            # Try to accept via API
            response = client.patch(
                f"/api/v1/applications/{application.id}",
                headers={"Authorization": f"Bearer {admin_token_tenant_a}"},
                json={"status": "accepted"},
            )

            # Should be rejected
            assert response.status_code == 400
            assert "red-flagged" in response.json()["detail"].lower()
        finally:
            # Clean up
            db.delete(application)
            db.delete(human)
            db.commit()

    def test_admin_can_reject_red_flagged_application(
        self,
        client: TestClient,
        db: Session,
        admin_token_tenant_a: str,
        tenant_a: Tenants,
        popup_tenant_a: Popups,
    ) -> None:
        """Admin should still be able to reject a red-flagged human's application."""
        # Create red-flagged human
        human = Humans(
            tenant_id=tenant_a.id,
            email=f"red-flag-reject-{uuid.uuid4().hex[:8]}@test.com",
            first_name="Red",
            last_name="Flagged",
            red_flag=True,
        )
        db.add(human)
        db.flush()

        # Create application in IN_REVIEW status
        application = Applications(
            tenant_id=tenant_a.id,
            popup_id=popup_tenant_a.id,
            human_id=human.id,
            status=ApplicationStatus.IN_REVIEW.value,
        )
        db.add(application)
        db.commit()
        db.refresh(application)

        try:
            # Reject via API should work
            response = client.patch(
                f"/api/v1/applications/{application.id}",
                headers={"Authorization": f"Bearer {admin_token_tenant_a}"},
                json={"status": "rejected"},
            )

            assert response.status_code == 200
            assert response.json()["status"] == "rejected"
        finally:
            # Clean up
            db.delete(application)
            db.delete(human)
            db.commit()

    def test_admin_can_accept_non_red_flagged_application(
        self,
        client: TestClient,
        db: Session,
        admin_token_tenant_a: str,
        tenant_a: Tenants,
        popup_tenant_a: Popups,
    ) -> None:
        """Admin should be able to accept applications from non-red-flagged humans."""
        # Create normal human
        human = Humans(
            tenant_id=tenant_a.id,
            email=f"normal-{uuid.uuid4().hex[:8]}@test.com",
            first_name="Normal",
            last_name="User",
            red_flag=False,
        )
        db.add(human)
        db.flush()

        # Create application in IN_REVIEW status
        application = Applications(
            tenant_id=tenant_a.id,
            popup_id=popup_tenant_a.id,
            human_id=human.id,
            status=ApplicationStatus.IN_REVIEW.value,
        )
        db.add(application)
        db.commit()
        db.refresh(application)

        try:
            # Accept via API should work
            response = client.patch(
                f"/api/v1/applications/{application.id}",
                headers={"Authorization": f"Bearer {admin_token_tenant_a}"},
                json={"status": "accepted"},
            )

            assert response.status_code == 200
            assert response.json()["status"] == "accepted"
        finally:
            # Clean up
            db.delete(application)
            db.delete(human)
            db.commit()


class TestRedFlagOnHumanUpdate:
    """Test that flagging a human auto-rejects their IN_REVIEW applications."""

    def test_flagging_human_rejects_in_review_applications(
        self,
        client: TestClient,
        db: Session,
        admin_token_tenant_a: str,
        tenant_a: Tenants,
        popup_tenant_a: Popups,
    ) -> None:
        """When a human is flagged, all their IN_REVIEW applications should be rejected."""
        # Create normal human
        human = Humans(
            tenant_id=tenant_a.id,
            email=f"to-be-flagged-{uuid.uuid4().hex[:8]}@test.com",
            first_name="To Be",
            last_name="Flagged",
            red_flag=False,
        )
        db.add(human)
        db.flush()

        # Create application in IN_REVIEW status
        application = Applications(
            tenant_id=tenant_a.id,
            popup_id=popup_tenant_a.id,
            human_id=human.id,
            status=ApplicationStatus.IN_REVIEW.value,
        )
        db.add(application)
        db.commit()
        db.refresh(application)

        try:
            # Flag the human via API
            response = client.patch(
                f"/api/v1/humans/{human.id}",
                headers={"Authorization": f"Bearer {admin_token_tenant_a}"},
                json={"red_flag": True},
            )

            assert response.status_code == 200
            assert response.json()["red_flag"] is True

            # Check that application was rejected
            db.refresh(application)
            assert application.status == ApplicationStatus.REJECTED.value
        finally:
            # Clean up
            db.delete(application)
            db.delete(human)
            db.commit()

    def test_flagging_human_does_not_affect_already_rejected_applications(
        self,
        client: TestClient,
        db: Session,
        admin_token_tenant_a: str,
        tenant_a: Tenants,
        popup_tenant_a: Popups,
    ) -> None:
        """Flagging should not affect applications already in final states."""
        # Create normal human
        human = Humans(
            tenant_id=tenant_a.id,
            email=f"already-rejected-{uuid.uuid4().hex[:8]}@test.com",
            first_name="Already",
            last_name="Rejected",
            red_flag=False,
        )
        db.add(human)
        db.flush()

        # Create application already rejected
        application = Applications(
            tenant_id=tenant_a.id,
            popup_id=popup_tenant_a.id,
            human_id=human.id,
            status=ApplicationStatus.REJECTED.value,
        )
        db.add(application)
        db.commit()
        db.refresh(application)

        try:
            # Flag the human via API
            response = client.patch(
                f"/api/v1/humans/{human.id}",
                headers={"Authorization": f"Bearer {admin_token_tenant_a}"},
                json={"red_flag": True},
            )

            assert response.status_code == 200

            # Check that application is still rejected (unchanged)
            db.refresh(application)
            assert application.status == ApplicationStatus.REJECTED.value
        finally:
            # Clean up
            db.delete(application)
            db.delete(human)
            db.commit()
