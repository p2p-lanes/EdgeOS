"""
Approval Calculator Service

Calculates application status based on reviews and approval strategy.
"""

from datetime import UTC, datetime

from sqlmodel import Session

from app.api.application.models import Applications
from app.api.application.schemas import ApplicationStatus
from app.api.application_review.models import ApplicationReviews
from app.api.application_review.schemas import ReviewDecision
from app.api.approval_strategy.models import ApprovalStrategies
from app.api.approval_strategy.schemas import ApprovalStrategyType
from app.api.popup_reviewer.models import PopupReviewers


class ApprovalCalculator:
    """Calculate application status based on reviews and strategy."""

    def calculate_status(
        self,
        strategy: ApprovalStrategies | None,
        reviews: list[ApplicationReviews],
        designated_reviewers: list[PopupReviewers],
        *,
        human_red_flag: bool = False,
    ) -> ApplicationStatus:
        """
        Determine the application status based on:
        1. Strategy type (auto_accept, threshold, weighted, etc.)
        2. Current reviews
        3. Veto rules (any rejection = reject)
        4. Red flag status (red-flagged humans are automatically rejected)

        Returns ApplicationStatus.IN_REVIEW if no final decision can be made.
        """
        # Red-flagged humans are automatically rejected
        if human_red_flag:
            return ApplicationStatus.REJECTED

        # No strategy configured - stay in review (manual mode)
        if not strategy:
            return ApplicationStatus.IN_REVIEW

        # Handle auto-accept
        if strategy.strategy_type == ApprovalStrategyType.AUTO_ACCEPT:
            return ApplicationStatus.ACCEPTED

        # Calculate based on strategy type
        match strategy.strategy_type:
            case ApprovalStrategyType.ANY_REVIEWER:
                return self._calc_any_reviewer(reviews)
            case ApprovalStrategyType.ALL_REVIEWERS:
                return self._calc_all_reviewers(reviews, designated_reviewers)
            case ApprovalStrategyType.THRESHOLD:
                return self._calc_threshold(reviews, strategy.required_approvals)
            case ApprovalStrategyType.WEIGHTED:
                return self._calc_weighted(reviews, strategy)

        return ApplicationStatus.IN_REVIEW

    def _calc_any_reviewer(
        self, reviews: list[ApplicationReviews]
    ) -> ApplicationStatus:
        """Any single approval = accepted."""
        approvals = [
            r
            for r in reviews
            if r.decision in [ReviewDecision.YES, ReviewDecision.STRONG_YES]
        ]
        if approvals:
            return ApplicationStatus.ACCEPTED
        return ApplicationStatus.IN_REVIEW

    def _calc_all_reviewers(
        self,
        reviews: list[ApplicationReviews],
        designated_reviewers: list[PopupReviewers],
    ) -> ApplicationStatus:
        """All required reviewers must approve."""
        required_reviewer_ids = {
            r.user_id for r in designated_reviewers if r.is_required
        }

        # If no required reviewers, fall back to any reviewer
        if not required_reviewer_ids:
            return self._calc_any_reviewer(reviews)

        approved_ids = {
            r.reviewer_id
            for r in reviews
            if r.decision in [ReviewDecision.YES, ReviewDecision.STRONG_YES]
        }

        if required_reviewer_ids <= approved_ids:
            return ApplicationStatus.ACCEPTED
        return ApplicationStatus.IN_REVIEW

    def _calc_threshold(
        self,
        reviews: list[ApplicationReviews],
        required: int,
    ) -> ApplicationStatus:
        """N approvals required."""
        approvals = [
            r
            for r in reviews
            if r.decision in [ReviewDecision.YES, ReviewDecision.STRONG_YES]
        ]
        if len(approvals) >= required:
            return ApplicationStatus.ACCEPTED
        return ApplicationStatus.IN_REVIEW

    def _calc_weighted(
        self,
        reviews: list[ApplicationReviews],
        strategy: ApprovalStrategies,
    ) -> ApplicationStatus:
        """Weighted voting system."""
        score = 0
        for review in reviews:
            match review.decision:
                case ReviewDecision.STRONG_YES:
                    score += strategy.strong_yes_weight
                case ReviewDecision.YES:
                    score += strategy.yes_weight
                case ReviewDecision.NO:
                    score += strategy.no_weight
                case ReviewDecision.STRONG_NO:
                    score += strategy.strong_no_weight

        if score >= strategy.accept_threshold:
            return ApplicationStatus.ACCEPTED
        if score <= strategy.reject_threshold:
            return ApplicationStatus.REJECTED
        return ApplicationStatus.IN_REVIEW

    def recalculate_status(
        self,
        session: Session,
        application: Applications,
    ) -> Applications:
        """
        Recalculate and update application status based on current reviews.

        This method:
        1. Checks red_flag status (red-flagged humans are auto-rejected)
        2. Fetches the approval strategy for the popup
        3. Fetches all reviews for the application
        4. Fetches designated reviewers for the popup
        5. Calculates the new status
        6. Updates the application if status changed
        """
        from app.api.application.crud import applications_crud
        from app.api.application_review.crud import application_reviews_crud
        from app.api.approval_strategy.crud import approval_strategies_crud
        from app.api.human.crud import humans_crud
        from app.api.popup_reviewer.crud import popup_reviewers_crud

        # Skip if already in a final state (accepted, rejected, withdrawn)
        if application.status not in [
            ApplicationStatus.IN_REVIEW.value,
            ApplicationStatus.DRAFT.value,
        ]:
            return application

        # Get human red_flag status - fetch fresh from DB to ensure we have latest
        human = humans_crud.get(session, application.human_id)
        human_red_flag = human.red_flag if human else False

        # Red-flagged humans are immediately rejected
        if human_red_flag:
            if application.status != ApplicationStatus.REJECTED.value:
                application.status = ApplicationStatus.REJECTED.value
                session.add(application)
                applications_crud.create_snapshot(session, application, "auto_rejected")
                session.commit()
                session.refresh(application)
            return application

        # Only proceed with review-based calculation if IN_REVIEW
        if application.status != ApplicationStatus.IN_REVIEW.value:
            return application

        # Get strategy
        strategy = approval_strategies_crud.get_by_popup(session, application.popup_id)

        # Get reviews - use find_all since we need all of them for calculation
        reviews = application_reviews_crud.find_all_by_application(
            session, application.id
        )

        # Get designated reviewers (typically bounded by design - few reviewers per popup)
        reviewers = popup_reviewers_crud.find_all_by_popup(
            session, application.popup_id
        )

        # Calculate new status (human_red_flag is False here since we handled it above)
        new_status = self.calculate_status(
            strategy, reviews, reviewers, human_red_flag=False
        )

        # Update if changed
        if new_status.value != application.status:
            application.status = new_status.value

            if new_status == ApplicationStatus.ACCEPTED:
                application.accepted_at = datetime.now(UTC)
                # Create snapshot
                applications_crud.create_snapshot(session, application, "accepted")
            elif new_status == ApplicationStatus.REJECTED:
                # Create snapshot
                applications_crud.create_snapshot(session, application, "rejected")

            session.add(application)
            session.commit()
            session.refresh(application)

        return application


# Singleton instance
approval_calculator = ApprovalCalculator()
