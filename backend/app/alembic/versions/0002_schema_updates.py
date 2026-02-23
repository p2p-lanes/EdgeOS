"""Schema updates - tenant branding and attendee-human linking

Revision ID: 0002_schema_updates
Revises: 0001_initial_schema
Create Date: 2026-01-29

Changes:
- Add image_url and icon_url to tenants table (branding)
- Add human_id FK to attendees table (spouse ticket linking)
"""

import sqlalchemy as sa

from alembic import op

revision = "0002_schema_updates"
down_revision = "0001_initial_schema"
branch_labels = None
depends_on = None


def upgrade():
    # Add branding columns to tenants
    op.add_column("tenants", sa.Column("image_url", sa.String(500), nullable=True))
    op.add_column("tenants", sa.Column("icon_url", sa.String(500), nullable=True))

    # Add human_id to attendees for spouse ticket linking
    op.add_column("attendees", sa.Column("human_id", sa.Uuid(), nullable=True))
    op.create_index(
        op.f("ix_attendees_human_id"), "attendees", ["human_id"], unique=False
    )
    op.create_foreign_key(
        "fk_attendees_human_id", "attendees", "humans", ["human_id"], ["id"]
    )

    # Backfill: link existing attendees to humans by matching email + tenant_id
    op.execute("""
        UPDATE attendees a
        SET human_id = h.id
        FROM humans h
        WHERE a.email IS NOT NULL
          AND LOWER(a.email) = LOWER(h.email)
          AND a.tenant_id = h.tenant_id
          AND a.human_id IS NULL
    """)


def downgrade():
    # Remove human_id from attendees
    op.drop_constraint("fk_attendees_human_id", "attendees", type_="foreignkey")
    op.drop_index(op.f("ix_attendees_human_id"), table_name="attendees")
    op.drop_column("attendees", "human_id")

    # Remove branding columns from tenants
    op.drop_column("tenants", "icon_url")
    op.drop_column("tenants", "image_url")
