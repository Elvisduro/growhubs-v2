# ADR-001: Technology Stack

**Status:** Accepted (2026-09-05)

## Context

GrowHubs V1 runs on Laravel 10 / PHP 8.1 / MySQL (confirmed by reading the
actual V1 source: composer.json, config/database.php, .env.testing). V2 must
support, over a 10+ year horizon: multi-tenant SaaS, white-label with
customer-owned domains, a blueprint-driven builder ecosystem, an AI agent
layer (ARIA + specialist agents), and native clients on iOS/Android/Windows/
macOS in addition to web.

The user explicitly instructed: do not anchor the V2 stack choice on V1's
stack merely for continuity — choose the stack that best serves the actual
10-year requirement, using V1 only as a source of business logic and
migration constraints, not as an architectural default.

## Decision

TypeScript end-to-end:
- Backend: NestJS (modular monolith — see ADR-003 for why not microservices
  yet).
- Web: Next.js.
- Mobile: React Native / Expo.
- Desktop: Tauri + React.
- Database: PostgreSQL (see ADR-002 for multi-tenancy approach).
- Python is reserved for exactly one place: the ARIA/agent-runtime service,
  where the Python AI/ML ecosystem has a real, non-fashion advantage.

## Alternatives considered

- **Continue Laravel/PHP/MySQL** (V1 continuity): rejected per explicit user
  direction not to anchor on V1, and because a single TypeScript type system
  spanning backend, web, mobile and desktop removes an entire class of
  contract-drift bugs across four client platforms — a bigger win at V2's
  scale than PHP's operational familiarity.
- **Polyglot per-domain** (e.g. Go for high-throughput domains): rejected for
  now — no domain has yet demonstrated a throughput requirement PHP/Node
  cannot meet; introducing a second backend language multiplies the agent
  team's cognitive load for no proven benefit. Revisit only if a specific
  domain's real load profile demands it.

## Consequences

- One shared type layer (API/event/blueprint schemas) can be authored once
  and consumed natively by every client — this is what makes the "Lead
  Architect agent owns shared contracts" agent-team model workable.
- Every new coding agent onboarded to a domain only needs one language's
  idioms, not a per-domain language switch.
- Python's isolation to the ARIA service is a boundary that must be actively
  maintained — a domain agent reaching for Python "because it's better for
  X" is a violation of this ADR unless a new ADR supersedes this one.

## Migration implications

V1 data migrates via explicit migration/adaptor scripts (see forthcoming
V1_MIGRATION_STRATEGY doc) — no shared runtime or shared database with V1;
V1's Laravel/MySQL stack is read as a data and business-rule source only.
