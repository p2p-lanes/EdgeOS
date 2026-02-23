"""drop requires_approval, fix nullable, fix users email index

Revision ID: 951b68bdb26b
Revises: 0010_add_email_templates
Create Date: 2026-02-13 11:18:42.715702

"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "951b68bdb26b"
down_revision = "0010_add_email_templates"
branch_labels = None
depends_on = None


def upgrade():
    # Drop requires_approval column (replaced by approvalstrategies table)
    op.drop_column("popups", "requires_approval")

    # Fix nullable on group_whitelisted_emails.created_at
    op.alter_column(
        "group_whitelisted_emails",
        "created_at",
        existing_type=postgresql.TIMESTAMP(timezone=True),
        nullable=False,
        existing_server_default=sa.text("now()"),
    )

    # Make ix_users_email unique (matches model unique=True)
    op.drop_index("ix_users_email", table_name="users")
    op.create_index("ix_users_email", "users", ["email"], unique=True)


def downgrade():
    op.drop_index("ix_users_email", table_name="users")
    op.create_index("ix_users_email", "users", ["email"], unique=False)

    op.alter_column(
        "group_whitelisted_emails",
        "created_at",
        existing_type=postgresql.TIMESTAMP(timezone=True),
        nullable=True,
        existing_server_default=sa.text("now()"),
    )

    op.add_column(
        "popups",
        sa.Column("requires_approval", sa.BOOLEAN(), nullable=True),
    )
