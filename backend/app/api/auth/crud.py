import uuid

from fastapi import HTTPException, status
from loguru import logger
from sqlmodel import Session, not_, select

from app.api.auth.pending_human_models import PendingHumans
from app.api.auth.schemas import HumanAuth
from app.api.auth.utils import (
    create_code_expiration,
    generate_auth_code,
    is_code_valid,
)
from app.api.human.models import Humans
from app.api.tenant.models import Tenants
from app.api.user.models import Users
from app.core.config import settings
from app.core.redis import (
    auth_code_store,
    is_redis_available,
    login_rate_limiter,
    pending_human_store,
)
from app.services.email import (
    LoginCodeHumanContext,
    LoginCodeUserContext,
    get_email_service,
)

MAX_AUTH_ATTEMPTS = 5
CODE_EXPIRATION_MINUTES = 15


def check_rate_limit(identifier: str) -> None:
    """Check rate limit and raise exception if exceeded."""
    is_allowed, remaining = login_rate_limiter.is_allowed(identifier)
    if not is_allowed:
        ttl = login_rate_limiter.get_ttl(identifier)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many login attempts. Please try again in {ttl // 60} minutes.",
            headers={"Retry-After": str(ttl)},
        )


async def login_user(
    session: Session,
    email: str,
) -> tuple[str, int]:
    # Rate limit by email
    check_rate_limit(f"user:{email.lower()}")

    # Find user
    statement = select(Users).where(
        Users.email == email,
        not_(Users.deleted),
    )
    user = session.exec(statement).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    auth_code = generate_auth_code()

    # Try Redis first, fall back to database
    if is_redis_available():
        auth_code_store.store_user_code(user.id, auth_code)
        logger.debug(f"Auth code stored in Redis for user: {email}")
    else:
        # Fall back to database storage
        code_expiration = create_code_expiration(CODE_EXPIRATION_MINUTES)
        user.auth_code = auth_code
        user.code_expiration = code_expiration
        user.auth_attempts = 0
        session.add(user)
        session.commit()
        logger.debug(f"Auth code stored in database for user: {email}")

    if user.tenant_id:
        tenant = session.get(Tenants, user.tenant_id)
        if not tenant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tenant not found",
            )
        from_address = tenant.sender_email
        from_name = tenant.sender_name
        tenant_name = tenant.name
    else:
        from_address = settings.SENDER_EMAIL
        from_name = settings.SENDER_NAME
        tenant_name = settings.PROJECT_NAME

    email_service = get_email_service()
    success = await email_service.send_login_code_user(
        to=email,
        subject=f"Your Login Code - {tenant_name}",
        context=LoginCodeUserContext(
            user_name=user.full_name,
            auth_code=auth_code,
            expiration_minutes=CODE_EXPIRATION_MINUTES,
        ),
        from_address=from_address,
        from_name=from_name,
    )

    if not success:
        logger.error(f"Failed to send auth code email to {email}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send authentication code",
        )

    logger.info(f"Auth code sent to user: {email}")
    return email, CODE_EXPIRATION_MINUTES


async def authenticate_user(
    session: Session,
    email: str,
    code: str,
) -> Users:
    statement = select(Users).where(
        Users.email == email,
        not_(Users.deleted),
    )
    user = session.exec(statement).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Try Redis first, fall back to database
    if is_redis_available():
        is_valid, error_message = auth_code_store.verify_user_code(user.id, code)
        if not is_valid:
            if "Maximum" in error_message:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=error_message,
                )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=error_message,
            )
    else:
        # Fall back to database verification
        if not user.auth_code or not user.code_expiration:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No authentication code pending",
            )

        if user.auth_attempts >= MAX_AUTH_ATTEMPTS:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Maximum authentication attempts exceeded. Please request a new code.",
            )

        is_valid, error_message = is_code_valid(
            stored_code=user.auth_code,
            provided_code=code,
            expiration=user.code_expiration,
        )

        if not is_valid:
            user.auth_attempts += 1
            session.add(user)
            session.commit()

            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=error_message,
            )

        # Clear database auth code on success
        user.auth_code = None
        user.code_expiration = None
        user.auth_attempts = 0
        session.add(user)
        session.commit()

    logger.info(f"User authenticated successfully: {email}")
    return user


async def login_human(
    session: Session,
    data: HumanAuth,
) -> tuple[str, int]:
    # Rate limit by tenant + email combination
    check_rate_limit(f"human:{data.tenant_id}:{data.email.lower()}")

    # Check if human already exists
    statement = select(Humans).where(
        Humans.email == data.email,
        Humans.tenant_id == data.tenant_id,
    )
    existing_human = session.exec(statement).first()

    # Generate code
    auth_code = generate_auth_code()

    tenant = session.get(Tenants, data.tenant_id)

    if existing_human:
        # Human exists: store auth code
        if is_redis_available():
            auth_code_store.store_human_code(
                data.tenant_id, data.email, auth_code, is_pending=False
            )
            logger.debug(f"Auth code stored in Redis for existing human: {data.email}")
        else:
            # Fall back to database storage
            code_expiration = create_code_expiration(CODE_EXPIRATION_MINUTES)
            existing_human.auth_code = auth_code
            existing_human.code_expiration = code_expiration
            existing_human.auth_attempts = 0
            session.add(existing_human)
            session.commit()

        # Get display name from latest application for email personalization
        display_name = existing_human.display_name

        # Send email with code
        email_service = get_email_service()
        success = await email_service.send_login_code_human(
            to=data.email,
            subject=f"Your Login Code - {tenant.name if tenant else settings.PROJECT_NAME}",
            context=LoginCodeHumanContext(
                first_name=display_name,
                auth_code=auth_code,
                expiration_minutes=CODE_EXPIRATION_MINUTES,
            ),
            from_address=tenant.sender_email if tenant else settings.SENDER_EMAIL,
            from_name=tenant.sender_name if tenant else settings.SENDER_NAME,
        )

        if not success:
            logger.error(f"Failed to send auth code email to {data.email}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send authentication code",
            )

        logger.info(f"Auth code sent to existing human: {data.email}")
        return data.email, CODE_EXPIRATION_MINUTES

    # Human doesn't exist: create pending record
    if is_redis_available():
        # Store pending human data and auth code in Redis
        pending_human_store.store(
            tenant_id=data.tenant_id,
            email=data.email,
            picture_url=data.picture_url,
            red_flag=data.red_flag,
        )
        auth_code_store.store_human_code(
            data.tenant_id, data.email, auth_code, is_pending=True
        )
        logger.debug(f"Pending human stored in Redis: {data.email}")
    else:
        # Fall back to database storage
        code_expiration = create_code_expiration(CODE_EXPIRATION_MINUTES)

        pending_statement = select(PendingHumans).where(
            PendingHumans.email == data.email,
            PendingHumans.tenant_id == data.tenant_id,
        )
        pending_human = session.exec(pending_statement).first()

        if pending_human:
            # Update existing pending record with new auth code
            pending_human.auth_code = auth_code
            pending_human.code_expiration = code_expiration
            pending_human.attempts = 0
            pending_human.picture_url = data.picture_url
            pending_human.red_flag = data.red_flag
        else:
            # Create new pending record (minimal data)
            pending_human = PendingHumans(
                tenant_id=data.tenant_id,
                email=data.email,
                auth_code=auth_code,
                code_expiration=code_expiration,
                picture_url=data.picture_url,
                red_flag=data.red_flag,
                attempts=0,
            )

        session.add(pending_human)
        session.commit()

    # Send email with code (use email as greeting since no name yet)
    email_service = get_email_service()
    success = await email_service.send_login_code_human(
        to=data.email,
        subject=f"Your Verification Code - {tenant.name if tenant else settings.PROJECT_NAME}",
        context=LoginCodeHumanContext(
            first_name=data.email.split("@")[0],  # Use email prefix as fallback
            auth_code=auth_code,
            expiration_minutes=CODE_EXPIRATION_MINUTES,
        ),
        from_address=tenant.sender_email if tenant else settings.SENDER_EMAIL,
        from_name=tenant.sender_name if tenant else settings.SENDER_NAME,
    )

    if not success:
        logger.error(f"Failed to send auth code email to {data.email}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send verification code",
        )

    logger.info(f"Auth code sent to pending human: {data.email}")
    return data.email, CODE_EXPIRATION_MINUTES


async def authenticate_human(
    session: Session,
    email: str,
    tenant_id: uuid.UUID,
    code: str,
) -> Humans:
    """
    Verify authentication code for a human.

    If human exists: authenticate using human record (like user authentication).
    If human doesn't exist: create human from pending record after validation.

    Args:
        session: Database session
        email: Human's email address
        tenant_id: Tenant ID
        code: 6-digit authentication code

    Returns:
        Authenticated human

    Raises:
        HTTPException: If verification fails
    """
    # First check if human already exists
    human_statement = select(Humans).where(
        Humans.email == email,
        Humans.tenant_id == tenant_id,
    )
    existing_human = session.exec(human_statement).first()

    if existing_human:
        # Human exists: authenticate
        if is_redis_available():
            is_valid, error_message = auth_code_store.verify_human_code(
                tenant_id, email, code, is_pending=False
            )
            if not is_valid:
                if "Maximum" in error_message:
                    raise HTTPException(
                        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                        detail=error_message,
                    )
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=error_message,
                )
        else:
            # Fall back to database verification
            if not existing_human.auth_code or not existing_human.code_expiration:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No authentication code pending",
                )

            if existing_human.auth_attempts >= MAX_AUTH_ATTEMPTS:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Maximum authentication attempts exceeded. Please request a new code.",
                )

            is_valid, error_message = is_code_valid(
                stored_code=existing_human.auth_code,
                provided_code=code,
                expiration=existing_human.code_expiration,
            )

            if not is_valid:
                existing_human.auth_attempts += 1
                session.add(existing_human)
                session.commit()

                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=error_message,
                )

            # Clear auth code and reset attempts
            existing_human.auth_code = None
            existing_human.code_expiration = None
            existing_human.auth_attempts = 0
            session.add(existing_human)
            session.commit()

        logger.info(f"Human authenticated successfully: {email}")
        return existing_human

    # Human doesn't exist: use pending human flow
    if is_redis_available():
        # Verify code from Redis
        is_valid, error_message = auth_code_store.verify_human_code(
            tenant_id, email, code, is_pending=True
        )
        if not is_valid:
            if "Maximum" in error_message:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=error_message,
                )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=error_message,
            )

        # Get pending human data from Redis
        pending_data = pending_human_store.get(tenant_id, email)
        if not pending_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No pending registration found",
            )

        # Create actual human record
        human = Humans(
            tenant_id=pending_data["tenant_id"],
            email=pending_data["email"],
            picture_url=pending_data["picture_url"],
            red_flag=pending_data["red_flag"],
        )

        session.add(human)
        session.commit()
        session.refresh(human)

        # Clean up Redis
        pending_human_store.delete(tenant_id, email)
    else:
        # Fall back to database pending human flow
        pending_statement = select(PendingHumans).where(
            PendingHumans.email == email,
            PendingHumans.tenant_id == tenant_id,
        )
        pending_human = session.exec(pending_statement).first()

        if not pending_human:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No pending registration found",
            )

        # Check max attempts
        if pending_human.attempts >= MAX_AUTH_ATTEMPTS:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Maximum verification attempts exceeded. Please request a new code.",
            )

        # Validate code
        is_valid, error_message = is_code_valid(
            stored_code=pending_human.auth_code,
            provided_code=code,
            expiration=pending_human.code_expiration,
        )

        if not is_valid:
            # Increment attempts
            pending_human.attempts += 1
            session.add(pending_human)
            session.commit()

            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=error_message,
            )

        # Create actual human record (minimal - profile data comes from Applications)
        human = Humans(
            tenant_id=pending_human.tenant_id,
            email=pending_human.email,
            picture_url=pending_human.picture_url,
            red_flag=pending_human.red_flag,
        )

        session.add(human)

        # Delete pending human record
        session.delete(pending_human)

        session.commit()
        session.refresh(human)

    # Link any existing attendees with matching email to this new human
    from app.api.attendee.crud import attendees_crud

    linked_count = attendees_crud.link_attendees_to_human(
        session,
        human_id=human.id,
        email=human.email,
        tenant_id=human.tenant_id,
    )
    if linked_count > 0:
        logger.info(f"Linked {linked_count} existing attendee(s) to new human: {email}")

    logger.info(f"Human created and authenticated successfully: {email}")
    return human
