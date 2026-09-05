import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * PF-011 §4 (PF-C0509/PF-C0510) — tenant isolation must be enforced as a
 * DATABASE-layer control, not merely an application-layer WHERE clause, so
 * that a forgotten filter in application code cannot leak rows across
 * tenants. This migration turns on PostgreSQL Row-Level Security on every
 * table in the current schema that carries a direct `tenant_id` column, and
 * adds a single permissive policy on each keyed on the session variable
 * `app.current_tenant_id` (set per-transaction by PrismaService /
 * TypeOrmTenantContextService's setTenantContext(), via
 * set_config('app.current_tenant_id', $1, true)).
 *
 * SCOPE — tables enabled here, and why:
 *   - tenants               : tenant_id is this table's own PK; a row is
 *                             "in" a tenant iff its tenant_id matches.
 *   - workspaces             : direct tenant_id column (PF-011 §2.6).
 *   - tenant_memberships     : direct tenant_id column (PF-011 §2.7).
 *   - role_assignments       : direct tenant_id column (PF-011 §2.7).
 *   - brand_bindings         : direct tenant_id column (PF-011 §2.9).
 *
 * NOT in scope here (deliberately, not an oversight):
 *   - workspace_memberships  : scoped only indirectly, via workspace_id ->
 *                              workspaces.tenant_id. A correct policy needs
 *                              a subquery/join against workspaces, which is
 *                              a follow-up migration, not a silent gap —
 *                              application code must still filter this
 *                              table by workspace membership until that
 *                              lands.
 *   - organizations          : primary_tenant_id is a nullable, unique
 *                              back-reference (an org may predate/outlive
 *                              any single tenant), not a row-scoping
 *                              column — PF-011 does not model Organization
 *                              as tenant-owned data.
 *   - billing_accounts       : funds_tenant_ids is an array (one billing
 *                              account can fund multiple tenants) — the
 *                              opposite cardinality from a scoping column,
 *                              needs an ANY()-based policy as a follow-up.
 *   - accounts/people        : identity tables are not themselves
 *                              tenant-scoped in PF-011 (a Person can hold
 *                              memberships across many tenants).
 *   - PLT-005 substrate      : state_machine_definitions,
 *                              transition_definitions, transition_attempts,
 *                              approvals, transition_repair_queue,
 *                              state_machine_object_state carry no
 *                              tenant_id column at all in this schema —
 *                              tenant scoping for these, where needed, is
 *                              carried by whatever domain object_type/
 *                              object_id they reference, not by RLS on
 *                              these tables themselves.
 *
 * A superuser/table-owner connection (e.g. the `postgres` role used by
 * migrations and by any trusted background job) BYPASSES RLS by default in
 * PostgreSQL. The application's runtime DB role must NOT be a superuser and
 * must NOT own these tables, or these policies are silently inert — that
 * role provisioning is an infra/deploy-config task, tracked separately from
 * this migration, which only creates the policies themselves.
 */
const TENANT_SCOPED_TABLES = [
  'tenants',
  'workspaces',
  'tenant_memberships',
  'role_assignments',
  'brand_bindings',
];

export class EnableRlsTenantIsolation1788575000000 implements MigrationInterface {
  name = 'EnableRlsTenantIsolation1788575000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const table of TENANT_SCOPED_TABLES) {
      await queryRunner.query(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY`);
      // FORCE so even the table owner is subject to the policy unless it
      // explicitly connects as a role with BYPASSRLS — belt-and-braces
      // alongside the deploy-time requirement that the app role not be
      // a superuser/owner.
      await queryRunner.query(`ALTER TABLE "${table}" FORCE ROW LEVEL SECURITY`);
      await queryRunner.query(`
        CREATE POLICY tenant_isolation_${table}
        ON "${table}"
        USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid)
        WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true)::uuid)
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const table of TENANT_SCOPED_TABLES.slice().reverse()) {
      await queryRunner.query(`DROP POLICY IF EXISTS tenant_isolation_${table} ON "${table}"`);
      await queryRunner.query(`ALTER TABLE "${table}" NO FORCE ROW LEVEL SECURITY`);
      await queryRunner.query(`ALTER TABLE "${table}" DISABLE ROW LEVEL SECURITY`);
    }
  }
}
