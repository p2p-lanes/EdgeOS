"""Add approval system tables.

Revision ID: 0003_approval_system
Revises: 0002_schema_updates
Create Date: 2025-01-30

This migration adds tables for the application approval system:
- approval_strategies: Popup-level approval configuration
- popup_reviewers: Designated reviewers per popup
- application_reviews: Individual review records
"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "0003_approval_system"
down_revision = "0002_schema_updates"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # =========================================================================
    # 1. CREATE TABLES
    # =========================================================================

    # -------------------------------------------------------------------------
    # Approval Strategies (popup-level configuration)
    # -------------------------------------------------------------------------
    op.create_table(
        "approvalstrategies",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "popup_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("popups.id", ondelete="CASCADE"),
            nullable=False,
            unique=True,
            index=True,
        ),
        sa.Column(
            "tenant_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("tenants.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column(
            "strategy_type",
            sa.String(50),
            nullable=False,
            server_default="any_reviewer",
        ),
        sa.Column("required_approvals", sa.Integer, nullable=False, server_default="1"),
        sa.Column("accept_threshold", sa.Integer, nullable=False, server_default="2"),
        sa.Column("reject_threshold", sa.Integer, nullable=False, server_default="-2"),
        sa.Column("strong_yes_weight", sa.Integer, nullable=False, server_default="2"),
        sa.Column("yes_weight", sa.Integer, nullable=False, server_default="1"),
        sa.Column("no_weight", sa.Integer, nullable=False, server_default="-1"),
        sa.Column("strong_no_weight", sa.Integer, nullable=False, server_default="-2"),
        sa.Column(
            "rejection_is_veto", sa.Boolean, nullable=False, server_default="true"
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
        ),
        sa.UniqueConstraint("popup_id", name="uq_approval_strategy_popup"),
    )

    # -------------------------------------------------------------------------
    # Popup Reviewers (designated reviewers per popup)
    # -------------------------------------------------------------------------
    op.create_table(
        "popupreviewers",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "popup_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("popups.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column(
            "tenant_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("tenants.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column("is_required", sa.Boolean, nullable=False, server_default="false"),
        sa.Column(
            "weight_multiplier", sa.Float, nullable=False, server_default="1.0"
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.UniqueConstraint("popup_id", "user_id", name="uq_popup_reviewer"),
    )

    # -------------------------------------------------------------------------
    # Application Reviews (individual review records)
    # -------------------------------------------------------------------------
    op.create_table(
        "applicationreviews",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "application_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("applications.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column(
            "reviewer_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column(
            "tenant_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("tenants.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column("decision", sa.String(20), nullable=False),
        sa.Column("notes", sa.Text, nullable=True),
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
        ),
        sa.UniqueConstraint(
            "application_id", "reviewer_id", name="uq_review_app_user"
        ),
    )

    # =========================================================================
    # 2. ROW LEVEL SECURITY POLICIES
    # =========================================================================

    # Enable RLS on new tables
    op.execute("ALTER TABLE approvalstrategies ENABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE popupreviewers ENABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE applicationreviews ENABLE ROW LEVEL SECURITY;")

    # Create tenant isolation policies
    op.execute(
        """
        CREATE POLICY tenant_isolation_approval_strategies ON approvalstrategies
            USING (tenant_id = current_setting('app.tenant_id', true)::uuid);
        """
    )
    op.execute(
        """
        CREATE POLICY tenant_isolation_popup_reviewers ON popupreviewers
            USING (tenant_id = current_setting('app.tenant_id', true)::uuid);
        """
    )
    op.execute(
        """
        CREATE POLICY tenant_isolation_application_reviews ON applicationreviews
            USING (tenant_id = current_setting('app.tenant_id', true)::uuid);
        """
    )

    # =========================================================================
    # 3. GRANT PERMISSIONS TO TENANT ROLES
    # =========================================================================

    approval_tables = [
        "approvalstrategies",
        "popupreviewers",
        "applicationreviews",
    ]

    for table in approval_tables:
        op.execute(
            f"GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE {table} TO tenant_role"
        )
        op.execute(f"GRANT SELECT ON TABLE {table} TO tenant_viewer_role")


def downgrade() -> None:
    # Drop RLS policies
    op.execute(
        "DROP POLICY IF EXISTS tenant_isolation_application_reviews ON applicationreviews;"
    )
    op.execute(
        "DROP POLICY IF EXISTS tenant_isolation_popup_reviewers ON popupreviewers;"
    )
    op.execute(
        "DROP POLICY IF EXISTS tenant_isolation_approval_strategies ON approvalstrategies;"
    )

    # Disable RLS
    op.execute("ALTER TABLE applicationreviews DISABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE popupreviewers DISABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE approvalstrategies DISABLE ROW LEVEL SECURITY;")

    # Drop tables
    op.drop_table("applicationreviews")
    op.drop_table("popupreviewers")
    op.drop_table("approvalstrategies")
