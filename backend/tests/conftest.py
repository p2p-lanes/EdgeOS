import uuid
from collections.abc import Generator
from unittest.mock import patch

import pytest
from alembic import command
from alembic.config import Config
from fastapi.testclient import TestClient
from sqlmodel import Session, create_engine, select
from testcontainers.postgres import PostgresContainer

from app.api.popup.models import Popups
from app.api.shared.enums import UserRole
from app.api.tenant.models import Tenants
from app.api.user.models import Users
from app.core.dependencies.users import get_session
from app.core.security import create_access_token
from app.core.tenant_db import ensure_tenant_credentials, tenant_connection_manager
from app.main import application


@pytest.fixture(scope="session")
def postgres_container() -> Generator[PostgresContainer, None, None]:
    with PostgresContainer(
        image="postgres:17",
        username="test_user",
        password="test_password",
        dbname="test_db",
        driver="psycopg",
    ) as postgres:
        yield postgres


@pytest.fixture(scope="session")
def test_connection_url(postgres_container: PostgresContainer) -> str:
    return postgres_container.get_connection_url()


@pytest.fixture(scope="session")
def test_engine(test_connection_url: str):
    engine = create_engine(test_connection_url)

    with engine.begin() as connection:
        alembic_cfg = Config("alembic.ini")
        alembic_cfg.attributes["connection"] = connection
        command.upgrade(alembic_cfg, "head")

    return engine


@pytest.fixture(scope="session")
def db(test_engine) -> Generator[Session, None, None]:
    with Session(test_engine) as session:
        yield session


@pytest.fixture(scope="session")
def client(
    test_engine,
    postgres_container: PostgresContainer,
) -> Generator[TestClient, None, None]:
    def get_test_session() -> Generator[Session, None, None]:
        with Session(test_engine) as session:
            yield session

    host = postgres_container.get_container_host_ip()
    port = int(postgres_container.get_exposed_port(5432))

    application.dependency_overrides[get_session] = get_test_session
    tenant_connection_manager._engines.clear()

    with (
        patch("app.core.tenant_db.settings.POSTGRES_SERVER", host),
        patch("app.core.tenant_db.settings.POSTGRES_PORT", port),
        patch("app.core.tenant_db.settings.POSTGRES_DB", "test_db"),
        patch("app.core.dependencies.users.engine", test_engine),
    ):
        with TestClient(application) as c:
            yield c

    tenant_connection_manager._engines.clear()
    application.dependency_overrides.clear()


@pytest.fixture(scope="session")
def superadmin_user(db: Session) -> Users:
    user = db.exec(
        select(Users).where(
            Users.role == UserRole.SUPERADMIN,
            Users.deleted == False,  # noqa: E712
        )
    ).first()

    if user is None:
        user = Users(
            email=f"superadmin-{uuid.uuid4().hex[:8]}@test.com",
            role=UserRole.SUPERADMIN,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return user


@pytest.fixture(scope="session")
def superadmin_token(superadmin_user: Users) -> str:
    return create_access_token(subject=superadmin_user.id, token_type="user")


@pytest.fixture(scope="session")
def tenant_a(db: Session) -> Tenants:
    tenant = db.exec(select(Tenants).where(Tenants.slug == "test-tenant-a")).first()

    if tenant is None:
        tenant = Tenants(
            name="Test Tenant A",
            slug="test-tenant-a",
        )
        db.add(tenant)
        db.commit()
        db.refresh(tenant)
        ensure_tenant_credentials(db, tenant.id)

    return tenant


@pytest.fixture(scope="session")
def tenant_b(db: Session) -> Tenants:
    tenant = db.exec(select(Tenants).where(Tenants.slug == "test-tenant-b")).first()

    if tenant is None:
        tenant = Tenants(
            name="Test Tenant B",
            slug="test-tenant-b",
        )
        db.add(tenant)
        db.commit()
        db.refresh(tenant)
        ensure_tenant_credentials(db, tenant.id)

    return tenant


@pytest.fixture(scope="session")
def admin_user_tenant_a(db: Session, tenant_a: Tenants) -> Users:
    user = db.exec(
        select(Users).where(
            Users.email == "admin-a@test.com",
            Users.deleted == False,  # noqa: E712
        )
    ).first()

    if user is None:
        user = Users(
            email="admin-a@test.com",
            role=UserRole.ADMIN,
            tenant_id=tenant_a.id,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return user


@pytest.fixture(scope="session")
def admin_user_tenant_b(db: Session, tenant_b: Tenants) -> Users:
    user = db.exec(
        select(Users).where(
            Users.email == "admin-b@test.com",
            Users.deleted == False,  # noqa: E712
        )
    ).first()

    if user is None:
        user = Users(
            email="admin-b@test.com",
            role=UserRole.ADMIN,
            tenant_id=tenant_b.id,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return user


@pytest.fixture(scope="session")
def viewer_user_tenant_a(db: Session, tenant_a: Tenants) -> Users:
    user = db.exec(
        select(Users).where(
            Users.email == "viewer-a@test.com",
            Users.deleted == False,  # noqa: E712
        )
    ).first()

    if user is None:
        user = Users(
            email="viewer-a@test.com",
            role=UserRole.VIEWER,
            tenant_id=tenant_a.id,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return user


@pytest.fixture(scope="session")
def admin_token_tenant_a(admin_user_tenant_a: Users) -> str:
    return create_access_token(subject=admin_user_tenant_a.id, token_type="user")


@pytest.fixture(scope="session")
def admin_token_tenant_b(admin_user_tenant_b: Users) -> str:
    return create_access_token(subject=admin_user_tenant_b.id, token_type="user")


@pytest.fixture(scope="session")
def viewer_token_tenant_a(viewer_user_tenant_a: Users) -> str:
    return create_access_token(subject=viewer_user_tenant_a.id, token_type="user")


@pytest.fixture(scope="session")
def popup_tenant_a(db: Session, tenant_a: Tenants) -> Popups:
    popup = db.exec(select(Popups).where(Popups.slug == "popup-tenant-a")).first()

    if popup is None:
        popup = Popups(
            name="Popup Tenant A",
            slug="popup-tenant-a",
            tenant_id=tenant_a.id,
        )
        db.add(popup)
        db.commit()
        db.refresh(popup)

    return popup


@pytest.fixture(scope="session")
def popup_tenant_b(db: Session, tenant_b: Tenants) -> Popups:
    popup = db.exec(select(Popups).where(Popups.slug == "popup-tenant-b")).first()

    if popup is None:
        popup = Popups(
            name="Popup Tenant B",
            slug="popup-tenant-b",
            tenant_id=tenant_b.id,
        )
        db.add(popup)
        db.commit()
        db.refresh(popup)

    return popup
