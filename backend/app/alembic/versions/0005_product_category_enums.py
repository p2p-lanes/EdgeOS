"""Add product category enums and duration_type

Revision ID: 0005_product_enums
Revises: 0004_rm_social_eth
Create Date: 2026-01-30
"""

from alembic import op
import sqlalchemy as sa

revision = "0005_product_enums"
down_revision = "0004_rm_social_eth"
branch_labels = None
depends_on = None


def upgrade():
    # Create enum types
    productcategory = sa.Enum(
        "TICKET", "HOUSING", "MERCH", "OTHER", name="productcategory"
    )
    ticketduration = sa.Enum("DAY", "WEEK", "MONTH", "FULL", name="ticketduration")
    ticketattendeecategory = sa.Enum(
        "MAIN", "SPOUSE", "KID", name="ticketattendeecategory"
    )

    productcategory.create(op.get_bind(), checkfirst=True)
    ticketduration.create(op.get_bind(), checkfirst=True)
    ticketattendeecategory.create(op.get_bind(), checkfirst=True)

    # Add duration_type column
    op.add_column(
        "products",
        sa.Column("duration_type", ticketduration, nullable=True),
    )

    # Convert category column: existing data to 'TICKET', then change type to enum
    op.execute("UPDATE products SET category = 'ticket' WHERE category IS NULL")
    op.execute(
        """
        ALTER TABLE products
        ALTER COLUMN category TYPE productcategory
        USING UPPER(COALESCE(category, 'ticket'))::productcategory
        """
    )
    op.alter_column("products", "category", nullable=False, server_default="TICKET")

    # Convert attendee_category to enum (nullable)
    op.execute(
        """
        ALTER TABLE products
        ALTER COLUMN attendee_category TYPE ticketattendeecategory
        USING CASE
            WHEN attendee_category IS NOT NULL THEN UPPER(attendee_category)::ticketattendeecategory
            ELSE NULL
        END
        """
    )


def downgrade():
    # Convert attendee_category back to varchar
    op.execute(
        """
        ALTER TABLE products
        ALTER COLUMN attendee_category TYPE VARCHAR(50)
        USING LOWER(attendee_category::text)
        """
    )

    # Convert category back to varchar
    op.alter_column("products", "category", server_default=None)
    op.execute(
        """
        ALTER TABLE products
        ALTER COLUMN category TYPE VARCHAR(100)
        USING LOWER(category::text)
        """
    )

    # Drop duration_type column
    op.drop_column("products", "duration_type")

    # Drop enum types
    op.execute("DROP TYPE IF EXISTS ticketattendeecategory")
    op.execute("DROP TYPE IF EXISTS ticketduration")
    op.execute("DROP TYPE IF EXISTS productcategory")
