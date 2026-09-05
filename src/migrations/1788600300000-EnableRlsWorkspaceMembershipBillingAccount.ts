import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * PF-011 §4 (PF-C0509/PF-C0510) follow-up — the two tables explicitly
 * deferred by `EnableRlsTenantIsolation` (1788575000000) as "not an
 * oversight," because each needed a policy shape beyond a flat
 * `tenant_id = current_setting(...)` equality check:
 *
 *   - workspace_memberships: carries no direct tenant_id column — only
 *     workspace_id, which points at workspaces.tenant_id. Policy below
 *     joins through that FK via a subquery: a row is visible/writable iff
 *     its workspace belongs to the current tenant context.
 *   - billing_accounts: funds_tenant_ids is an ARRAY (one billing account
 *     can fund multiple tenants — PF-C0504) — the opposite cardinality
 *     from a scoping column. Policy below uses `= ANY(funds_tenant_ids)`
 *     instead of equality: a row is visible/writable iff the current
 *     tenant context appears anywhere in its funding array.
 *
 * Same FORCE-RLS belt-and-braces posture as the base migration: the app's
 * runtime DB role must not be a superuser/table-owner or these policies
 * are silently inert (that role provisioning remains an infra/deploy-
 * config task, not something a migration can enforce).
 */
export class EnableRlsWorkspaceMembershipBillingAccount1788600300000
  implements MigrationInterface
{
  name = 'EnableRlsWorkspaceMembershipBillingAccount1788600300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "workspace_memberships" ENABLE ROW LEVEL SECURITY`,
    );
    await queryRunner.query(
      `ALTER TABLE "workspace_memberships" FORCE ROW LEVEL SECURITY`,
    );
    await queryRunner.query(`
      CREATE POLICY tenant_isolation_workspace_memberships
      ON "workspace_memberships"
      USING (
        workspace_id IN (
          SELECT workspace_id FROM "workspaces"
          WHERE tenant_id = current_setting('app.current_tenant_id', true)::uuid
        )
      )
      WITH CHECK (
        workspace_id IN (
          SELECT workspace_id FROM "workspaces"
          WHERE tenant_id = current_setting('app.current_tenant_id', true)::uuid
        )
      )
    `);

    await queryRunner.query(
      `ALTER TABLE "billing_accounts" ENABLE ROW LEVEL SECURITY`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_accounts" FORCE ROW LEVEL SECURITY`,
    );
    await queryRunner.query(`
      CREATE POLICY tenant_isolation_billing_accounts
      ON "billing_accounts"
      USING (
        current_setting('app.current_tenant_id', true)::uuid = ANY(funds_tenant_ids)
      )
      WITH CHECK (
        current_setting('app.current_tenant_id', true)::uuid = ANY(funds_tenant_ids)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP POLICY IF EXISTS tenant_isolation_billing_accounts ON "billing_accounts"`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_accounts" NO FORCE ROW LEVEL SECURITY`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_accounts" DISABLE ROW LEVEL SECURITY`,
    );

    await queryRunner.query(
      `DROP POLICY IF EXISTS tenant_isolation_workspace_memberships ON "workspace_memberships"`,
    );
    await queryRunner.query(
      `ALTER TABLE "workspace_memberships" NO FORCE ROW LEVEL SECURITY`,
    );
    await queryRunner.query(
      `ALTER TABLE "workspace_memberships" DISABLE ROW LEVEL SECURITY`,
    );
  }
}
