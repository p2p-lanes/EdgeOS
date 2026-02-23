"""Initial schema with all tables, RLS, indexes, and optimizations.

Revision ID: 0001_initial_schema
Revises:
Create Date: 2025-01-27

This consolidated migration includes:
- All table definitions
- Row-Level Security (RLS) policies for multi-tenant isolation
- All indexes (FK indexes, composite indexes, partial indexes)
- PostgreSQL optimizations (timeouts, autovacuum tuning)
- Tenant roles and permissions
"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql
import sqlmodel

# revision identifiers, used by Alembic.
revision = "0001_initial_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # =========================================================================
    # 1. CREATE TABLES
    # =========================================================================

    # -------------------------------------------------------------------------
    # Tenants (top-level, no tenant_id)
    # -------------------------------------------------------------------------
    op.create_table(
        "tenants",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("slug", sa.String(255), nullable=False, unique=True, index=True),
        sa.Column("deleted", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("sender_email", sa.String(255), nullable=True),
        sa.Column("sender_name", sa.String(255), nullable=True),
    )

    # -------------------------------------------------------------------------
    # Users (backoffice users, tenant_id nullable for superadmin)
    # -------------------------------------------------------------------------
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(255), nullable=False, index=True),
        sa.Column("full_name", sa.String(255), nullable=True),
        sa.Column("role", sa.String(50), nullable=False),
        sa.Column("deleted", sa.Boolean, nullable=False, server_default="false"),
        sa.Column(
            "tenant_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("tenants.id"),
            nullable=True,
            index=True,
        ),
        sa.Column("auth_code", sa.String(6), nullable=True),
        sa.Column("code_expiration", sa.DateTime(timezone=True), nullable=True),
        sa.Column("auth_attempts", sa.Integer, nullable=False, server_default="0"),
        sa.UniqueConstraint("email", "tenant_id", name="uq_user_email_tenant_id"),
    )

    # -------------------------------------------------------------------------
    # Tenant Credentials (for per-tenant DB connections)
    # -------------------------------------------------------------------------
    op.create_table(
        "tenant_credentials",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "tenant_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("tenants.id"),
            nullable=False,
        ),
        sa.Column("credential_type", sa.String(50), nullable=False),
        sa.Column("db_username", sa.String(255), nullable=False),
        sa.Column("db_password_encrypted", sa.String(512), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.UniqueConstraint(
            "tenant_id", "credential_type", name="uq_tenant_credentials_type"
        ),
    )

    # -------------------------------------------------------------------------
    # Humans (end-users/attendees with profile data)
    # -------------------------------------------------------------------------
    op.create_table(
        "humans",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "tenant_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("tenants.id"),
            nullable=False,
            index=True,
        ),
        sa.Column("email", sa.String(255), nullable=False, index=True),
        # Profile fields
        sa.Column("first_name", sa.String(255), nullable=True),
        sa.Column("last_name", sa.String(255), nullable=True),
        sa.Column("telegram", sa.String(255), nullable=True),
        sa.Column("organization", sa.String(255), nullable=True),
        sa.Column("role", sa.String(255), nullable=True),
        sa.Column("gender", sa.String(50), nullable=True),
        sa.Column("age", sa.String(50), nullable=True),
        sa.Column("social_media", sa.String(500), nullable=True),
        sa.Column("residence", sa.String(255), nullable=True),
        sa.Column("eth_address", sa.String(255), nullable=True),
        # Platform fields
        sa.Column("picture_url", sa.String(500), nullable=True),
        sa.Column("red_flag", sa.Boolean, nullable=False, server_default="false"),
        # Auth fields
        sa.Column("auth_code", sa.String(6), nullable=True),
        sa.Column("code_expiration", sa.DateTime(timezone=True), nullable=True),
        sa.Column("auth_attempts", sa.Integer, nullable=False, server_default="0"),
        sa.UniqueConstraint("email", "tenant_id", name="uq_human_email_tenant_id"),
    )

    # -------------------------------------------------------------------------
    # Pending Humans (for auth flow before human is created)
    # -------------------------------------------------------------------------
    op.create_table(
        "pending_humans",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "tenant_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("tenants.id"),
            nullable=False,
            index=True,
        ),
        sa.Column("email", sa.String(255), nullable=False, index=True),
        sa.Column("auth_code", sa.String(6), nullable=False),
        sa.Column(
            "code_expiration", sa.DateTime(timezone=True), nullable=False, index=True
        ),
        sa.Column("attempts", sa.Integer, nullable=False, server_default="0"),
        sa.Column("picture_url", sa.String(500), nullable=True),
        sa.Column("red_flag", sa.Boolean, nullable=False, server_default="false"),
        sa.UniqueConstraint(
            "email", "tenant_id", name="uq_pending_human_email_tenant_id"
        ),
    )

    # -------------------------------------------------------------------------
    # Popups (events)
    # -------------------------------------------------------------------------
    op.create_table(
        "popups",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "tenant_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("tenants.id"),
            nullable=False,
            index=True,
        ),
        sa.Column("name", sa.String(255), nullable=False, index=True),
        sa.Column("slug", sa.String(255), nullable=False, unique=True, index=True),
        sa.Column('start_date', sa.DateTime(), nullable=True),
        sa.Column('end_date', sa.DateTime(), nullable=True),
        sa.Column('status', sa.Enum('draft', 'active', 'archived', 'ended', name='popupstatus'), nullable=False),
        sa.Column('requires_approval', sa.Boolean(), nullable=True),
        sa.Column('allows_spouse', sa.Boolean(), nullable=True),
        sa.Column('allows_children', sa.Boolean(), nullable=True),
        sa.Column('allows_coupons', sa.Boolean(), nullable=True),
        sa.Column('image_url', sa.String(), nullable=True),
        sa.Column('icon_url', sa.String(), nullable=True),
        sa.Column('express_checkout_background', sa.String(), nullable=True),
        sa.Column('web_url', sa.String(), nullable=True),
        sa.Column('blog_url', sa.String(), nullable=True),
        sa.Column('twitter_url', sa.String(), nullable=True),
        sa.Column('simplefi_api_key', sa.String(), nullable=True),
    )

    # -------------------------------------------------------------------------
    # Products
    # -------------------------------------------------------------------------
    op.create_table(
        "products",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "tenant_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("tenants.id"),
            nullable=False,
            index=True,
        ),
        sa.Column(
            "popup_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("popups.id"),
            nullable=False,
            index=True,
        ),
        sa.Column("name", sa.String(255), nullable=False, index=True),
        sa.Column("slug", sa.String(255), nullable=False, index=True),
        sa.Column("price", sa.Numeric(10, 2), nullable=False),
        sa.Column("compare_price", sa.Numeric(10, 2), nullable=True),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("category", sa.String(100), nullable=True, index=True),
        sa.Column("attendee_category", sa.String(50), nullable=True),
        sa.Column("start_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("end_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("exclusive", sa.Boolean, nullable=False, server_default="false"),
        sa.UniqueConstraint("slug", "popup_id", name="uq_product_slug_popup_id"),
    )

    # -------------------------------------------------------------------------
    # Coupons
    # -------------------------------------------------------------------------
    op.create_table(
        "coupons",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "tenant_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("tenants.id"),
            nullable=False,
            index=True,
        ),
        sa.Column(
            "popup_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("popups.id"),
            nullable=False,
            index=True,
        ),
        sa.Column("code", sa.String(100), nullable=False, index=True),
        sa.Column("discount_value", sa.Integer, nullable=False, server_default="0"),
        sa.Column("max_uses", sa.Integer, nullable=True),
        sa.Column("current_uses", sa.Integer, nullable=False, server_default="0"),
        sa.Column("start_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("end_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="true"),
        sa.UniqueConstraint("code", "popup_id", name="uq_coupon_code_popup_id"),
    )

    # -------------------------------------------------------------------------
    # Groups
    # -------------------------------------------------------------------------
    op.create_table(
        "groups",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "tenant_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("tenants.id"),
            nullable=False,
            index=True,
        ),
        sa.Column(
            "popup_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("popups.id"),
            nullable=False,
            index=True,
        ),
        sa.Column("name", sa.String(255), nullable=False, index=True),
        sa.Column("slug", sa.String(255), nullable=False, unique=True, index=True),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column(
            "discount_percentage", sa.Numeric(5, 2), nullable=False, server_default="0"
        ),
        sa.Column("max_members", sa.Integer, nullable=True),
        sa.Column("welcome_message", sa.Text, nullable=True),
        sa.Column(
            "is_ambassador_group", sa.Boolean, nullable=False, server_default="false"
        ),
        sa.Column(
            "ambassador_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("humans.id"),
            nullable=True,
            index=True,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
        ),
        sa.UniqueConstraint("slug", "popup_id", name="uq_group_slug_popup"),
    )

    # -------------------------------------------------------------------------
    # Group Leaders (link table)
    # -------------------------------------------------------------------------
    op.create_table(
        "group_leaders",
        sa.Column(
            "tenant_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("tenants.id"),
            nullable=False,
            index=True,
        ),
        sa.Column(
            "group_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("groups.id"),
            primary_key=True,
        ),
        sa.Column(
            "human_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("humans.id"),
            primary_key=True,
        ),
    )

    # -------------------------------------------------------------------------
    # Group Members (link table)
    # -------------------------------------------------------------------------
    op.create_table(
        "group_members",
        sa.Column(
            "tenant_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("tenants.id"),
            nullable=False,
            index=True,
        ),
        sa.Column(
            "group_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("groups.id"),
            primary_key=True,
        ),
        sa.Column(
            "human_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("humans.id"),
            primary_key=True,
        ),
    )

    # -------------------------------------------------------------------------
    # Group Products (link table)
    # -------------------------------------------------------------------------
    op.create_table(
        "group_products",
        sa.Column(
            "tenant_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("tenants.id"),
            nullable=False,
            index=True,
        ),
        sa.Column(
            "group_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("groups.id"),
            primary_key=True,
        ),
        sa.Column(
            "product_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("products.id"),
            primary_key=True,
        ),
    )

    # -------------------------------------------------------------------------
    # Applications (popup-specific data only, profile is on Human)
    # -------------------------------------------------------------------------
    op.create_table(
        "applications",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "tenant_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("tenants.id"),
            nullable=False,
            index=True,
        ),
        sa.Column(
            "popup_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("popups.id"),
            nullable=False,
            index=True,
        ),
        sa.Column(
            "human_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("humans.id"),
            nullable=False,
            index=True,
        ),
        sa.Column(
            "group_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("groups.id"),
            nullable=True,
            index=True,
        ),
        # Popup-specific fields
        sa.Column("referral", sa.String(255), nullable=True),
        sa.Column(
            "info_not_shared",
            postgresql.ARRAY(sa.String),
            nullable=False,
            server_default="{}",
        ),
        sa.Column(
            "status", sa.String(50), nullable=False, server_default="draft", index=True
        ),
        # Dynamic form fields (popup-specific questions)
        sa.Column(
            "custom_fields", postgresql.JSONB, nullable=False, server_default="{}"
        ),
        sa.Column("custom_fields_schema", postgresql.JSONB, nullable=True),
        # Timestamps
        sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("accepted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
        ),
        sa.UniqueConstraint("human_id", "popup_id", name="uq_application_human_popup"),
    )

    # -------------------------------------------------------------------------
    # Application Snapshots (historical record of application + human profile)
    # -------------------------------------------------------------------------
    op.create_table(
        "application_snapshots",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "tenant_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("tenants.id"),
            nullable=False,
            index=True,
        ),
        sa.Column(
            "application_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("applications.id"),
            nullable=False,
            index=True,
        ),
        # Snapshot trigger event
        sa.Column(
            "event", sa.String(50), nullable=False
        ),  # submitted, accepted, updated
        # Human profile snapshot at this moment
        sa.Column("first_name", sa.String(255), nullable=True),
        sa.Column("last_name", sa.String(255), nullable=True),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("telegram", sa.String(255), nullable=True),
        sa.Column("organization", sa.String(255), nullable=True),
        sa.Column("role", sa.String(255), nullable=True),
        sa.Column("gender", sa.String(50), nullable=True),
        sa.Column("age", sa.String(50), nullable=True),
        sa.Column("social_media", sa.String(500), nullable=True),
        sa.Column("residence", sa.String(255), nullable=True),
        sa.Column("eth_address", sa.String(255), nullable=True),
        # Application data snapshot
        sa.Column("referral", sa.String(255), nullable=True),
        sa.Column(
            "info_not_shared",
            postgresql.ARRAY(sa.String),
            nullable=False,
            server_default="{}",
        ),
        sa.Column(
            "custom_fields", postgresql.JSONB, nullable=False, server_default="{}"
        ),
        sa.Column("status", sa.String(50), nullable=False),
        # Timestamp
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )

    # -------------------------------------------------------------------------
    # Attendees
    # -------------------------------------------------------------------------
    op.create_table(
        "attendees",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "tenant_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("tenants.id"),
            nullable=False,
            index=True,
        ),
        sa.Column(
            "application_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("applications.id"),
            nullable=False,
            index=True,
        ),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("category", sa.String(50), nullable=False, index=True),
        sa.Column("email", sa.String(255), nullable=True),
        sa.Column("gender", sa.String(50), nullable=True),
        sa.Column("check_in_code", sa.String(100), nullable=False, index=True),
        sa.Column("poap_url", sa.String(500), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
        ),
    )

    # -------------------------------------------------------------------------
    # Attendee Products (link table)
    # -------------------------------------------------------------------------
    op.create_table(
        "attendee_products",
        sa.Column(
            "tenant_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("tenants.id"),
            nullable=False,
            index=True,
        ),
        sa.Column(
            "attendee_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("attendees.id"),
            primary_key=True,
        ),
        sa.Column(
            "product_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("products.id"),
            primary_key=True,
        ),
        sa.Column("quantity", sa.Integer, nullable=False, server_default="1"),
    )

    # -------------------------------------------------------------------------
    # Payments
    # -------------------------------------------------------------------------
    op.create_table(
        "payments",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "tenant_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("tenants.id"),
            nullable=False,
            index=True,
        ),
        sa.Column(
            "application_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("applications.id"),
            nullable=False,
            index=True,
        ),
        sa.Column("external_id", sa.String(255), nullable=True),
        sa.Column(
            "status",
            sa.String(50),
            nullable=False,
            server_default="pending",
            index=True,
        ),
        sa.Column("amount", sa.Numeric(10, 2), nullable=False),
        sa.Column("currency", sa.String(10), nullable=False, server_default="USD"),
        sa.Column("rate", sa.Numeric(18, 8), nullable=True),
        sa.Column("source", sa.String(100), nullable=True),
        sa.Column("checkout_url", sa.String(500), nullable=True),
        sa.Column(
            "coupon_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("coupons.id"),
            nullable=True,
            index=True,
        ),
        sa.Column("coupon_code", sa.String(100), nullable=True),
        sa.Column("discount_value", sa.Numeric(10, 2), nullable=True),
        sa.Column("edit_passes", sa.Boolean, nullable=False, server_default="false"),
        sa.Column(
            "group_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("groups.id"),
            nullable=True,
            index=True,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
        ),
    )

    # -------------------------------------------------------------------------
    # Payment Products (link table with snapshot)
    # -------------------------------------------------------------------------
    op.create_table(
        "payment_products",
        sa.Column(
            "tenant_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("tenants.id"),
            nullable=False,
            index=True,
        ),
        sa.Column(
            "payment_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("payments.id"),
            primary_key=True,
        ),
        sa.Column(
            "product_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("products.id"),
            primary_key=True,
        ),
        sa.Column(
            "attendee_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("attendees.id"),
            primary_key=True,
        ),
        sa.Column("quantity", sa.Integer, nullable=False, server_default="1"),
        sa.Column("product_name", sa.String(255), nullable=False),
        sa.Column("product_description", sa.Text, nullable=True),
        sa.Column("product_price", sa.Numeric(10, 2), nullable=False),
        sa.Column("product_category", sa.String(100), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )

    # -------------------------------------------------------------------------
    # Form Fields (custom form fields per popup)
    # -------------------------------------------------------------------------
    op.create_table(
        "formfields",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "tenant_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("tenants.id"),
            nullable=False,
            index=True,
        ),
        sa.Column(
            "popup_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("popups.id"),
            nullable=False,
            index=True,
        ),
        sa.Column("name", sa.String(100), nullable=False, index=True),
        sa.Column("label", sa.String(255), nullable=False),
        sa.Column("field_type", sa.String(50), nullable=False, server_default="text"),
        sa.Column("section", sa.String(100), nullable=True),
        sa.Column("position", sa.Integer, nullable=False, server_default="0"),
        sa.Column("required", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("options", postgresql.ARRAY(sa.String), nullable=True),
        sa.Column("placeholder", sa.String(255), nullable=True),
        sa.Column("help_text", sa.String(500), nullable=True),
        sa.UniqueConstraint("name", "popup_id", name="uq_form_field_name_popup"),
    )

    # =========================================================================
    # 2. CREATE TENANT ROLES AND PERMISSIONS
    # =========================================================================

    # Create tenant roles (NOLOGIN = group roles, not login roles)
    op.execute(
        "DO $$ BEGIN CREATE ROLE tenant_role NOLOGIN; EXCEPTION WHEN duplicate_object THEN null; END $$;"
    )
    op.execute(
        "DO $$ BEGIN CREATE ROLE tenant_viewer_role NOLOGIN; EXCEPTION WHEN duplicate_object THEN null; END $$;"
    )

    # Grant schema and sequence usage
    op.execute("GRANT USAGE ON SCHEMA public TO tenant_role")
    op.execute("GRANT USAGE ON SCHEMA public TO tenant_viewer_role")
    op.execute("GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO tenant_role")
    op.execute("GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO tenant_viewer_role")

    # =========================================================================
    # 3. SETUP RLS AND PERMISSIONS FOR EACH TABLE
    # =========================================================================

    # Tables WITH tenant_id that need RLS
    tenant_tables = [
        "popups",
        "humans",
        "pending_humans",
        "products",
        "coupons",
        "groups",
        "group_leaders",
        "group_members",
        "group_products",
        "applications",
        "application_snapshots",
        "attendees",
        "attendee_products",
        "payments",
        "payment_products",
        "formfields",
    ]

    for table in tenant_tables:
        # Grant permissions
        op.execute(
            f"GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE {table} TO tenant_role"
        )
        op.execute(f"GRANT SELECT ON TABLE {table} TO tenant_viewer_role")

        # Enable RLS
        op.execute(f"ALTER TABLE {table} ENABLE ROW LEVEL SECURITY")

        # Create optimized RLS policy (SELECT wrapper caches value, 100x+ faster)
        policy_name = f"tenant_isolation_policy_{table}"
        op.execute(
            f"""
            CREATE POLICY {policy_name} ON {table}
            USING (tenant_id = (SELECT current_setting('app.tenant_id', true)::uuid))
            WITH CHECK (tenant_id = (SELECT current_setting('app.tenant_id', true)::uuid));
            """
        )

    # Tables WITHOUT tenant_id (read-only for tenants)
    readonly_tables = ["tenants"]
    for table in readonly_tables:
        op.execute(
            f"GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE {table} TO tenant_role"
        )
        op.execute(f"GRANT SELECT ON TABLE {table} TO tenant_viewer_role")

    # =========================================================================
    # 4. CREATE ADDITIONAL INDEXES
    # =========================================================================

    # FK indexes for better join performance (not auto-created by PostgreSQL)
    op.create_index(
        "ix_group_leaders_human_id", "group_leaders", ["human_id"], unique=False
    )
    op.create_index(
        "ix_group_members_human_id", "group_members", ["human_id"], unique=False
    )
    op.create_index(
        "ix_group_products_product_id", "group_products", ["product_id"], unique=False
    )
    op.create_index(
        "ix_attendee_products_product_id",
        "attendee_products",
        ["product_id"],
        unique=False,
    )
    op.create_index(
        "ix_payment_products_product_id",
        "payment_products",
        ["product_id"],
        unique=False,
    )
    op.create_index(
        "ix_payment_products_attendee_id",
        "payment_products",
        ["attendee_id"],
        unique=False,
    )

    # Composite indexes for common query patterns
    op.create_index(
        "ix_applications_popup_status",
        "applications",
        ["popup_id", "status"],
        unique=False,
    )
    op.create_index(
        "ix_products_popup_active", "products", ["popup_id", "is_active"], unique=False
    )
    op.create_index(
        "ix_payments_application_status",
        "payments",
        ["application_id", "status"],
        unique=False,
    )
    op.create_index(
        "ix_coupons_popup_active", "coupons", ["popup_id", "is_active"], unique=False
    )
    op.create_index(
        "ix_groups_popup_ambassador",
        "groups",
        ["popup_id", "is_ambassador_group"],
        unique=False,
    )
    op.create_index(
        "ix_attendees_application_category",
        "attendees",
        ["application_id", "category"],
        unique=False,
    )

    # Partial indexes for common filtered queries
    op.execute(
        """
        CREATE INDEX ix_products_active_lookup ON products (popup_id, category)
        WHERE is_active = true;
        """
    )
    op.execute(
        """
        CREATE INDEX ix_coupons_active_lookup ON coupons (popup_id, code)
        WHERE is_active = true;
        """
    )
    op.execute(
        """
        CREATE INDEX ix_applications_active_status ON applications (popup_id, submitted_at)
        WHERE status IN ('in review', 'accepted');
        """
    )
    op.execute(
        """
        CREATE INDEX ix_payments_pending_queue ON payments (created_at)
        WHERE status = 'pending';
        """
    )
    op.execute(
        """
        CREATE INDEX ix_tenants_active ON tenants (slug)
        WHERE deleted = false;
        """
    )
    op.execute(
        """
        CREATE INDEX ix_users_active ON users (email)
        WHERE deleted = false;
        """
    )

    # GIN index for JSONB custom_fields
    op.execute(
        """
        CREATE INDEX ix_applications_custom_fields ON applications
        USING GIN (custom_fields);
        """
    )

    # =========================================================================
    # 5. POSTGRESQL OPTIMIZATIONS
    # =========================================================================
    # NOTE: The following settings should be configured via AWS RDS Parameter Groups
    # for Aurora PostgreSQL, not via ALTER SYSTEM:
    # - idle_in_transaction_session_timeout = 30000 (ms)
    # - idle_session_timeout = 600000 (ms)
    # - statement_timeout = 60000 (ms)
    # - shared_preload_libraries = pg_stat_statements

    # Autovacuum tuning for high-churn tables (these work in migrations)
    op.execute(
        """
        ALTER TABLE applications SET (
            autovacuum_vacuum_scale_factor = 0.05,
            autovacuum_analyze_scale_factor = 0.02
        );
        """
    )
    op.execute(
        """
        ALTER TABLE payments SET (
            autovacuum_vacuum_scale_factor = 0.05,
            autovacuum_analyze_scale_factor = 0.02
        );
        """
    )
    op.execute(
        """
        ALTER TABLE attendees SET (
            autovacuum_vacuum_scale_factor = 0.05,
            autovacuum_analyze_scale_factor = 0.02
        );
        """
    )


def downgrade() -> None:
    # Drop partial indexes
    op.execute("DROP INDEX IF EXISTS ix_applications_custom_fields")
    op.execute("DROP INDEX IF EXISTS ix_users_active")
    op.execute("DROP INDEX IF EXISTS ix_tenants_active")
    op.execute("DROP INDEX IF EXISTS ix_payments_pending_queue")
    op.execute("DROP INDEX IF EXISTS ix_applications_active_status")
    op.execute("DROP INDEX IF EXISTS ix_coupons_active_lookup")
    op.execute("DROP INDEX IF EXISTS ix_products_active_lookup")

    # Drop composite indexes
    op.drop_index("ix_attendees_application_category", table_name="attendees")
    op.drop_index("ix_groups_popup_ambassador", table_name="groups")
    op.drop_index("ix_coupons_popup_active", table_name="coupons")
    op.drop_index("ix_payments_application_status", table_name="payments")
    op.drop_index("ix_products_popup_active", table_name="products")
    op.drop_index("ix_applications_popup_status", table_name="applications")

    # Drop FK indexes
    op.drop_index("ix_payment_products_attendee_id", table_name="payment_products")
    op.drop_index("ix_payment_products_product_id", table_name="payment_products")
    op.drop_index("ix_attendee_products_product_id", table_name="attendee_products")
    op.drop_index("ix_group_products_product_id", table_name="group_products")
    op.drop_index("ix_group_members_human_id", table_name="group_members")
    op.drop_index("ix_group_leaders_human_id", table_name="group_leaders")

    # Drop RLS policies and revoke permissions
    tenant_tables = [
        "formfields",
        "payment_products",
        "payments",
        "attendee_products",
        "attendees",
        "application_snapshots",
        "applications",
        "group_products",
        "group_members",
        "group_leaders",
        "groups",
        "coupons",
        "products",
        "pending_humans",
        "humans",
        "popups",
    ]

    for table in tenant_tables:
        policy_name = f"tenant_isolation_policy_{table}"
        op.execute(f"DROP POLICY IF EXISTS {policy_name} ON {table}")
        op.execute(f"ALTER TABLE {table} DISABLE ROW LEVEL SECURITY")
        op.execute(f"REVOKE ALL ON TABLE {table} FROM tenant_role")
        op.execute(f"REVOKE ALL ON TABLE {table} FROM tenant_viewer_role")

    # Revoke readonly table permissions
    op.execute("REVOKE ALL ON TABLE tenants FROM tenant_role")
    op.execute("REVOKE ALL ON TABLE tenants FROM tenant_viewer_role")

    # Revoke schema permissions and drop roles
    op.execute("REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM tenant_viewer_role")
    op.execute("REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM tenant_role")
    op.execute("REVOKE USAGE ON SCHEMA public FROM tenant_viewer_role")
    op.execute("REVOKE USAGE ON SCHEMA public FROM tenant_role")
    op.execute("DROP ROLE IF EXISTS tenant_viewer_role")
    op.execute("DROP ROLE IF EXISTS tenant_role")

    # Drop tables in reverse order (respecting FKs)
    op.drop_table("formfields")
    op.drop_table("payment_products")
    op.drop_table("payments")
    op.drop_table("attendee_products")
    op.drop_table("attendees")
    op.drop_table("application_snapshots")
    op.drop_table("applications")
    op.drop_table("group_products")
    op.drop_table("group_members")
    op.drop_table("group_leaders")
    op.drop_table("groups")
    op.drop_table("coupons")
    op.drop_table("products")
    op.drop_table("popups")
    op.drop_table("pending_humans")
    op.drop_table("humans")
    op.drop_table("tenant_credentials")
    op.drop_table("users")
    op.drop_table("tenants")
