"""Add email_templates table

Revision ID: 0010_add_email_templates
Revises: 0009_add_patreon
Create Date: 2026-02-12

"""

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

from alembic import op

# revision identifiers, used by Alembic.
revision = "0010_add_email_templates"
down_revision = "0009_add_patreon"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "email_templates",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("tenant_id", UUID(as_uuid=True), sa.ForeignKey("tenants.id"), nullable=False, index=True),
        sa.Column("popup_id", UUID(as_uuid=True), sa.ForeignKey("popups.id"), nullable=False, index=True),
        sa.Column("template_type", sa.String(), nullable=False, index=True),
        sa.Column("subject", sa.String(), nullable=True),
        sa.Column("html_content", sa.Text(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.UniqueConstraint("popup_id", "template_type", name="uq_email_template_popup_type"),
    )

    # Grants
    op.execute("GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE email_templates TO tenant_role")
    op.execute("GRANT SELECT ON TABLE email_templates TO tenant_viewer_role")

    # RLS policy (SELECT wrapper caches the setting value for performance)
    op.execute("ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY")
    op.execute(
        """
        CREATE POLICY tenant_isolation_policy_email_templates ON email_templates
        USING (tenant_id = (SELECT current_setting('app.tenant_id', true)::uuid))
        WITH CHECK (tenant_id = (SELECT current_setting('app.tenant_id', true)::uuid));
        """
    )


def downgrade():
    op.execute("DROP POLICY IF EXISTS tenant_isolation_policy_email_templates ON email_templates")
    op.drop_table("email_templates")
