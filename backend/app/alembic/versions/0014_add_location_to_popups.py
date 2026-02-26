"""Add location column to popups

Revision ID: 0014_add_location
Revises: 0013_add_tagline
Create Date: 2026-02-25

"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "0014_add_location"
down_revision = "0013_add_tagline"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("popups", sa.Column("location", sa.String(), nullable=True))


def downgrade():
    op.drop_column("popups", "location")
