# ADR-004: TypeORM instead of Prisma

**Status:** Accepted (2026-09-05) — infra substitution, not a scope change

## Context

Prisma was the initial ORM choice for the NestJS backend. Prisma's query
engine ships as a native binary fetched from `binaries.prisma.sh` at
`prisma generate` time.

## Decision

Use TypeORM instead. TypeORM is pure npm + the `pg` driver — no external
binary fetch is required at install or generate time.

## Why

`npx prisma generate` failed with HTTP 403 fetching the engine binary from
`binaries.prisma.sh`, confirmed via direct `curl -sI` against the same URL
(403), while `registry.npmjs.org` returned 200 for the same environment —
this sandbox/environment's network egress policy blocks Prisma's binary CDN
specifically. This is an infrastructure constraint of the current build
environment, discovered empirically, not a general judgment that Prisma is
inferior to TypeORM as a technology.

## Alternatives considered

- **Retry Prisma with `PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1`**: tried,
  still 403 on the actual engine fetch — does not bypass a network-level
  block.
- **Self-host/vendor the Prisma engine binaries**: possible in principle,
  but adds a private-artifact-hosting dependency for zero functional gain
  over simply using an ORM with no binary dependency.
- **Drizzle ORM**: not evaluated in depth — TypeORM's decorator-based entity
  style was a closer match to the already-authored entity definitions with
  clause-citation comments, minimizing rewrite risk under time pressure.
  Worth a fresh look if TypeORM's migration-generation or relation handling
  proves inadequate as the schema grows.

## Consequences

- All 17 entities were rewritten as TypeORM decorated classes; field-level
  clause citations (PF-011/PLT-005 clause IDs in comments) were preserved
  exactly.
- `synchronize: false` is set explicitly and permanently — every schema
  change goes through a reviewed migration, never TypeORM's auto-sync.
- If this environment's network policy changes, or the target deploy
  environment has unrestricted egress, Prisma remains a valid option for a
  future ADR to reconsider — this decision is environment-driven, not final
  for all time.

## Migration implications

None (pre-launch scaffold; no data migrated under Prisma).
