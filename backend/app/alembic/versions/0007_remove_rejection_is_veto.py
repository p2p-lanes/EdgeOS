"""Remove rejection_is_veto from approval_strategies

Revision ID: 0007_rm_rejection_veto
Revises: eb6c754fe6bc
Create Date: 2026-02-05

"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "0007_rm_rejection_veto"
down_revision = "eb6c754fe6bc"
branch_labels = None
depends_on = None


def upgrade():
    op.drop_column("approvalstrategies", "rejection_is_veto")


def downgrade():
    op.add_column(
        "approvalstrategies",
        sa.Column("rejection_is_veto", sa.Boolean(), nullable=False, server_default="true"),
    )
