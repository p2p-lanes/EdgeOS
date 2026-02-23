import uuid
from datetime import UTC, datetime

from fastapi import HTTPException, status
from sqlmodel import Session, col, select

from app.api.coupon.models import Coupons
from app.api.coupon.schemas import CouponCreate, CouponUpdate
from app.api.shared.crud import BaseCRUD


class CouponsCRUD(BaseCRUD[Coupons, CouponCreate, CouponUpdate]):
    """CRUD operations for Coupons."""

    def __init__(self) -> None:
        super().__init__(Coupons)

    def get_by_code(
        self, session: Session, code: str, popup_id: uuid.UUID
    ) -> Coupons | None:
        """Get a coupon by code and popup_id."""
        statement = select(Coupons).where(
            Coupons.code == code.upper(), Coupons.popup_id == popup_id
        )
        return session.exec(statement).first()

    def validate_coupon(
        self, session: Session, code: str, popup_id: uuid.UUID
    ) -> Coupons:
        """
        Validate a coupon code and return it if valid.

        Raises:
            HTTPException: If coupon is invalid, expired, or maxed out.
        """
        coupon = self.get_by_code(session, code, popup_id)

        if not coupon:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Coupon code not found",
            )

        if not coupon.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Coupon code is not active",
            )

        now = datetime.now(UTC)

        if coupon.start_date and now < coupon.start_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Coupon code is not yet valid",
            )

        if coupon.end_date and now > coupon.end_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Coupon code has expired",
            )

        if coupon.max_uses is not None and coupon.current_uses >= coupon.max_uses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Coupon code has reached maximum uses",
            )

        return coupon

    def use_coupon(self, session: Session, coupon_id: uuid.UUID) -> Coupons:
        """Increment the usage count of a coupon."""
        coupon = self.get(session, coupon_id)
        if not coupon:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Coupon not found",
            )

        coupon.current_uses += 1
        session.add(coupon)
        session.commit()
        session.refresh(coupon)
        return coupon

    def find_by_popup(
        self,
        session: Session,
        popup_id: uuid.UUID,
        skip: int = 0,
        limit: int = 100,
        is_active: bool | None = None,
        search: str | None = None,
    ) -> tuple[list[Coupons], int]:
        """Find coupons by popup_id with optional filters."""
        statement = select(Coupons).where(Coupons.popup_id == popup_id)

        if is_active is not None:
            statement = statement.where(Coupons.is_active == is_active)

        # Apply text search if provided
        if search:
            search_term = f"%{search}%"
            statement = statement.where(col(Coupons.code).ilike(search_term))

        # Get total count
        from sqlmodel import func

        count_statement = select(func.count()).select_from(statement.subquery())
        total = session.exec(count_statement).one()

        # Apply pagination
        statement = statement.offset(skip).limit(limit)
        results = list(session.exec(statement).all())

        return results, total


coupons_crud = CouponsCRUD()
