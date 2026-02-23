# Backend

FastAPI backend with PostgreSQL Row-Level Security (RLS) for multi-tenant data isolation.

## Tech Stack

- **Framework**: FastAPI 0.115+
- **Database**: PostgreSQL 15+ with RLS
- **ORM**: SQLModel (SQLAlchemy + Pydantic)
- **Migrations**: Alembic
- **Package Manager**: uv
- **Testing**: pytest + testcontainers

## Quick Start

### With Docker (Recommended)

From the project root:

```bash
# Copy environment template (works out of the box)
cp .env.example .env

# Start all services with hot reload
docker compose watch

# View logs
docker compose logs -f backend

# Shell into container
docker compose exec backend bash
```

The default `.env.example` is pre-configured for local development. No changes needed.

### Local Development (without Docker)

If you prefer running outside Docker, you need a PostgreSQL database running separately:

```bash
# Install dependencies
uv sync
source .venv/bin/activate  # Linux/Mac
# .venv\Scripts\activate   # Windows

# Set environment variables (or use .env file)
export POSTGRES_SERVER=localhost
export POSTGRES_USER=postgres
export POSTGRES_PASSWORD=yourpassword
export POSTGRES_DB=edgeos
export SECRET_KEY=dev-secret-key
export SUPERADMIN=admin@example.com

# Run development server
fastapi dev app/main.py

# Server runs at http://localhost:8000
```

## Project Structure

```
backend/
├── app/
│   ├── api/                    # API modules
│   │   ├── router.py           # Main router aggregation
│   │   ├── shared/             # Shared utilities
│   │   │   ├── crud.py         # BaseCRUD generic class
│   │   │   ├── dependencies.py # FastAPI dependencies
│   │   │   ├── enums.py        # UserRole, CredentialType, etc.
│   │   │   └── response.py     # ListModel, Paging types
│   │   └── {resource}/         # Resource modules
│   │       ├── router.py       # FastAPI router
│   │       ├── crud.py         # Database operations
│   │       ├── models.py       # SQLModel table definitions
│   │       └── schemas.py      # Pydantic schemas
│   ├── core/
│   │   ├── config.py           # Settings from environment
│   │   ├── db.py               # Database engine
│   │   ├── security.py         # JWT handling
│   │   ├── tenant_db.py        # Tenant connection manager + RLS
│   │   └── dependencies/       # Core dependencies
│   │       └── users.py        # SessionDep, TenantSession, CurrentUser
│   ├── services/
│   │   ├── email/              # Email service
│   │   ├── storage.py          # S3 file storage
│   │   └── approval/           # Approval logic
│   ├── alembic/                # Database migrations
│   │   └── versions/           # Migration files
│   ├── templates/emails/       # Jinja2 email templates
│   ├── utils/                  # Utility functions
│   └── models.py               # Model re-exports for Alembic
├── tests/                      # Test suite
└── scripts/                    # Development scripts
```

## API Modules

Each resource follows this pattern:

| File | Purpose |
|------|---------|
| `models.py` | SQLModel table definitions with relationships |
| `schemas.py` | Pydantic schemas (Base, Create, Update, Public) |
| `crud.py` | Database operations extending BaseCRUD |
| `router.py` | FastAPI endpoints |

### Available Resources

| Resource | Endpoint | Description |
|----------|----------|-------------|
| Auth | `/v1/auth` | Authentication (login, verify, logout) |
| Tenants | `/v1/tenants` | Tenant management (superadmin only) |
| Users | `/v1/users` | Backoffice user management |
| Humans | `/v1/humans` | End-user/attendee accounts |
| Popups | `/v1/popups` | Event configuration |
| Applications | `/v1/applications` | Event applications |
| Attendees | `/v1/attendees` | Approved attendees |
| Products | `/v1/products` | Purchasable items/tickets |
| Payments | `/v1/payments` | Payment records |
| Groups | `/v1/groups` | Group registrations |
| Coupons | `/v1/coupons` | Discount codes |
| FormFields | `/v1/form-fields` | Custom form fields |
| Dashboard | `/v1/dashboard` | Analytics endpoints |

## Dependencies (DI)

### Database Sessions

| Dependency | Use Case | RLS |
|------------|----------|-----|
| `SessionDep` | Superadmin operations, tenant management | No |
| `TenantSession` | Tenant-scoped operations (ADMIN/VIEWER) | Yes |

### Authentication

| Dependency | Returns | Use Case |
|------------|---------|----------|
| `CurrentUser` | User object | Backoffice endpoints |
| `CurrentHuman` | Human object | Attendee-facing endpoints |
| `CurrentTenant` | Tenant object | Public endpoints (via X-Tenant-Id) |

### Example Usage

```python
from app.core.dependencies.users import TenantSession, CurrentUser
from app.api.shared.response import ListModel, Paging

@router.get("", response_model=ListModel[ProductPublic])
async def list_products(
    db: TenantSession,      # RLS-enabled session
    _: CurrentUser,         # Require authentication
    skip: int = 0,
    limit: int = 100,
) -> ListModel[ProductPublic]:
    results, total = product_crud.find(db, skip=skip, limit=limit)
    return ListModel(
        results=[ProductPublic.model_validate(r) for r in results],
        paging=Paging(skip=skip, limit=limit, total=total)
    )
```

## Database

### Migrations

```bash
# Inside backend container
docker compose exec backend bash

# Create migration after model changes
alembic revision --autogenerate -m "Add new field"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1

# View migration history
alembic history
```

### Multi-Tenant RLS

Row-Level Security ensures tenant isolation:

1. All tenant-scoped tables have a `tenant_id` column
2. `TenantSession` sets `app.tenant_id` via PostgreSQL `SET` command
3. RLS policies filter rows: `tenant_id = current_setting('app.tenant_id')::uuid`

```python
# Automatic tenant filtering
products = product_crud.find(tenant_session)  # Only returns tenant's products
```

## Testing

```bash
# Run all tests with coverage
bash scripts/test.sh

# Run specific test file
pytest tests/test_rls.py -v

# Run specific test
pytest tests/test_rls.py -k "test_tenant_isolation"

# Stop on first failure
pytest tests/ -x
```

Tests use testcontainers for isolated PostgreSQL instances.

## Code Quality

```bash
# Type checking + linting
bash scripts/lint.sh

# Auto-fix and format
bash scripts/format.sh

# Individual commands
uv run ty check           # Type check
uv run ruff check app     # Lint
uv run ruff format app    # Format
```

## Creating a New Resource

1. Create `api/{resource}/` directory
2. Add `models.py`:
   ```python
   from sqlmodel import SQLModel, Field
   from uuid import UUID

   class ResourceBase(SQLModel):
       name: str

   class Resources(ResourceBase, table=True):
       id: UUID | None = Field(default_factory=uuid4, primary_key=True)
       tenant_id: UUID = Field(foreign_key="tenants.id")
   ```
3. Add `schemas.py`:
   ```python
   class ResourceCreate(ResourceBase):
       pass

   class ResourceUpdate(SQLModel):
       name: str | None = None

   class ResourcePublic(ResourceBase):
       id: UUID
   ```
4. Add `crud.py`:
   ```python
   from app.api.shared.crud import BaseCRUD

   class ResourceCRUD(BaseCRUD[Resources, ResourceCreate, ResourceUpdate]):
       def __init__(self):
           super().__init__(Resources)

   resource_crud = ResourceCRUD()
   ```
5. Add `router.py` with endpoints
6. Register in `api/router.py`
7. Import model in `app/models.py`
8. Create migration: `alembic revision --autogenerate -m "Add resources"`

## Environment Variables

See the root `.env.example` for a complete list with defaults. Key variables:

### Required

| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_SERVER` | `db` | Database host (`db` for Docker) |
| `POSTGRES_PORT` | `5432` | Database port |
| `POSTGRES_USER` | `postgres` | Database user |
| `POSTGRES_PASSWORD` | - | Database password |
| `POSTGRES_DB` | `edgeos` | Database name |
| `SECRET_KEY` | - | JWT signing key (generate with `openssl rand -hex 32`) |
| `SUPERADMIN` | `admin@example.com` | Initial superadmin email |

### Optional

| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_SSL_MODE` | `prefer` | SSL mode (`prefer`, `require`, `disable`) |
| `SMTP_HOST` | - | SMTP server (empty = emails disabled) |
| `SMTP_PORT` | `587` | SMTP port |
| `SMTP_USER` | - | SMTP username |
| `SMTP_PASSWORD` | - | SMTP password |
| `SENDER_EMAIL` | `noreply@example.com` | From address for emails |
| `STORAGE_ENDPOINT_URL` | `http://localhost:9000` | S3-compatible endpoint |
| `STORAGE_ACCESS_KEY` | `minioadmin` | S3 access key |
| `STORAGE_SECRET_KEY` | `minioadmin` | S3 secret key |
| `STORAGE_BUCKET` | `edgeos` | S3 bucket name |
| `REDIS_URL` | `redis://redis:6379` | Redis connection URL |
| `SENTRY_DSN` | - | Sentry DSN for error tracking |

For local development with Docker, all defaults work out of the box. For production, see the main README.

## API Documentation

When running, documentation is available at:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/api/v1/openapi.json
