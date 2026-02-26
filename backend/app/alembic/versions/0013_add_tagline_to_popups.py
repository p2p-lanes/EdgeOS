"""Add tagline column to popups

Revision ID: 0013_add_tagline
Revises: 0012_add_logo_url
Create Date: 2026-02-25

"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "0013_add_tagline"
down_revision = "0012_add_logo_url"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("popups", sa.Column("tagline", sa.String(), nullable=True))


def downgrade():
    op.drop_column("popups", "tagline")
