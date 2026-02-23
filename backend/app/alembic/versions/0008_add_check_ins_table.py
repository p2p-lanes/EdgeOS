"""Add check_ins table

Revision ID: 0008_add_check_ins
Revises: 0007_rm_rejection_veto
Create Date: 2026-02-11

"""

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

from alembic import op

# revision identifiers, used by Alembic.
revision = "0008_add_check_ins"
down_revision = "0007_rm_rejection_veto"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "check_ins",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("tenant_id", UUID(as_uuid=True), sa.ForeignKey("tenants.id"), nullable=False, index=True),
        sa.Column("attendee_id", UUID(as_uuid=True), sa.ForeignKey("attendees.id"), nullable=False, unique=True, index=True),
        sa.Column("arrival_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("departure_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("qr_check_in", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("qr_scan_timestamp", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # Grants
    op.execute("GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE check_ins TO tenant_role")
    op.execute("GRANT SELECT ON TABLE check_ins TO tenant_viewer_role")

    # RLS policy (SELECT wrapper caches the setting value for performance)
    op.execute("ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY")
    op.execute(
        """
        CREATE POLICY tenant_isolation_policy_check_ins ON check_ins
        USING (tenant_id = (SELECT current_setting('app.tenant_id', true)::uuid))
        WITH CHECK (tenant_id = (SELECT current_setting('app.tenant_id', true)::uuid));
        """
    )


def downgrade():
    op.execute("DROP POLICY IF EXISTS tenant_isolation_policy_check_ins ON check_ins")
    op.drop_table("check_ins")
