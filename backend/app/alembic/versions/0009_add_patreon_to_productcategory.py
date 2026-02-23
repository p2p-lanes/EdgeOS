"""Add PATREON to productcategory enum

Revision ID: 0009_add_patreon
Revises: 0008_add_check_ins
Create Date: 2026-02-11

"""

from alembic import op

# revision identifiers, used by Alembic.
revision = "0009_add_patreon"
down_revision = "0008_add_check_ins"
branch_labels = None
depends_on = None


def upgrade():
    op.execute("ALTER TYPE productcategory ADD VALUE IF NOT EXISTS 'PATREON'")


def downgrade():
    # PostgreSQL doesn't support removing values from enums.
    # Would require recreating the type, which is complex and unnecessary.
    pass
