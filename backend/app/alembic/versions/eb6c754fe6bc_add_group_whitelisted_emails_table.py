"""Add group_whitelisted_emails table

Revision ID: eb6c754fe6bc
Revises: 0006_max_quantity
Create Date: 2026-02-05 11:33:01.485174

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes

from app.alembic.utils import add_tenant_table_permissions, remove_tenant_table_permissions

# revision identifiers, used by Alembic.
revision = 'eb6c754fe6bc'
down_revision = '0006_max_quantity'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('group_whitelisted_emails',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('tenant_id', sa.Uuid(), nullable=False),
        sa.Column('group_id', sa.Uuid(), nullable=False),
        sa.Column('email', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['group_id'], ['groups.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('group_id', 'email', name='uq_group_whitelisted_email')
    )
    op.create_index(op.f('ix_group_whitelisted_emails_email'), 'group_whitelisted_emails', ['email'], unique=False)
    op.create_index(op.f('ix_group_whitelisted_emails_group_id'), 'group_whitelisted_emails', ['group_id'], unique=False)
    op.create_index(op.f('ix_group_whitelisted_emails_tenant_id'), 'group_whitelisted_emails', ['tenant_id'], unique=False)

    # Add RLS policies and tenant permissions
    add_tenant_table_permissions('group_whitelisted_emails')


def downgrade():
    # Remove RLS policies and permissions before dropping table
    remove_tenant_table_permissions('group_whitelisted_emails')

    op.drop_index(op.f('ix_group_whitelisted_emails_tenant_id'), table_name='group_whitelisted_emails')
    op.drop_index(op.f('ix_group_whitelisted_emails_group_id'), table_name='group_whitelisted_emails')
    op.drop_index(op.f('ix_group_whitelisted_emails_email'), table_name='group_whitelisted_emails')
    op.drop_table('group_whitelisted_emails')
