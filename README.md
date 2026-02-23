# EdgeOS

A multi-tenant SaaS platform for event management with a FastAPI backend and React-based backoffice dashboard.

## Overview

EdgeOS provides a complete solution for managing events (called "popups"), attendees, applications, payments, and more. It features:

- **Multi-Tenant Architecture**: PostgreSQL Row-Level Security (RLS) ensures complete data isolation between tenants
- **Role-Based Access Control**: SUPERADMIN, ADMIN, and VIEWER roles with granular permissions
- **Passwordless Authentication**: Secure email-based login with 6-digit codes
- **RESTful API**: Full-featured API with auto-generated OpenAPI documentation
- **Modern Frontend**: React 19 dashboard with TanStack Router and Query

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Backoffice (React)                    │
│                    localhost:5173 (dev)                     │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (FastAPI)                        │
│                    localhost:8000                           │
├─────────────────────────┬───────────────────────────────────┤
│   API Routes            │   Core Services                   │
│   • /v1/auth            │   • JWT Authentication            │
│   • /v1/tenants         │   • Email Service                 │
│   • /v1/popups          │   • File Storage (S3)             │
│   • /v1/applications    │   • Tenant Connection Manager     │
│   • /v1/payments        │                                   │
│   • /v1/...             │                                   │
└─────────────────────────┴───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                PostgreSQL with RLS                          │
│                    localhost:5432                           │
│                                                             │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│   │  Tenant A   │  │  Tenant B   │  │  Tenant C   │        │
│   │  (isolated) │  │  (isolated) │  │  (isolated) │        │
│   └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start (Local Development)

### Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose

### 1. Clone and Start

```bash
git clone <repository-url>
cd EdgeOS

# Copy environment template (works out of the box for local dev)
cp .env.example .env

# Start all services with hot reload
docker compose watch
```

That's it. The default `.env.example` is pre-configured for local development with:
- PostgreSQL database (via Docker)
- Mailpit for email testing (view emails at http://localhost:8025)
- MinIO for S3-compatible file storage
- Redis for caching

### 2. Access the Application

| Service | URL | Description |
|---------|-----|-------------|
| **Backoffice** | http://localhost:5173 | React dashboard |
| **API Docs** | http://localhost:8000/docs | Swagger UI |
| **API ReDoc** | http://localhost:8000/redoc | ReDoc documentation |
| **Mailpit** | http://localhost:8025 | Email testing inbox |
| **Adminer** | http://localhost:8080 | Database admin UI |
| **MinIO Console** | http://localhost:9001 | File storage admin |
| **Redis Commander** | http://localhost:8081 | Redis admin UI |

Login with the default superadmin: `admin@example.com` (check Mailpit for the login code).

## Database Structure

### Core Entities

| Entity | Description |
|--------|-------------|
| **Tenants** | Organizations with isolated data and database credentials |
| **Users** | Backoffice users (SUPERADMIN, ADMIN, VIEWER roles) |
| **Humans** | End-users/attendees who apply to events |
| **Popups** | Events that humans can apply to |
| **Applications** | Human applications to specific popups |
| **Attendees** | Approved applications become attendees |
| **Products** | Items/tickets that can be purchased for popups |
| **Payments** | Payment records for applications |
| **Groups** | Group registrations for events |
| **Coupons** | Discount codes for popups |
| **FormFields** | Custom form fields per popup |

### Entity Relationships

```
Tenant
├── Users (backoffice access)
├── Humans (end-users)
├── Popups
│   ├── Products
│   ├── Coupons
│   ├── FormFields
│   ├── Groups
│   ├── ApprovalStrategy
│   └── PopupReviewers
├── Applications
│   ├── ApplicationReviews
│   ├── Attendees
│   │   └── AttendeeProducts
│   └── Payments
│       └── PaymentProducts
└── Groups
    ├── GroupLeaders
    ├── GroupMembers
    └── GroupProducts
```

### Row-Level Security (RLS)

All tenant-scoped tables include a `tenant_id` column with RLS policies that ensure:
- Data is automatically filtered by the current tenant
- Users cannot access data from other tenants
- Superadmins can bypass RLS for cross-tenant operations

## Project Structure

```
edgeos-monorepo/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API modules (router, crud, models, schemas)
│   │   ├── core/           # Configuration, database, security
│   │   ├── services/       # Email, storage services
│   │   ├── alembic/        # Database migrations
│   │   └── templates/      # Email templates
│   └── tests/              # Backend tests
├── backoffice/             # React frontend
│   └── src/
│       ├── routes/         # TanStack Router pages
│       ├── components/     # React components
│       ├── client/         # Auto-generated API client
│       ├── hooks/          # Custom React hooks
│       └── contexts/       # React contexts
├── compose.yaml             # Docker Compose configuration
└── .env                    # Environment variables
```

## Development

For most development, using Docker (`docker compose watch`) is recommended as it provides hot reload and all dependencies configured.

### Development Outside Docker

If you prefer running services locally without Docker:

#### Prerequisites

- [uv](https://docs.astral.sh/uv/) (for Python backend)
- [Bun](https://bun.sh/) (for React frontend)
- PostgreSQL 15+ (running locally or remotely)

#### Backend Development

```bash
cd backend

# Install dependencies
uv sync
source .venv/bin/activate  # Linux/Mac
# .venv\Scripts\activate   # Windows

# Run development server
fastapi dev app/main.py

# Run tests
bash scripts/test.sh

# Lint and format
bash scripts/lint.sh
bash scripts/format.sh
```

#### Frontend Development

```bash
cd backoffice

# Install dependencies
bun install

# Run development server
bun run dev

# Regenerate API client (after backend changes)
bun run generate-client

# Lint
bun run lint
```

### Database Migrations

```bash
# Inside backend container
docker compose exec backend bash

# Create a new migration
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1
```

## Configuration Reference

### Environment Variables

#### Core Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `BACKOFFICE_URL` | Yes | `http://localhost:5173` | Backoffice URL (for CORS/emails) |
| `BACKEND_URL` | Yes | `http://localhost:8000` | Backend URL |
| `ENVIRONMENT` | No | `dev` | Environment (`dev`, `staging`, `production`) |
| `PROJECT_NAME` | No | `EdgeOS` | Application name |

#### Security (Required)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SECRET_KEY` | Yes | `changeme...` | JWT signing key. Generate with: `openssl rand -hex 32` |
| `SUPERADMIN` | Yes | `admin@example.com` | Initial superadmin email address |
| `BACKEND_CORS_ORIGINS` | No | `http://localhost,...` | Comma-separated list of allowed CORS origins |

#### Database (Required)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `POSTGRES_SERVER` | Yes | `db` | Database host (`db` for Docker, your host for external) |
| `POSTGRES_PORT` | No | `5432` | Database port |
| `POSTGRES_USER` | Yes | `postgres` | Database username |
| `POSTGRES_PASSWORD` | Yes | `changeme...` | Database password |
| `POSTGRES_DB` | Yes | `edgeos` | Database name |
| `POSTGRES_SSL_MODE` | No | `prefer` | SSL mode (`prefer`, `require`, `disable`) |

#### Email (Optional but recommended)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SMTP_HOST` | No | - | SMTP server (empty = emails disabled) |
| `SMTP_PORT` | No | `587` | SMTP port |
| `SMTP_USER` | No | - | SMTP username |
| `SMTP_PASSWORD` | No | - | SMTP password |
| `SENDER_EMAIL` | No | `noreply@example.com` | From address for emails |
| `SMTP_TLS` | No | `True` | Use TLS |
| `SMTP_SSL` | No | `False` | Use SSL |

#### File Storage (Optional)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `STORAGE_ENDPOINT_URL` | No | `http://localhost:9000` | S3-compatible endpoint |
| `STORAGE_ACCESS_KEY` | No | `minioadmin` | S3 access key |
| `STORAGE_SECRET_KEY` | No | `minioadmin` | S3 secret key |
| `STORAGE_BUCKET` | No | `edgeos` | S3 bucket name |
| `STORAGE_REGION` | No | `us-east-2` | S3 region |
| `STORAGE_PUBLIC_URL` | No | `http://localhost:9000/edgeos` | Public URL for file access |

#### Other Services (Optional)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `REDIS_URL` | No | `redis://redis:6379` | Redis connection URL |
| `SENTRY_DSN` | No | - | Sentry DSN for error tracking |

### Docker Services (Development)

| Service | Port | Description |
|---------|------|-------------|
| `backend` | 8000 | FastAPI application (hot reload enabled) |
| `backoffice` | 5173 | React dashboard |
| `db` | 5432 | PostgreSQL database |
| `mailpit` | 8025 (web), 1025 (smtp) | Email testing |
| `adminer` | 8080 | Database admin UI |
| `minio` | 9000 (api), 9001 (console) | S3-compatible storage |
| `redis` | 6379 | Redis cache |
| `redis-commander` | 8081 | Redis admin UI |
| `prestart` | - | Runs migrations before backend |

## API Documentation

Once running, the API documentation is available at:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/api/v1/openapi.json

### Authentication

The API uses JWT tokens. Authenticate via:

1. `POST /v1/auth/login` - Send email to receive login code
2. `POST /v1/auth/verify` - Verify code and receive JWT token
3. Include token in requests: `Authorization: Bearer <token>`

### Multi-Tenant Headers

For tenant-scoped endpoints:
- ADMIN/VIEWER users: Tenant derived from user's `tenant_id`
- SUPERADMIN users: Must provide `X-Tenant-Id` header

## User Roles

| Role | Permissions |
|------|-------------|
| **SUPERADMIN** | Full system access, manage tenants and users across all tenants |
| **ADMIN** | Full CRUD within their tenant, can create ADMIN/VIEWER users |
| **VIEWER** | Read-only access within their tenant |

## Additional Notes

### Email in Development

Email is pre-configured with Mailpit when using `docker compose watch`. All emails are captured and viewable at http://localhost:8025 (no actual emails are sent).

### Email in Production

For production, configure a real SMTP provider:
- [SendGrid](https://sendgrid.com/)
- [AWS SES](https://aws.amazon.com/ses/)
- [Mailgun](https://www.mailgun.com/)
- [Postmark](https://postmarkapp.com/)

### File Storage in Development

MinIO (S3-compatible) is pre-configured when using `docker compose watch`. Access the MinIO console at http://localhost:9001 (login: minioadmin/minioadmin).

### File Storage in Production

For production file uploads, use a managed S3-compatible service:
- AWS S3
- DigitalOcean Spaces
- Cloudflare R2
- MinIO (self-hosted)

## Production Deployment

For production, you must properly configure the environment variables. The `.env.example` defaults are NOT suitable for production.

### Required Changes for Production

1. **Generate a secure `SECRET_KEY`**:
   ```bash
   openssl rand -hex 32
   ```

2. **Set strong database credentials**:
   ```bash
   POSTGRES_PASSWORD=<strong-unique-password>
   POSTGRES_SSL_MODE=require
   ```

3. **Configure your URLs**:
   ```bash
   BACKOFFICE_URL=https://app.yourdomain.com
   BACKEND_URL=https://api.yourdomain.com
   ENVIRONMENT=production
   ```

4. **Configure email (required for passwordless auth)**:
   ```bash
   SMTP_HOST=smtp.yourdomain.com
   SMTP_USER=noreply@yourdomain.com
   SMTP_PASSWORD=<smtp-password>
   SENDER_EMAIL=noreply@yourdomain.com
   ```

5. **Configure file storage** (use a real S3 service):
   ```bash
   STORAGE_ENDPOINT_URL=https://s3.amazonaws.com
   STORAGE_ACCESS_KEY=<aws-access-key>
   STORAGE_SECRET_KEY=<aws-secret-key>
   STORAGE_BUCKET=your-bucket-name
   STORAGE_PUBLIC_URL=https://your-bucket-name.s3.amazonaws.com
   ```

6. **Set the superadmin email** to a real address:
   ```bash
   SUPERADMIN=admin@yourdomain.com
   ```

### Production Infrastructure Recommendations

- Use a managed PostgreSQL database (AWS RDS, DigitalOcean, Supabase, etc.)
- Set up SSL/TLS certificates (Let's Encrypt, Cloudflare, etc.)
- Configure a reverse proxy (nginx, Traefik, Caddy)
- Set up monitoring and logging (`SENTRY_DSN` for error tracking)
- Enable database backups
- Use managed S3-compatible storage (AWS S3, DigitalOcean Spaces, Cloudflare R2)

### Production Docker Command

```bash
# Production mode (no hot reload, no dev services)
docker compose -f compose.yaml up -d
```

Note: Production compose does NOT include the development services (db, mailpit, minio, redis, adminer). You must provide external services for database, email, and storage.

## License

See [LICENSE](LICENSE) file for details.
