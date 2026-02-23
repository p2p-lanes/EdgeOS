import uuid

from fastapi import APIRouter, HTTPException, status

from app.api.attendee import crud
from app.api.attendee.schemas import (
    AttendeePublic,
    AttendeeUpdate,
    AttendeeWithTickets,
    TicketProduct,
)
from app.api.shared.response import ListModel, PaginationLimit, PaginationSkip, Paging
from app.core.dependencies.users import CurrentUser, CurrentWriter, TenantSession

router = APIRouter(prefix="/attendees", tags=["attendees"])


# Note: Most attendee operations are done through the application routes
# These routes are for direct BO access


@router.get("", response_model=ListModel[AttendeePublic])
async def list_attendees(
    db: TenantSession,
    _: CurrentUser,
    application_id: uuid.UUID | None = None,
    popup_id: uuid.UUID | None = None,
    email: str | None = None,
    skip: PaginationSkip = 0,
    limit: PaginationLimit = 100,
) -> ListModel[AttendeePublic]:
    """List attendees with optional filters (BO only)."""
    if application_id:
        attendees = crud.attendees_crud.find_by_application(db, application_id)
        total = len(attendees)
        attendees = attendees[skip : skip + limit]
    elif popup_id:
        attendees, total = crud.attendees_crud.find_by_popup(
            db, popup_id=popup_id, skip=skip, limit=limit
        )
    elif email:
        attendees, total = crud.attendees_crud.find_by_email(
            db, email=email, skip=skip, limit=limit
        )
    else:
        attendees, total = crud.attendees_crud.find(db, skip=skip, limit=limit)

    results = []
    for a in attendees:
        # Build product list with quantities
        products = []
        for ap in a.attendee_products:
            from app.api.product.schemas import ProductWithQuantity

            product = ProductWithQuantity.model_validate(ap.product)
            product.quantity = ap.quantity
            products.append(product)

        attendee_data = AttendeePublic.model_validate(a)
        attendee_data.products = products
        results.append(attendee_data)

    return ListModel[AttendeePublic](
        results=results,
        paging=Paging(offset=skip, limit=limit, total=total),
    )


@router.get("/{attendee_id}", response_model=AttendeePublic)
async def get_attendee(
    attendee_id: uuid.UUID,
    db: TenantSession,
    _: CurrentUser,
) -> AttendeePublic:
    """Get a single attendee (BO only)."""
    attendee = crud.attendees_crud.get(db, attendee_id)

    if not attendee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attendee not found",
        )

    # Build product list with quantities
    products = []
    for ap in attendee.attendee_products:
        from app.api.product.schemas import ProductWithQuantity

        product_data = ap.product.__dict__.copy()
        product_data["quantity"] = ap.quantity
        products.append(ProductWithQuantity(**product_data))

    result = AttendeePublic.model_validate(attendee)
    result.products = products
    return result


@router.patch("/{attendee_id}", response_model=AttendeePublic)
async def update_attendee(
    attendee_id: uuid.UUID,
    attendee_in: AttendeeUpdate,
    db: TenantSession,
    _current_user: CurrentWriter,
) -> AttendeePublic:
    """Update an attendee (BO only)."""

    attendee = crud.attendees_crud.get(db, attendee_id)
    if not attendee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attendee not found",
        )

    updated = crud.attendees_crud.update_attendee(db, attendee, attendee_in)

    # Build product list
    products = []
    for ap in updated.attendee_products:
        from app.api.product.schemas import ProductWithQuantity

        product_data = ap.product.__dict__.copy()
        product_data["quantity"] = ap.quantity
        products.append(ProductWithQuantity(**product_data))

    result = AttendeePublic.model_validate(updated)
    result.products = products
    return result


@router.delete("/{attendee_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_attendee(
    attendee_id: uuid.UUID,
    db: TenantSession,
    _current_user: CurrentWriter,
) -> None:
    """Delete an attendee (BO only)."""

    attendee = crud.attendees_crud.get(db, attendee_id)
    if not attendee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attendee not found",
        )

    # Cannot delete main attendee
    if attendee.category == "main":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete main attendee",
        )

    crud.attendees_crud.delete_attendee(db, attendee)


@router.get("/check-in/{code}", response_model=AttendeePublic)
async def get_by_check_in_code(
    code: str,
    db: TenantSession,
    _: CurrentUser,
) -> AttendeePublic:
    """Get attendee by check-in code (BO - for check-in process)."""
    attendee = crud.attendees_crud.get_by_check_in_code(db, code.upper())

    if not attendee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attendee not found",
        )

    # Build product list with quantities
    products = []
    for ap in attendee.attendee_products:
        from app.api.product.schemas import ProductWithQuantity

        product_data = ap.product.__dict__.copy()
        product_data["quantity"] = ap.quantity
        products.append(ProductWithQuantity(**product_data))

    result = AttendeePublic.model_validate(attendee)
    result.products = products
    return result


@router.get("/tickets/{email}", response_model=list[AttendeeWithTickets])
async def get_tickets_by_email(
    email: str,
    db: TenantSession,
    _: CurrentUser,
) -> list[AttendeeWithTickets]:
    """Get all tickets/products for an email across all events (BO)."""
    attendees, _ = crud.attendees_crud.find_by_email(db, email=email, limit=1000)  # type: ignore[assignment]

    results = []
    for attendee in attendees:
        if not attendee.attendee_products:
            continue

        # Get popup through application
        popup = attendee.application.popup
        popup_name = popup.name if popup else "Unknown"

        ticket_products = []
        for ap in attendee.attendee_products:
            ticket_products.append(
                TicketProduct(
                    name=ap.product.name,
                    category=ap.product.category,
                    start_date=ap.product.start_date,
                    end_date=ap.product.end_date,
                    quantity=ap.quantity,
                )
            )

        results.append(
            AttendeeWithTickets(
                id=attendee.id,
                name=attendee.name,
                email=attendee.email,
                category=attendee.category,
                check_in_code=attendee.check_in_code,
                popup_id=popup.id if popup else attendee.application.popup_id,
                popup_name=popup_name,
                popup_slug=popup.slug if popup else None,
                products=ticket_products,
            )
        )

    return results
