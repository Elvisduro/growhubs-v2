import { Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';

/**
 * PF-011 §4 (PF-C0509/PF-C0510) — every request-scoped unit of work that
 * touches a tenant-scoped table MUST call setTenantContext() on the SAME
 * QueryRunner/transaction it then issues its queries on, before issuing
 * them. This is the application-side half of the enforcement mechanism;
 * the database-side half is the RLS policies created by migration
 * EnableRlsTenantIsolation1788575000000 (ON tenants, workspaces,
 * tenant_memberships, role_assignments, brand_bindings), which key on the
 * exact same session variable this service sets. Together they mean a
 * forgotten WHERE clause in application code still cannot leak rows across
 * tenants — the database itself refuses to return or write them.
 *
 * (Previously implemented as a PrismaService.setTenantContext() method
 * against Prisma's $executeRaw; rewritten here against TypeORM's
 * QueryRunner after the Prisma -> TypeORM pivot — see package.json /
 * data-source.ts history. Logic is unchanged: set_config(..., true) scopes
 * the setting to the current transaction only, is_local semantics, and the
 * value is passed as a bound parameter, never string-interpolated into
 * SQL.)
 */
@Injectable()
export class TenantContextService {
  async setTenantContext(queryRunner: QueryRunner, tenantId: string): Promise<void> {
    await queryRunner.query(`SELECT set_config('app.current_tenant_id', $1, true)`, [tenantId]);
  }
}
