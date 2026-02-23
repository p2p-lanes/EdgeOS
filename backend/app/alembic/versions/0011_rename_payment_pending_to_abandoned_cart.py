"""Rename payment_pending to abandoned_cart in email_templates

Revision ID: 0011_abandoned_cart
Revises: 951b68bdb26b
Create Date: 2026-02-13

"""

from alembic import op

# revision identifiers, used by Alembic.
revision = "0011_abandoned_cart"
down_revision = "951b68bdb26b"
branch_labels = None
depends_on = None


def upgrade():
    op.execute(
        "UPDATE email_templates SET template_type = 'abandoned_cart' "
        "WHERE template_type = 'payment_pending'"
    )


def downgrade():
    op.execute(
        "UPDATE email_templates SET template_type = 'payment_pending' "
        "WHERE template_type = 'abandoned_cart'"
    )
