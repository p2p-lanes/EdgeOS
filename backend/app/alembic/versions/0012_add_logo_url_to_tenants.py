"""Add logo_url column to tenants

Revision ID: 0012_add_logo_url
Revises: 0011_abandoned_cart
Create Date: 2026-02-25

"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "0012_add_logo_url"
down_revision = "0011_abandoned_cart"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("tenants", sa.Column("logo_url", sa.String(), nullable=True))


def downgrade():
    op.drop_column("tenants", "logo_url")
