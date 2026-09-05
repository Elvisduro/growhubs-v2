import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * First-cut DB-level segregation mechanism for `child_safety_cases`, per
 * CM-011 / `20_ModerationCase.md` — see the extensive scope-boundary doc
 * comment on ChildSafetyCase (child-safety-case.entity.ts) for the full
 * rationale and explicit limitations.
 *
 * Mirrors the tenant-isolation RLS pattern established in ADR-002 and
 * `EnableRlsTenantIsolation` — same mechanics (ENABLE + FORCE ROW LEVEL
 * SECURITY, a policy gated on a `current_setting(...)` session variable) —
 * but here the axis being segregated is FUNCTION/ROLE, not tenant. The new
 * session variable is `app.is_restricted_child_safety_specialist`
 * (boolean, as text — 'true'/'false'), set ONLY by application code that
 * has independently verified the current actor holds the "Restricted
 * Child Safety Specialist" function for the specific case being accessed.
 * This migration does NOT implement that verification; it only makes the
 * database refuse to return rows to any session that has not had the flag
 * explicitly set to 'true'. Default-deny: an unset session variable
 * (`current_setting(..., true)` returning NULL) evaluates false, so a
 * connection that never calls the app's specialist-context setter sees
 * zero rows, INCLUDING the `postgres` superuser role in production once a
 * non-superuser runtime role is provisioned (see the standing note in
 * ADR-002 that RLS does not apply to superusers or table owners — dev
 * currently runs as `postgres`, which BYPASSES this policy entirely; this
 * is the same known gap flagged for tenant RLS, now doubly important
 * here).
 *
 * NOT covered by this migration (explicitly flagged, follow-up work):
 * - case-bound / time-boxed grants (this policy is all-or-nothing for the
 *   whole table, not scoped to specific case_id rows a specialist has an
 *   active grant for)
 * - two-person control for the most sensitive transitions
 * - a durable, queryable access-audit trail (specialist_access_grants on
 *   the entity is a first-cut in-row log only, not an audit store)
 * - preventing local copies/exports of retrieved rows
 * - provisioning a non-superuser runtime DB role (see ADR-002 note above)
 */
export class EnableRlsChildSafetySpecialistAccess1788596500000
  implements MigrationInterface
{
  name = 'EnableRlsChildSafetySpecialistAccess1788596500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "child_safety_cases" ENABLE ROW LEVEL SECURITY`,
    );
    await queryRunner.query(
      `ALTER TABLE "child_safety_cases" FORCE ROW LEVEL SECURITY`,
    );
    await queryRunner.query(`
      CREATE POLICY "restricted_child_safety_specialist_only"
      ON "child_safety_cases"
      USING (current_setting('app.is_restricted_child_safety_specialist', true)::boolean IS TRUE)
      WITH CHECK (current_setting('app.is_restricted_child_safety_specialist', true)::boolean IS TRUE)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP POLICY "restricted_child_safety_specialist_only" ON "child_safety_cases"`,
    );
    await queryRunner.query(
      `ALTER TABLE "child_safety_cases" NO FORCE ROW LEVEL SECURITY`,
    );
    await queryRunner.query(
      `ALTER TABLE "child_safety_cases" DISABLE ROW LEVEL SECURITY`,
    );
  }
}
