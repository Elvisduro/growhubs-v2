# ADR-003: Shared State-Machine Substrate (not per-domain status columns)

**Status:** Accepted (2026-09-05) — implemented and running

## Context

PLT-005 (approved schema) requires that lifecycle state for the platform's
canonical families (Order, Payment, TorvetProjection, and 19 others) never
be modeled as a bare mutable status column with ad-hoc UPDATE statements —
this loses auditability, breaks under concurrent writes, and makes cross-
domain consistency (an event architecture, per ADR-006 forthcoming)
unreliable.

## Decision

One shared `StateMachineEngine`, used by every domain module, implementing:
- `StateMachineDefinition` / `TransitionDefinition` — versioned, declarative
  lifecycle definitions (CORE-C1994/C1995): State/Event/Transition/
  Projection kept as distinct concepts, never collapsed.
- `TransitionAttempt` — an immutable audit row for every attempted
  transition, success or failure (CORE-C1994); nothing in the codebase
  issues UPDATE/DELETE against this table.
- Optimistic concurrency (`expectedVersion` vs. persisted version ->
  `VERSION_CONFLICT`) and idempotency-key replay safety (CORE-C1997/C1998),
  atomically committed inside one transaction.
- The full 17-outcome canonical failure vocabulary (CORE-C1999) — not just
  success/generic-error.
- `StateMachineObjectState` — an **engineering addition, not itself a cited
  clause** (PLT-005 §13 leaves the concrete state/version storage location
  open): a generic `(objectType, objectId) -> (state, version)` tracker, so
  the engine is testable standalone before any domain module's own tables
  exist. A domain module may instead maintain its own state/version columns
  and pass them as `expectedVersion` — both are valid against PLT-005;
  this scaffold uses the shared table.

No domain module is permitted to reimplement transition/version/audit logic
itself, or to call another domain's service directly to mutate its state
(CORE-C2000 domain ownership) — all mutation goes through
`StateMachineEngine.attemptTransition()`.

## Alternatives considered

- **Per-domain status enum + updated_at**: rejected — this is precisely
  what PLT-005 was written to prevent; no audit trail, no concurrency
  contract, no shared failure vocabulary.
- **Event-sourcing the entire object, not just transitions**: deferred, not
  rejected outright — full event-sourcing (rebuilding state by replaying
  all events) is a heavier commitment than PLT-005 requires; the current
  design already gets the audit-trail benefit via `TransitionAttempt`
  without requiring every domain to replay history to read current state.
  Revisit if a specific domain's compliance/replay requirements demand it.

## Consequences

- Guard evaluation is currently structural only (fromState/version/approval
  checks) — the per-transition `guards` JSON field is not yet evaluated by
  a pluggable guard-evaluator pipeline; this is a known follow-up
  implementation task, not a governance gap.
- Every domain agent implementing a new lifecycle family authors
  `StateMachineDefinition`/`TransitionDefinition` rows and calls
  `attemptTransition` — it does not invent its own transition logic.

## Migration implications

V1 has no equivalent shared substrate — V1 lifecycle fields migrate into
an initial `StateMachineObjectState` row per object, backfilled from V1's
status columns during data migration; the machine/transition definitions
themselves are new, not migrated.
