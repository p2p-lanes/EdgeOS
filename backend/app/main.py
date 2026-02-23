import json

import sentry_sdk
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.routing import APIRoute
from loguru import logger
from pydantic import ValidationError
from sqlalchemy.exc import IntegrityError, ProgrammingError
from starlette.middleware.cors import CORSMiddleware

import app.models  # noqa: F401 - Register all models with SQLAlchemy
from app.api.router import api_router
from app.core.config import Environment, settings


def custom_generate_unique_id(route: APIRoute) -> str:
    return f"{route.tags[0]}-{route.name}"


if settings.SENTRY_DSN and settings.ENVIRONMENT != Environment.DEV:
    sentry_sdk.init(dsn=str(settings.SENTRY_DSN), enable_tracing=True)

application = FastAPI(
    title=settings.PROJECT_NAME,
    generate_unique_id_function=custom_generate_unique_id,
)


@application.exception_handler(ValidationError)
def pydantic_validation_error(_: Request, exc: ValidationError) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": json.loads(exc.json())},
    )


@application.exception_handler(ProgrammingError)
def handle_rls_violation(_: Request, exc: ProgrammingError) -> JSONResponse:
    error_msg = str(exc.orig) if exc.orig else str(exc)
    if (
        "row-level security" in error_msg.lower()
        or "insufficient_privilege" in error_msg.lower()
    ):
        logger.warning(f"RLS policy violation: {error_msg}")
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"detail": "Access denied by security policy"},
        )
    raise exc


@application.exception_handler(IntegrityError)
def handle_integrity_error(_: Request, exc: IntegrityError) -> JSONResponse:
    error_msg = str(exc.orig) if exc.orig else str(exc)
    if (
        "row-level security" in error_msg.lower()
        or "insufficient_privilege" in error_msg.lower()
    ):
        logger.warning(f"RLS policy violation: {error_msg}")
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"detail": "Access denied by security policy"},
        )
    # Detect unique constraint violations (PostgreSQL error code 23505)
    pgcode = getattr(exc.orig, "pgcode", None)
    if pgcode == "23505":
        logger.warning(f"Unique constraint violation: {error_msg}")
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={"detail": "A record with this data already exists"},
        )
    logger.error(f"Integrity error: {error_msg}")
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": "Data integrity error"},
    )


if settings.all_cors_origins or settings.cors_allow_origin_regex:
    application.add_middleware(
        CORSMiddleware,  # type: ignore[arg-type]
        allow_origins=settings.all_cors_origins,
        allow_origin_regex=settings.cors_allow_origin_regex,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "X-Tenant-Id"],
    )


@application.get("/health-check", tags=["utils"], include_in_schema=False)
async def health_check():
    from sqlmodel import Session, text

    from app.core.db import engine

    try:
        with Session(engine) as session:
            session.exec(text("SELECT 1"))
        return {"status": "healthy"}
    except Exception:
        logger.error("Health check failed: database unreachable")
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": "unhealthy", "detail": "Database unreachable"},
        )


application.include_router(api_router, prefix=settings.API_V1_STR)
