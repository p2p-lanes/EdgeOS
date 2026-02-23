"""Add max_quantity to products

Revision ID: 0006_max_quantity
Revises: 0005_product_enums
Create Date: 2026-02-02 18:00:00.000000

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "0006_max_quantity"
down_revision = "0005_product_enums"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "products",
        sa.Column("max_quantity", sa.Integer(), nullable=True),
    )


def downgrade():
    op.drop_column("products", "max_quantity")
