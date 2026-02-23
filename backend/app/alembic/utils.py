from alembic import op


def _grant_table_permissions(table_name: str) -> None:
    """Grant base permissions to tenant roles for a table.

    Grants full CRUD to tenant_role and read-only to tenant_viewer_role.
    This is the common permission pattern used by both tenant-scoped
    and non-tenant-scoped tables.

    Args:
        table_name: Name of the table to grant permissions for
    """
    # Grant full CRUD permissions to tenant_role
    op.execute(f"GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE {table_name} TO tenant_role")
    # Grant read-only permissions to tenant_viewer_role
    op.execute(f"GRANT SELECT ON TABLE {table_name} TO tenant_viewer_role")


def add_tenant_table_permissions(table_name: str) -> None:
    """Add permissions and RLS for a new tenant-scoped table.

    This function should be called in migrations when creating a new table
    that has a tenant_id column and needs Row Level Security.

    Args:
        table_name: Name of the table to add permissions for

    Example:
        def upgrade() -> None:
            op.create_table('new_table', ...)
            add_tenant_table_permissions('new_table')
    """
    # Grant base permissions to both roles
    _grant_table_permissions(table_name)

    # Enable Row Level Security
    op.execute(f"ALTER TABLE {table_name} ENABLE ROW LEVEL SECURITY")

    # Create RLS policy for tenant isolation
    # IMPORTANT: Wrapping current_setting in SELECT caches the value (called once)
    # instead of evaluating per-row, which is 100x+ faster on large tables
    policy_name = f"tenant_isolation_policy_{table_name}"
    op.execute(
        f"""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_policies
                WHERE schemaname = 'public'
                AND tablename = '{table_name}'
                AND policyname = '{policy_name}'
            ) THEN
                CREATE POLICY {policy_name} ON {table_name}
                USING (tenant_id = (SELECT current_setting('app.tenant_id', true)::uuid))
                WITH CHECK (tenant_id = (SELECT current_setting('app.tenant_id', true)::uuid));
            END IF;
        END $$;
        """
    )


def add_readonly_table_permissions(table_name: str) -> None:
    """Add permissions for a table that tenants need to access but doesn't have tenant_id.

    Use this for tables like 'tenants' that don't have tenant_id but tenants need to access.
    tenant_role gets full CRUD access, tenant_viewer_role gets read-only access.

    Args:
        table_name: Name of the table to add permissions for

    Example:
        def upgrade() -> None:
            op.create_table('lookup_table', ...)
            add_readonly_table_permissions('lookup_table')
    """
    # Grant base permissions to both roles
    _grant_table_permissions(table_name)


def remove_tenant_table_permissions(table_name: str) -> None:
    """Remove permissions and RLS for a tenant-scoped table.

    This function should be called in downgrade() before dropping the table.

    Args:
        table_name: Name of the table to remove permissions for

    Example:
        def downgrade() -> None:
            remove_tenant_table_permissions('new_table')
            op.drop_table('new_table')
    """
    # Drop RLS policy
    policy_name = f"tenant_isolation_policy_{table_name}"
    op.execute(
        f"""
        DO $$
        BEGIN
            DROP POLICY IF EXISTS {policy_name} ON {table_name};
        EXCEPTION WHEN undefined_table THEN NULL;
        END $$;
        """
    )

    # Disable RLS
    op.execute(
        f"""
        DO $$
        BEGIN
            ALTER TABLE {table_name} DISABLE ROW LEVEL SECURITY;
        EXCEPTION WHEN undefined_table THEN NULL;
        END $$;
        """
    )

    # Revoke permissions
    op.execute(
        f"""
        DO $$
        BEGIN
            REVOKE ALL ON TABLE {table_name} FROM tenant_role;
            REVOKE ALL ON TABLE {table_name} FROM tenant_viewer_role;
        EXCEPTION WHEN undefined_table THEN NULL;
        END $$;
        """
    )


def remove_readonly_table_permissions(table_name: str) -> None:
    """Remove permissions for a table that doesn't have tenant_id.

    This function should be called in downgrade() before dropping the table.

    Args:
        table_name: Name of the table to remove permissions for
    """
    op.execute(
        f"""
        DO $$
        BEGIN
            REVOKE ALL ON TABLE {table_name} FROM tenant_role;
            REVOKE ALL ON TABLE {table_name} FROM tenant_viewer_role;
        EXCEPTION WHEN undefined_table THEN NULL;
        END $$;
        """
    )


def create_tenant_roles() -> None:
    """Create PostgreSQL roles for tenant database users with all necessary permissions.

    This should be called in the upgrade() function of migrations that need these roles.
    This creates the roles and sets up permissions for existing tables.
    For new tables, use add_tenant_table_permissions() instead.
    """
    # Create roles (NOLOGIN = group roles, not login roles)
    op.execute(
        "DO $$ BEGIN CREATE ROLE tenant_role NOLOGIN; EXCEPTION WHEN duplicate_object THEN null; END $$;"
    )
    op.execute(
        "DO $$ BEGIN CREATE ROLE tenant_viewer_role NOLOGIN; EXCEPTION WHEN duplicate_object THEN null; END $$;"
    )

    # Grant schema usage
    op.execute("GRANT USAGE ON SCHEMA public TO tenant_role")
    op.execute("GRANT USAGE ON SCHEMA public TO tenant_viewer_role")

    # Grant sequence usage
    op.execute("GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO tenant_role")
    op.execute("GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO tenant_viewer_role")

    # Set up permissions for existing tables (from initial migration)
    # For new tables, use add_tenant_table_permissions() in their migration
    add_tenant_table_permissions("popups")
    add_tenant_table_permissions("humans")
    add_readonly_table_permissions("tenants")


def drop_tenant_roles() -> None:
    """Drop PostgreSQL roles and revoke all permissions.

    This should be called in the downgrade() function of migrations.
    Note: Call this BEFORE dropping tables to avoid errors.
    """
    # Remove permissions for existing tables
    remove_tenant_table_permissions("humans")
    remove_tenant_table_permissions("popups")
    remove_readonly_table_permissions("tenants")

    # Revoke schema and sequence permissions
    op.execute("REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM tenant_viewer_role")
    op.execute("REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM tenant_role")
    op.execute("REVOKE USAGE ON SCHEMA public FROM tenant_viewer_role")
    op.execute("REVOKE USAGE ON SCHEMA public FROM tenant_role")

    # Drop roles
    op.execute("DROP ROLE IF EXISTS tenant_viewer_role")
    op.execute("DROP ROLE IF EXISTS tenant_role")
