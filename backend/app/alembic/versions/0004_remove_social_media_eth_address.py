"""Remove social_media and eth_address from humans and snapshots

Revision ID: 0004_remove_social_media_eth_address
Revises: 0003_approval_system
Create Date: 2026-01-30

"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "0004_rm_social_eth"
down_revision = "0003_approval_system"
branch_labels = None
depends_on = None


def upgrade():
    # Remove from humans table
    op.drop_column("humans", "social_media")
    op.drop_column("humans", "eth_address")

    # Remove from application_snapshots table
    op.drop_column("application_snapshots", "social_media")
    op.drop_column("application_snapshots", "eth_address")


def downgrade():
    # Add back to humans table
    op.add_column(
        "humans",
        sa.Column("social_media", sa.String(500), nullable=True),
    )
    op.add_column(
        "humans",
        sa.Column("eth_address", sa.String(255), nullable=True),
    )

    # Add back to application_snapshots table
    op.add_column(
        "application_snapshots",
        sa.Column("social_media", sa.String(500), nullable=True),
    )
    op.add_column(
        "application_snapshots",
        sa.Column("eth_address", sa.String(255), nullable=True),
    )
