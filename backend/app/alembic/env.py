from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context
from app.core.config import settings
from app.models import SQLModel

config = context.config

# Escape % chars for configparser interpolation
db_url = settings.SQLALCHEMY_DATABASE_URI.encoded_string().replace("%", "%%")
config.set_main_option("sqlalchemy.url", db_url)

if config.config_file_name:
    fileConfig(config.config_file_name)

target_metadata = SQLModel.metadata


def include_object(object, name, type_, reflected, compare_to):
    """Skip foreign key constraint comparison.

    SQLModel's Field(foreign_key=...) doesn't support ondelete/onupdate,
    causing false positives when the DB has CASCADE but the model doesn't.
    """
    if type_ == "foreign_key_constraint":
        return False
    return True


def compare_type(context, inspected_column, metadata_column, inspected_type, metadata_type):
    """Skip false positive type comparisons from SQLModel.

    - Enum vs String: SQLModel uses native Enum for StrEnum fields,
      but the DB stores them as VARCHAR. Both are functionally equivalent.
    """
    from sqlalchemy import Enum, String

    # Ignore String (DB) vs Enum (model) - SQLModel StrEnum fields
    if isinstance(inspected_type, String) and isinstance(metadata_type, Enum):
        return False

    # Use default comparison for everything else
    return None


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        include_object=include_object,
        compare_type=compare_type,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    # Check if a connection was passed in (e.g., from tests)
    connectable = config.attributes.get("connection", None)

    if connectable is None:
        connectable = engine_from_config(
            config.get_section(config.config_ini_section, {}),
            prefix="sqlalchemy.",
            poolclass=pool.NullPool,
        )

    # If we got an engine, connect to it; if we got a connection, use it directly
    if hasattr(connectable, "connect"):
        with connectable.connect() as connection:
            context.configure(
                connection=connection,
                target_metadata=target_metadata,
                include_object=include_object,
        compare_type=compare_type,
            )
            with context.begin_transaction():
                context.run_migrations()
    else:
        # Already a connection
        context.configure(
            connection=connectable,
            target_metadata=target_metadata,
            include_object=include_object,
        compare_type=compare_type,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
