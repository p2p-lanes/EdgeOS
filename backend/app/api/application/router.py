import csv
import io
import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import Response

from app.api.application import crud
from app.api.application.schemas import (
    ApplicationAdminCreate,
    ApplicationAdminUpdate,
    ApplicationCreate,
    ApplicationPublic,
    ApplicationStatus,
    ApplicationUpdate,
    AssociatedAttendee,
    AttendeesDirectoryEntry,
    DirectoryProduct,
)
from app.api.attendee.schemas import (
    AttendeeCreate,
    AttendeePublic,
    AttendeeUpdate,
    AttendeeWithTickets,
)
from app.api.shared.enums import UserRole
from app.api.shared.response import ListModel, PaginationLimit, PaginationSkip, Paging
from app.core.dependencies.users import (
    CurrentHuman,
    CurrentUser,
    CurrentWriter,
    HumanTenantSession,
    TenantSession,
)
from app.services.email import ApplicationReceivedContext, get_email_service

router = APIRouter(prefix="/applications", tags=["applications"])

# Valid admin status transitions: current_status -> set of allowed next statuses
ALLOWED_ADMIN_TRANSITIONS: dict[str, set[str]] = {
    ApplicationStatus.DRAFT.value: {
        ApplicationStatus.IN_REVIEW.value,
        ApplicationStatus.WITHDRAWN.value,
    },
    ApplicationStatus.IN_REVIEW.value: {
        ApplicationStatus.ACCEPTED.value,
        ApplicationStatus.REJECTED.value,
        ApplicationStatus.WITHDRAWN.value,
    },
    ApplicationStatus.ACCEPTED.value: {
        ApplicationStatus.WITHDRAWN.value,
    },
    ApplicationStatus.REJECTED.value: {
        ApplicationStatus.IN_REVIEW.value,
    },
    ApplicationStatus.WITHDRAWN.value: set(),  # terminal state
}


def _build_application_public(application) -> ApplicationPublic:
    """Build ApplicationPublic with attendees and products."""
    attendees = []
    for a in application.attendees:
        products = []
        for ap in a.attendee_products:
            from app.api.product.schemas import ProductWithQuantity

            product = ProductWithQuantity.model_validate(ap.product)
            product.quantity = ap.quantity
            products.append(product)

        attendee_data = AttendeePublic.model_validate(a)
        attendee_data.products = products
        attendees.append(attendee_data)

    app_public = ApplicationPublic.model_validate(application)
    app_public.attendees = attendees
    app_public.red_flag = application.red_flag
    return app_public


# ========================
# BO (Backoffice) Routes
# ========================


@router.get("", response_model=ListModel[ApplicationPublic])
async def list_applications(
    db: TenantSession,
    _: CurrentUser,
    popup_id: uuid.UUID | None = None,
    human_id: uuid.UUID | None = None,
    status_filter: ApplicationStatus | None = None,
    search: str | None = None,
    skip: PaginationSkip = 0,
    limit: PaginationLimit = 100,
) -> ListModel[ApplicationPublic]:
    """List applications with optional filters (BO only)."""
    if popup_id:
        applications, total = crud.applications_crud.find_by_popup(
            db,
            popup_id=popup_id,
            skip=skip,
            limit=limit,
            status_filter=status_filter,
            search=search,
        )
    elif human_id:
        applications, total = crud.applications_crud.find_by_human(
            db, human_id=human_id, skip=skip, limit=limit
        )
    else:
        applications, total = crud.applications_crud.find(db, skip=skip, limit=limit)

    results = [_build_application_public(a) for a in applications]

    return ListModel[ApplicationPublic](
        results=results,
        paging=Paging(offset=skip, limit=limit, total=total),
    )


@router.post("", response_model=ApplicationPublic, status_code=status.HTTP_201_CREATED)
async def create_application_admin(
    app_in: ApplicationAdminCreate,
    db: TenantSession,
    current_user: CurrentWriter,
) -> ApplicationPublic:
    """Create an application as admin (BO only - superadmin for testing).

    This endpoint allows creating applications on behalf of users.
    A Human record will be found or created based on the email.
    """

    # For now, only superadmins can create applications via backoffice
    if current_user.role != UserRole.SUPERADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only superadmins can create applications via backoffice",
        )

    # Get tenant_id from current user or popup
    if current_user.tenant_id:
        tenant_id = current_user.tenant_id
    else:
        # Superadmin - get tenant from popup
        from app.api.popup.crud import popups_crud

        popup = popups_crud.get(db, app_in.popup_id)
        if not popup:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Popup not found",
            )
        tenant_id = popup.tenant_id

    application = crud.applications_crud.create_admin(
        db,
        app_data=app_in,
        tenant_id=tenant_id,
    )

    return _build_application_public(application)


@router.get("/{application_id}", response_model=ApplicationPublic)
async def get_application(
    application_id: uuid.UUID,
    db: TenantSession,
    _: CurrentUser,
) -> ApplicationPublic:
    """Get a single application (BO only)."""
    application = crud.applications_crud.get(db, application_id)

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    return _build_application_public(application)


@router.patch("/{application_id}", response_model=ApplicationPublic)
async def update_application_admin(
    application_id: uuid.UUID,
    app_in: ApplicationAdminUpdate,
    db: TenantSession,
    _current_user: CurrentWriter,
) -> ApplicationPublic:
    """Update an application (BO - admin access with extended fields)."""

    application = crud.applications_crud.get(db, application_id)
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    # Validate state transition
    if app_in.status is not None:
        current = application.status
        requested = app_in.status.value
        allowed = ALLOWED_ADMIN_TRANSITIONS.get(current, set())
        if requested != current and requested not in allowed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot transition from '{current}' to '{requested}'",
            )

    # Prevent accepting red-flagged humans
    if app_in.status == ApplicationStatus.ACCEPTED:
        human_red_flag = application.human.red_flag if application.human else False
        if human_red_flag:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot accept application from a red-flagged human.",
            )

    # Handle status change to ACCEPTED
    if (
        app_in.status == ApplicationStatus.ACCEPTED
        and application.status != ApplicationStatus.ACCEPTED.value
    ):
        app_in_dict = app_in.model_dump(exclude_unset=True)
        app_in_dict["accepted_at"] = datetime.now(UTC)
        app_in_dict["status"] = app_in.status.value

        for field, value in app_in_dict.items():
            setattr(application, field, value)
    else:
        update_data = app_in.model_dump(exclude_unset=True)
        if "status" in update_data and hasattr(update_data["status"], "value"):
            update_data["status"] = update_data["status"].value

        for field, value in update_data.items():
            setattr(application, field, value)

    db.add(application)
    db.commit()
    db.refresh(application)

    return _build_application_public(application)


@router.delete("/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_application(
    application_id: uuid.UUID,
    db: TenantSession,
    _current_user: CurrentWriter,
) -> None:
    """Delete an application (BO only)."""

    application = crud.applications_crud.get(db, application_id)
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    crud.applications_crud.delete(db, application)


# ========================
# Portal (Human) Routes
# ========================


@router.get("/my/applications", response_model=ListModel[ApplicationPublic])
async def list_my_applications(
    db: HumanTenantSession,
    current_human: CurrentHuman,
    skip: PaginationSkip = 0,
    limit: PaginationLimit = 100,
) -> ListModel[ApplicationPublic]:
    """List applications for the current human (Portal)."""
    applications, total = crud.applications_crud.find_by_human(
        db, human_id=current_human.id, skip=skip, limit=limit
    )

    results = [_build_application_public(a) for a in applications]

    return ListModel[ApplicationPublic](
        results=results,
        paging=Paging(offset=skip, limit=limit, total=total),
    )


@router.get("/my/tickets", response_model=list[AttendeeWithTickets])
async def list_my_tickets(
    db: HumanTenantSession,
    current_human: CurrentHuman,
) -> list[AttendeeWithTickets]:
    """List all tickets for the current human (Portal).

    Returns all attendee records linked to this human, including:
    - Attendees from applications they submitted (main attendee)
    - Attendees created by others with their email (e.g., spouse tickets)

    Each attendee includes their check-in code and purchased products.
    """
    from app.api.attendee.crud import attendees_crud
    from app.api.attendee.schemas import TicketProduct

    attendees, _ = attendees_crud.find_by_human(
        db, human_id=current_human.id, limit=1000
    )

    results = []
    for attendee in attendees:
        # Get popup info through application
        popup = attendee.application.popup

        # Build product list
        products = []
        for ap in attendee.attendee_products:
            products.append(
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
                popup_id=popup.id,
                popup_name=popup.name,
                popup_slug=popup.slug,
                products=products,
            )
        )

    return results


@router.get("/my/{popup_id}", response_model=ApplicationPublic)
async def get_my_application(
    popup_id: uuid.UUID,
    db: HumanTenantSession,
    current_human: CurrentHuman,
) -> ApplicationPublic:
    """Get current human's application for a popup (Portal)."""
    application = crud.applications_crud.get_by_human_popup(
        db, human_id=current_human.id, popup_id=popup_id
    )

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    return _build_application_public(application)


@router.post(
    "/my", response_model=ApplicationPublic, status_code=status.HTTP_201_CREATED
)
async def create_my_application(
    app_in: ApplicationCreate,
    db: HumanTenantSession,
    current_human: CurrentHuman,
) -> ApplicationPublic:
    """Create an application for the current human (Portal)."""
    # Check for existing application
    existing = crud.applications_crud.get_by_human_popup(
        db, human_id=current_human.id, popup_id=app_in.popup_id
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have an application for this popup",
        )

    # Create application
    application = crud.applications_crud.create_internal(
        db,
        app_data=app_in,
        tenant_id=current_human.tenant_id,
        human_id=current_human.id,
    )

    # Send application received email if status is IN_REVIEW
    if application.status == ApplicationStatus.IN_REVIEW:
        email_service = get_email_service()
        await email_service.send_application_received(
            to=current_human.email,
            subject=f"Application Received for {application.popup.name}",
            context=ApplicationReceivedContext(
                first_name=current_human.first_name or "",
                last_name=current_human.last_name or "",
                email=current_human.email,
                popup_name=application.popup.name,
            ),
            from_address=application.popup.tenant.sender_email,
            from_name=application.popup.tenant.sender_name,
            popup_id=application.popup_id,
            db_session=db,
        )

    return _build_application_public(application)


@router.patch("/my/{popup_id}", response_model=ApplicationPublic)
async def update_my_application(
    popup_id: uuid.UUID,
    app_in: ApplicationUpdate,
    db: HumanTenantSession,
    current_human: CurrentHuman,
) -> ApplicationPublic:
    """Update current human's application (Portal)."""
    from app.api.human.crud import humans_crud
    from app.api.human.schemas import HumanUpdate

    application = crud.applications_crud.get_by_human_popup(
        db, human_id=current_human.id, popup_id=popup_id
    )

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    # Only allow updates for draft or in_review
    if application.status not in [
        ApplicationStatus.DRAFT.value,
        ApplicationStatus.IN_REVIEW.value,
    ]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot update application in current status",
        )

    update_data = app_in.model_dump(exclude_unset=True)

    # Separate profile fields (belong to Human) from application fields
    profile_field_names = {
        "first_name",
        "last_name",
        "telegram",
        "organization",
        "role",
        "gender",
        "age",
        "residence",
    }
    app_field_names = {"referral", "info_not_shared", "custom_fields", "status"}

    # Update human profile with profile fields
    profile_update = {k: v for k, v in update_data.items() if k in profile_field_names}
    if profile_update and application.human:
        humans_crud.update(db, application.human, HumanUpdate(**profile_update))

    # Apply only application fields to the application
    for field, value in update_data.items():
        if field not in app_field_names:
            continue
        if field == "status" and hasattr(value, "value"):
            value = value.value
        setattr(application, field, value)

    # Handle status change to IN_REVIEW
    status_value = update_data.get("status")
    if hasattr(status_value, "value"):
        status_value = status_value.value
    if (
        status_value == ApplicationStatus.IN_REVIEW.value
        and not application.submitted_at
    ):
        application.submitted_at = datetime.now(UTC)

    db.add(application)
    db.commit()
    db.refresh(application)

    return _build_application_public(application)


# ========================
# Attendees Directory (Portal)
# ========================


def _build_directory_entry(application) -> AttendeesDirectoryEntry:
    """Build a single directory entry from an application."""
    human = application.human
    info_hidden = set(application.info_not_shared or [])

    def mask(field: str, value: str | None) -> str | None:
        return "*" if field in info_hidden else value

    # Find main attendee and their products
    main_attendee = application.get_main_attendee()
    products: list[DirectoryProduct] = []
    check_in = None
    check_out = None

    if main_attendee:
        for ap in main_attendee.attendee_products:
            p = ap.product
            products.append(
                DirectoryProduct(
                    id=p.id,
                    name=p.name,
                    slug=p.slug,
                    category=p.category,
                    duration_type=p.duration_type,
                    start_date=p.start_date,
                    end_date=p.end_date,
                )
            )
            # Compute check_in/check_out as earliest start / latest end
            if p.start_date:
                if check_in is None or p.start_date < check_in:
                    check_in = p.start_date
            if p.end_date:
                if check_out is None or p.end_date > check_out:
                    check_out = p.end_date

    # Compute brings_kids (masked if in info_not_shared)
    has_kids = any(a.category == "kid" for a in application.attendees)
    brings_kids: bool | str = "*" if "brings_kids" in info_hidden else has_kids

    # Associated attendees (non-main)
    associated = [
        AssociatedAttendee(
            name=a.name,
            category=a.category,
            gender=a.gender,
            email=a.email,
        )
        for a in application.attendees
        if a.category != "main"
    ]

    return AttendeesDirectoryEntry(
        id=application.id,
        first_name=mask("first_name", human.first_name if human else None),
        last_name=mask("last_name", human.last_name if human else None),
        email=mask("email", human.email if human else None),
        telegram=mask("telegram", human.telegram if human else None),
        role=mask("role", human.role if human else None),
        organization=mask("organization", human.organization if human else None),
        residence=mask("residence", human.residence if human else None),
        age=mask("age", human.age if human else None),
        gender=mask("gender", human.gender if human else None),
        picture_url=human.picture_url if human else None,
        brings_kids=brings_kids,
        participation=products,
        check_in=check_in,
        check_out=check_out,
        associated_attendees=associated,
    )


@router.get(
    "/my/directory/{popup_id}", response_model=ListModel[AttendeesDirectoryEntry]
)
async def list_attendees_directory(
    popup_id: uuid.UUID,
    db: HumanTenantSession,
    _: CurrentHuman,
    skip: PaginationSkip = 0,
    limit: PaginationLimit = 100,
    q: str | None = None,
    brings_kids: bool | None = None,
    participation: str | None = None,
) -> ListModel[AttendeesDirectoryEntry]:
    """List attendees directory for a popup (Portal).

    Returns accepted/in-review applications with at least one product.
    Respects info_not_shared masking.
    """
    applications, total = crud.applications_crud.find_directory(
        db,
        popup_id=popup_id,
        skip=skip,
        limit=limit,
        q=q,
        brings_kids=brings_kids,
        participation=participation,
    )

    results = [_build_directory_entry(a) for a in applications]

    return ListModel[AttendeesDirectoryEntry](
        results=results,
        paging=Paging(offset=skip, limit=limit, total=total),
    )


@router.get("/my/directory/{popup_id}/csv")
async def export_attendees_directory_csv(
    popup_id: uuid.UUID,
    db: HumanTenantSession,
    _: CurrentHuman,
    q: str | None = None,
    brings_kids: bool | None = None,
    participation: str | None = None,
) -> Response:
    """Export attendees directory as CSV (Portal).

    No pagination — fetches all matching entries.
    """
    applications, _ = crud.applications_crud.find_directory(
        db,
        popup_id=popup_id,
        skip=0,
        limit=10000,
        q=q,
        brings_kids=brings_kids,
        participation=participation,
    )

    entries = [_build_directory_entry(a) for a in applications]

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(
        [
            "First Name",
            "Last Name",
            "Email",
            "Telegram",
            "Role",
            "Organization",
            "Residence",
            "Age",
            "Gender",
            "Brings Kids",
            "Check In",
            "Check Out",
        ]
    )
    for e in entries:
        writer.writerow(
            [
                e.first_name or "",
                e.last_name or "",
                e.email or "",
                e.telegram or "",
                e.role or "",
                e.organization or "",
                e.residence or "",
                e.age or "",
                e.gender or "",
                str(e.brings_kids),
                e.check_in.isoformat() if e.check_in else "",
                e.check_out.isoformat() if e.check_out else "",
            ]
        )

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=attendees.csv"},
    )


# ========================
# Attendee Management (Portal)
# ========================


@router.post(
    "/my/{popup_id}/attendees",
    response_model=ApplicationPublic,
    status_code=status.HTTP_201_CREATED,
)
async def add_my_attendee(
    popup_id: uuid.UUID,
    attendee_in: AttendeeCreate,
    db: HumanTenantSession,
    current_human: CurrentHuman,
) -> ApplicationPublic:
    """Add an attendee to current human's application (Portal)."""
    application = crud.applications_crud.get_by_human_popup(
        db, human_id=current_human.id, popup_id=popup_id
    )

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    crud.applications_crud.create_attendee(
        db,
        application=application,
        name=attendee_in.name,
        category=attendee_in.category,
        email=attendee_in.email,
        gender=attendee_in.gender,
    )

    return _build_application_public(application)


@router.patch(
    "/my/{popup_id}/attendees/{attendee_id}",
    response_model=ApplicationPublic,
)
async def update_my_attendee(
    popup_id: uuid.UUID,
    attendee_id: uuid.UUID,
    attendee_in: AttendeeUpdate,
    db: HumanTenantSession,
    current_human: CurrentHuman,
) -> ApplicationPublic:
    """Update an attendee in current human's application (Portal)."""
    from app.api.attendee.crud import attendees_crud

    application = crud.applications_crud.get_by_human_popup(
        db, human_id=current_human.id, popup_id=popup_id
    )

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    # Find attendee
    attendee = next((a for a in application.attendees if a.id == attendee_id), None)
    if not attendee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attendee not found",
        )

    # Check for duplicate email
    if attendee_in.email:
        existing_emails = [
            a.email for a in application.attendees if a.email and a.id != attendee_id
        ]
        if attendee_in.email.lower() in existing_emails:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Attendee with this email already exists",
            )

    attendees_crud.update_attendee(db, attendee, attendee_in)
    db.refresh(application)

    return _build_application_public(application)


@router.delete(
    "/my/{popup_id}/attendees/{attendee_id}",
    response_model=ApplicationPublic,
)
async def delete_my_attendee(
    popup_id: uuid.UUID,
    attendee_id: uuid.UUID,
    db: HumanTenantSession,
    current_human: CurrentHuman,
) -> ApplicationPublic:
    """Delete an attendee from current human's application (Portal)."""
    application = crud.applications_crud.get_by_human_popup(
        db, human_id=current_human.id, popup_id=popup_id
    )

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    crud.applications_crud.delete_attendee(db, application, attendee_id)

    return _build_application_public(application)
