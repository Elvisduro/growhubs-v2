/**
 * PLT-005 §3.2 (CORE-C1999) — the canonical failure vocabulary every machine
 * must be able to produce. An implementation that only distinguishes
 * "success" and "generic error" is not compliant with the approved decision.
 * This mirrors the TypeORM TransitionAttemptResult enum
 * (entities/transition-attempt.entity.ts) exactly — kept as a separate TS
 * type so application code never has to import the ORM's generated enum
 * just to reason about outcomes.
 */
export type TransitionOutcome =
  | 'SUCCESS'
  | 'VALIDATION_FAILED'
  | 'AUTHORITY_FAILED'
  | 'PRECONDITION_FAILED'
  | 'VERSION_CONFLICT'
  | 'DUPLICATE'
  | 'APPROVAL_FAILED'
  | 'EVIDENCE_FAILED'
  | 'POLICY_FAILED'
  | 'KILL_SWITCH'
  | 'DEPENDENCY_FAILED'
  | 'PROVIDER_FAILED'
  | 'TIMEOUT'
  | 'EXTERNAL_UNKNOWN'
  | 'PARTIAL'
  | 'COMPENSATION'
  | 'MANUAL_REVIEW';

/**
 * PLT-005 §3.2 (CORE-C1997) — every command carries an expected version,
 * an idempotency key, actor/authority identification, and
 * correlation/causation identifiers.
 */
export interface TransitionCommand {
  objectType: string;
  objectId: string;
  transitionDefId: string;
  /** The version the caller believes the object is currently at. A mismatch
   * against the persisted version yields VERSION_CONFLICT (CORE-C1998) —
   * this field is what makes optimistic concurrency possible. */
  expectedVersion: number;
  actorRef: string;
  authorityRef?: string;
  idempotencyKey: string;
  correlationId: string;
  causationId?: string;
  /** The guard/precondition check the caller has already evaluated — the
   * engine re-validates rather than trusting the caller blindly, but this
   * lets the caller short-circuit obviously-invalid commands before they
   * even reach the engine. */
  guardContext?: Record<string, unknown>;
}

export interface TransitionResult {
  outcome: TransitionOutcome;
  attemptId: string;
  /** The new version after a SUCCESS, or the current persisted version after
   * a VERSION_CONFLICT (so the caller can re-fetch and retry with the right
   * expectedVersion, per PLT-005 §3.2's "forces re-evaluation" requirement). */
  currentVersion?: number;
}
