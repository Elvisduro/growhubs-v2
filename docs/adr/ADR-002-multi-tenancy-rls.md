# ADR-002: Multi-Tenancy via PostgreSQL Row-Level Security

**Status:** Accepted (2026-09-05) — partially implemented

## Context

PF-011 §4 (PF-C0509/PF-C0510) requires tenant isolation to be enforced as a
database-layer control, not merely an application-layer WHERE clause, so a
forgotten filter in application code cannot leak rows across tenants. V2
must also, eventually, support enterprise tenants that may need dedicated
databases or regional deployments (data residency) — so the initial design
must not foreclose that path.

## Decision

Single shared PostgreSQL database (operational simplicity for the current
stage) with **Row-Level Security (RLS)**, forced (`FORCE ROW LEVEL SECURITY`,
so even the table owner cannot bypass it by accident), keyed on a per-
transaction session variable `app.current_tenant_id`, set via
`TenantContextService.setTenantContext(queryRunner, tenantId)` — every
request-scoped unit of work must call this before issuing tenant-scoped
queries, on the SAME QueryRunner/transaction.

Currently implemented (migration `EnableRlsTenantIsolation1788575000000`,
verified against a real dev database) on the 5 tables carrying a direct
`tenant_id` column: `tenants`, `workspaces`, `tenant_memberships`,
`role_assignments`, `brand_bindings`.

**Explicitly NOT yet covered** (tracked as follow-up, not a silent gap):
- `workspace_memberships` — only indirectly tenant-scoped, via
  `workspace_id -> workspaces.tenant_id`; needs a subquery/join-based policy.
- `billing_accounts` — `funds_tenant_ids` is an array (one billing account
  can fund multiple tenants), the opposite cardinality from a scoping
  column; needs an `= ANY()`-based policy.

## Alternatives considered

- **Schema-per-tenant**: rejected for the initial stage — operational
  overhead (migrations must run N times) outweighs the isolation benefit at
  current scale; RLS gives equivalent leak-prevention guarantees today.
- **Database-per-tenant from day one**: rejected as premature — reserved as
  the escape hatch for a specific enterprise tenant needing residency or
  extreme isolation, without redesigning the whole system; RLS + a single
  DB is the default, database-per-tenant is an explicit exception path.
- **Application-layer filtering only** (no RLS): rejected — this is exactly
  the "forgotten WHERE clause leaks data" failure mode PF-011 §4 requires
  the architecture to make structurally impossible.

## Consequences

- The application's runtime DB role must NOT be a superuser and must NOT
  own these tables, or RLS is silently inert — this is an infra/deploy-
  config requirement, tracked separately, not yet provisioned in this
  scaffold (current dev setup uses the `postgres` superuser role, which
  DOES bypass RLS — acceptable for local dev, unacceptable for any shared/
  staging/production environment).
- Tenant context must propagate through every code path that touches a
  tenant-scoped table: HTTP request handlers, background jobs, event
  handlers, and AI agent tool calls all need to call
  `setTenantContext` before their first query — this is a discipline every
  domain agent must follow, not just an identity-access concern.

## Migration implications

None yet (no V1 data migrated into these tables).
