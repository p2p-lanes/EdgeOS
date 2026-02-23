import json
import secrets
from datetime import UTC, datetime
from decimal import Decimal
from pathlib import Path

from dateutil.parser import parse as parse_datetime
from loguru import logger
from sqlmodel import Session, create_engine, select

from app.api.shared.enums import UserRole
from app.core.config import settings

engine = create_engine(
    str(settings.SQLALCHEMY_DATABASE_URI),
    pool_size=5,
    max_overflow=10,  # Allow burst connections beyond pool_size
    pool_pre_ping=True,  # Verify connections before use
    pool_recycle=3600,  # Recycle connections after 1 hour
    pool_timeout=30,  # Wait max 30s for a connection from pool
)

SEED_DATA_PATH = Path(__file__).parent / "seed_data.json"


def _load_seed_data() -> dict:
    """Load seed data from JSON file."""
    with open(SEED_DATA_PATH) as f:
        return json.load(f)


def _generate_check_in_code() -> str:
    """Generate a unique check-in code for attendees."""
    return secrets.token_hex(4).upper()


def init_db(session: Session) -> None:
    from app.core.tenant_db import ensure_tenant_credentials
    from app.models import (
        Applications,
        AttendeeProducts,
        Attendees,
        Coupons,
        FormFields,
        GroupLeaders,
        GroupMembers,
        Groups,
        Humans,
        PaymentProducts,
        Payments,
        Popups,
        Products,
        Tenants,
        Users,
    )

    seed_data = _load_seed_data()

    # Create superadmin
    user = session.exec(select(Users).where(Users.email == settings.SUPERADMIN)).first()
    if not user:
        user = Users(
            email=settings.SUPERADMIN,
            role=UserRole.SUPERADMIN,
        )
        session.add(user)
        session.commit()
        logger.info(f"Superadmin created: {settings.SUPERADMIN}")

    # Create demo tenant from seed data
    tenant_data = seed_data["tenant"]
    demo_tenant = session.exec(
        select(Tenants).where(Tenants.slug == tenant_data["slug"])
    ).first()
    if not demo_tenant:
        demo_tenant = Tenants(
            name=tenant_data["name"],
            slug=tenant_data["slug"],
        )
        session.add(demo_tenant)
        session.commit()
        session.refresh(demo_tenant)
        logger.info(f"Demo tenant created: {demo_tenant.id}")

        ensure_tenant_credentials(session, demo_tenant.id)
        logger.info("Demo tenant credentials created")

    # Create demo users from seed data
    users_data = seed_data["users"]
    for user_key, user_data in users_data.items():
        existing_user = session.exec(
            select(Users).where(
                Users.email == user_data["email"], Users.tenant_id == demo_tenant.id
            )
        ).first()
        if not existing_user:
            new_user = Users(
                email=user_data["email"],
                full_name=user_data.get("full_name"),
                role=UserRole(user_data["role"]),
                tenant_id=demo_tenant.id,
            )
            session.add(new_user)
            session.commit()
            logger.info(f"Demo {user_key} user created: {user_data['email']}")

    # =========================================================================
    # Create popups
    # =========================================================================
    popup_map: dict[str, Popups] = {}
    for popup_data in seed_data.get("popups", []):
        popup_key = popup_data["key"]
        existing_popup = session.exec(
            select(Popups).where(
                Popups.slug == popup_data["slug"], Popups.tenant_id == demo_tenant.id
            )
        ).first()
        if existing_popup:
            popup_map[popup_key] = existing_popup
        else:
            popup = Popups(
                tenant_id=demo_tenant.id,
                name=popup_data["name"],
                slug=popup_data["slug"],
                status=popup_data.get("status", "draft"),
                requires_approval=popup_data.get("requires_approval", False),
                allows_spouse=popup_data.get("allows_spouse", False),
                allows_children=popup_data.get("allows_children", False),
                allows_coupons=popup_data.get("allows_coupons", False),
                start_date=(
                    parse_datetime(popup_data["start_date"])
                    if popup_data.get("start_date")
                    else None
                ),
                end_date=(
                    parse_datetime(popup_data["end_date"])
                    if popup_data.get("end_date")
                    else None
                ),
            )
            session.add(popup)
            session.commit()
            session.refresh(popup)
            popup_map[popup_key] = popup
            logger.info(f"Popup created: {popup.name} ({popup_key})")

    # =========================================================================
    # Create products
    # =========================================================================
    product_map: dict[str, Products] = {}  # Key: "{popup_key}:{product_slug}"
    for product_data in seed_data.get("products", []):
        popup_key = product_data["popup_key"]
        popup = popup_map.get(popup_key)
        if not popup:
            logger.warning(
                f"Popup {popup_key} not found for product {product_data['name']}"
            )
            continue

        product_slug = product_data["slug"]
        map_key = f"{popup_key}:{product_slug}"

        existing_product = session.exec(
            select(Products).where(
                Products.slug == product_slug, Products.popup_id == popup.id
            )
        ).first()
        if existing_product:
            product_map[map_key] = existing_product
        else:
            product = Products(
                tenant_id=demo_tenant.id,
                popup_id=popup.id,
                name=product_data["name"],
                slug=product_slug,
                price=Decimal(product_data["price"]),
                compare_price=(
                    Decimal(product_data["compare_price"])
                    if product_data.get("compare_price")
                    else None
                ),
                description=product_data.get("description"),
                category=product_data.get("category", "ticket"),
                attendee_category=product_data.get("attendee_category"),
                duration_type=product_data.get("duration_type"),
                start_date=(
                    parse_datetime(product_data["start_date"])
                    if product_data.get("start_date")
                    else None
                ),
                end_date=(
                    parse_datetime(product_data["end_date"])
                    if product_data.get("end_date")
                    else None
                ),
                is_active=product_data.get("is_active", True),
                exclusive=product_data.get("exclusive", False),
                max_quantity=product_data.get("max_quantity"),
            )
            session.add(product)
            session.commit()
            session.refresh(product)
            product_map[map_key] = product
            logger.info(f"Product created: {product.name} for {popup_key}")

    # =========================================================================
    # Create form fields
    # =========================================================================
    for field_data in seed_data.get("form_fields", []):
        popup_key = field_data["popup_key"]
        popup = popup_map.get(popup_key)
        if not popup:
            logger.warning(
                f"Popup {popup_key} not found for form field {field_data['name']}"
            )
            continue

        existing_field = session.exec(
            select(FormFields).where(
                FormFields.name == field_data["name"], FormFields.popup_id == popup.id
            )
        ).first()
        if not existing_field:
            field = FormFields(
                tenant_id=demo_tenant.id,
                popup_id=popup.id,
                name=field_data["name"],
                label=field_data["label"],
                field_type=field_data.get("field_type", "text"),
                section=field_data.get("section"),
                position=field_data.get("position", 0),
                required=field_data.get("required", False),
                options=field_data.get("options"),
                placeholder=field_data.get("placeholder"),
                help_text=field_data.get("help_text"),
            )
            session.add(field)
            session.commit()
            logger.info(f"Form field created: {field.name} for {popup_key}")

    # =========================================================================
    # Create coupons
    # =========================================================================
    coupon_map: dict[str, Coupons] = {}  # Key: "{popup_key}:{code}"
    for coupon_data in seed_data.get("coupons", []):
        popup_key = coupon_data["popup_key"]
        popup = popup_map.get(popup_key)
        if not popup:
            logger.warning(
                f"Popup {popup_key} not found for coupon {coupon_data['code']}"
            )
            continue

        code = coupon_data["code"].upper()
        map_key = f"{popup_key}:{code}"

        existing_coupon = session.exec(
            select(Coupons).where(Coupons.code == code, Coupons.popup_id == popup.id)
        ).first()
        if existing_coupon:
            coupon_map[map_key] = existing_coupon
        else:
            coupon = Coupons(
                tenant_id=demo_tenant.id,
                popup_id=popup.id,
                code=code,
                discount_value=coupon_data["discount_value"],
                max_uses=coupon_data.get("max_uses"),
                start_date=(
                    parse_datetime(coupon_data["start_date"])
                    if coupon_data.get("start_date")
                    else None
                ),
                end_date=(
                    parse_datetime(coupon_data["end_date"])
                    if coupon_data.get("end_date")
                    else None
                ),
                is_active=coupon_data.get("is_active", True),
            )
            session.add(coupon)
            session.commit()
            session.refresh(coupon)
            coupon_map[map_key] = coupon
            logger.info(f"Coupon created: {coupon.code} for {popup_key}")

    # =========================================================================
    # Create humans
    # =========================================================================
    human_map: dict[str, Humans] = {}
    for human_data in seed_data.get("humans", []):
        human_key = human_data["key"]
        email = human_data["email"].lower().strip()

        existing_human = session.exec(
            select(Humans).where(
                Humans.email == email, Humans.tenant_id == demo_tenant.id
            )
        ).first()
        if existing_human:
            human_map[human_key] = existing_human
        else:
            human = Humans(
                tenant_id=demo_tenant.id,
                email=email,
                first_name=human_data.get("first_name"),
                last_name=human_data.get("last_name"),
                telegram=human_data.get("telegram"),
                organization=human_data.get("organization"),
                role=human_data.get("role"),
                gender=human_data.get("gender"),
                age=human_data.get("age"),
                residence=human_data.get("residence"),
                red_flag=human_data.get("red_flag", False),
            )
            session.add(human)
            session.commit()
            session.refresh(human)
            human_map[human_key] = human
            logger.info(f"Human created: {human.email} ({human_key})")

    # =========================================================================
    # Create groups (without members/leaders first)
    # =========================================================================
    group_map: dict[str, Groups] = {}
    for group_data in seed_data.get("groups", []):
        group_key = group_data["key"]
        popup_key = group_data["popup_key"]
        popup = popup_map.get(popup_key)
        if not popup:
            logger.warning(
                f"Popup {popup_key} not found for group {group_data['name']}"
            )
            continue

        existing_group = session.exec(
            select(Groups).where(
                Groups.slug == group_data["slug"], Groups.popup_id == popup.id
            )
        ).first()
        if existing_group:
            group_map[group_key] = existing_group
        else:
            ambassador_id = None
            if group_data.get("ambassador_key"):
                ambassador = human_map.get(group_data["ambassador_key"])
                if ambassador:
                    ambassador_id = ambassador.id

            group = Groups(
                tenant_id=demo_tenant.id,
                popup_id=popup.id,
                name=group_data["name"],
                slug=group_data["slug"],
                description=group_data.get("description"),
                discount_percentage=Decimal(group_data.get("discount_percentage", "0")),
                max_members=group_data.get("max_members"),
                welcome_message=group_data.get("welcome_message"),
                is_ambassador_group=group_data.get("is_ambassador_group", False),
                ambassador_id=ambassador_id,
            )
            session.add(group)
            session.commit()
            session.refresh(group)
            group_map[group_key] = group
            logger.info(f"Group created: {group.name} ({group_key})")

    # Add leaders and members to groups
    for group_data in seed_data.get("groups", []):
        group_key = group_data["key"]
        group = group_map.get(group_key)
        if not group:
            continue

        # Add leaders
        for leader_key in group_data.get("leader_keys", []):
            human = human_map.get(leader_key)
            if human:
                existing_leader = session.exec(
                    select(GroupLeaders).where(
                        GroupLeaders.group_id == group.id,
                        GroupLeaders.human_id == human.id,
                    )
                ).first()
                if not existing_leader:
                    leader_link = GroupLeaders(
                        tenant_id=demo_tenant.id,
                        group_id=group.id,
                        human_id=human.id,
                    )
                    session.add(leader_link)
                    session.commit()
                    logger.info(f"Added {leader_key} as leader to {group_key}")

        # Add members
        for member_key in group_data.get("member_keys", []):
            human = human_map.get(member_key)
            if human:
                existing_member = session.exec(
                    select(GroupMembers).where(
                        GroupMembers.group_id == group.id,
                        GroupMembers.human_id == human.id,
                    )
                ).first()
                if not existing_member:
                    member_link = GroupMembers(
                        tenant_id=demo_tenant.id,
                        group_id=group.id,
                        human_id=human.id,
                    )
                    session.add(member_link)
                    session.commit()
                    logger.info(f"Added {member_key} as member to {group_key}")

    # =========================================================================
    # Create applications with attendees
    # =========================================================================
    application_map: dict[str, Applications] = {}
    attendee_lists: dict[str, list[Attendees]] = {}  # app_key -> list of attendees

    for app_data in seed_data.get("applications", []):
        app_key = app_data["key"]
        popup_key = app_data["popup_key"]
        human_key = app_data["human_key"]

        popup = popup_map.get(popup_key)
        human = human_map.get(human_key)

        if not popup or not human:
            logger.warning(f"Popup or human not found for application {app_key}")
            continue

        # Check if application already exists
        existing_app = session.exec(
            select(Applications).where(
                Applications.human_id == human.id, Applications.popup_id == popup.id
            )
        ).first()
        if existing_app:
            application_map[app_key] = existing_app
            # Load existing attendees
            existing_attendees = session.exec(
                select(Attendees).where(Attendees.application_id == existing_app.id)
            ).all()
            attendee_lists[app_key] = list(existing_attendees)
            continue

        group_id = None
        if app_data.get("group_key"):
            group = group_map.get(app_data["group_key"])
            if group:
                group_id = group.id

        # Determine timestamps based on status
        submitted_at = None
        accepted_at = None
        status = app_data.get("status", "draft")
        if status in ["in review", "accepted", "rejected"]:
            submitted_at = datetime.now(UTC)
        if status == "accepted":
            accepted_at = datetime.now(UTC)

        application = Applications(
            tenant_id=demo_tenant.id,
            popup_id=popup.id,
            human_id=human.id,
            group_id=group_id,
            referral=app_data.get("referral"),
            status=status,
            custom_fields=app_data.get("custom_fields", {}),
            submitted_at=submitted_at,
            accepted_at=accepted_at,
        )
        session.add(application)
        session.commit()
        session.refresh(application)
        application_map[app_key] = application
        logger.info(f"Application created: {app_key} ({application.status})")

        # Create attendees for this application
        attendees_data = app_data.get("attendees", [])
        created_attendees: list[Attendees] = []

        for attendee_data in attendees_data:
            # Link to human if this is the main attendee with same email
            attendee_human_id = None
            if (
                attendee_data.get("category") == "main"
                and attendee_data.get("email", "").lower() == human.email.lower()
            ):
                attendee_human_id = human.id

            attendee = Attendees(
                tenant_id=demo_tenant.id,
                application_id=application.id,
                human_id=attendee_human_id,
                name=attendee_data["name"],
                category=attendee_data["category"],
                email=attendee_data.get("email"),
                gender=attendee_data.get("gender"),
                check_in_code=_generate_check_in_code(),
            )
            session.add(attendee)
            session.commit()
            session.refresh(attendee)
            created_attendees.append(attendee)

            # Create attendee products
            for prod_data in attendee_data.get("products", []):
                product_slug = prod_data["product_slug"]
                product_map_key = f"{popup_key}:{product_slug}"
                product = product_map.get(product_map_key)
                if product:
                    attendee_product = AttendeeProducts(
                        tenant_id=demo_tenant.id,
                        attendee_id=attendee.id,
                        product_id=product.id,
                        quantity=prod_data.get("quantity", 1),
                    )
                    session.add(attendee_product)
                    session.commit()
                else:
                    logger.warning(
                        f"Product {product_slug} not found for attendee {attendee.name}"
                    )

            logger.info(f"Attendee created: {attendee.name} ({attendee.category})")

        attendee_lists[app_key] = created_attendees

    # =========================================================================
    # Create payments
    # =========================================================================
    for payment_data in seed_data.get("payments", []):
        app_key = payment_data["application_key"]
        application = application_map.get(app_key)
        if not application:
            logger.warning(f"Application {app_key} not found for payment")
            continue

        # Check if payment already exists for this application
        existing_payment = session.exec(
            select(Payments).where(
                Payments.application_id == application.id,
                Payments.external_id == payment_data.get("external_id"),
            )
        ).first()
        if existing_payment:
            continue

        # Get popup for product lookup
        popup = session.get(Popups, application.popup_id)
        if not popup:
            continue

        # Find popup key from map
        popup_key = None
        for key, p in popup_map.items():
            if p.id == popup.id:
                popup_key = key
                break
        if not popup_key:
            continue

        # Resolve coupon
        coupon_id = None
        if payment_data.get("coupon_code"):
            coupon_map_key = f"{popup_key}:{payment_data['coupon_code'].upper()}"
            coupon = coupon_map.get(coupon_map_key)
            if coupon:
                coupon_id = coupon.id

        # Resolve group from application
        group_id = application.group_id

        payment = Payments(
            tenant_id=demo_tenant.id,
            application_id=application.id,
            status=payment_data.get("status", "pending"),
            amount=Decimal(payment_data.get("amount", "0")),
            currency=payment_data.get("currency", "USD"),
            source=payment_data.get("source"),
            external_id=payment_data.get("external_id"),
            coupon_id=coupon_id,
            coupon_code=payment_data.get("coupon_code"),
            discount_value=(
                Decimal(payment_data["discount_value"])
                if payment_data.get("discount_value")
                else None
            ),
            group_id=group_id,
        )
        session.add(payment)
        session.commit()
        session.refresh(payment)
        logger.info(f"Payment created for {app_key}: {payment.status}")

        # Create payment products (snapshot)
        attendees = attendee_lists.get(app_key, [])
        for prod_data in payment_data.get("products", []):
            product_slug = prod_data["product_slug"]
            attendee_index = prod_data["attendee_index"]
            quantity = prod_data.get("quantity", 1)

            product_map_key = f"{popup_key}:{product_slug}"
            product = product_map.get(product_map_key)

            if not product:
                logger.warning(f"Product {product_slug} not found for payment")
                continue

            if attendee_index >= len(attendees):
                logger.warning(
                    f"Attendee index {attendee_index} out of range for {app_key}"
                )
                continue

            attendee = attendees[attendee_index]

            # Check if payment product already exists
            existing_pp = session.exec(
                select(PaymentProducts).where(
                    PaymentProducts.payment_id == payment.id,
                    PaymentProducts.product_id == product.id,
                    PaymentProducts.attendee_id == attendee.id,
                )
            ).first()
            if existing_pp:
                continue

            payment_product = PaymentProducts(
                tenant_id=demo_tenant.id,
                payment_id=payment.id,
                product_id=product.id,
                attendee_id=attendee.id,
                quantity=quantity,
                product_name=product.name,
                product_description=product.description,
                product_price=product.price,
                product_category=product.category,
            )
            session.add(payment_product)
            session.commit()

    logger.info("Seed data initialization complete!")
