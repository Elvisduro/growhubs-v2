import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { AccessCapability } from './access-capability.enum';

/** XD-008 §2.4 — the exact 6 possible resolution outcomes. */
export enum AccessDecisionResult {
  ALLOW = 'ALLOW',
  DENY = 'DENY',
  CONDITIONAL = 'CONDITIONAL',
  STEP_UP_REQUIRED = 'STEP_UP_REQUIRED',
  APPROVAL_REQUIRED = 'APPROVAL_REQUIRED',
  TEMPORARILY_UNAVAILABLE = 'TEMPORARILY_UNAVAILABLE',
}

/**
 * XD-008 §2.4 (XD-C0585) — AccessDecision: the versioned, CACHED output of
 * resolving a request — never recomputed silently in an inconsistent way
 * across the platform. Holds the full Subject x Capability x Resource x
 * Context x Time tuple (§1, XD-C0583) plus policyVersionsUsed, which is
 * what makes cache invalidation correct (§7, XD-C0622/XD-C0623): a cache
 * entry is only valid for the exact version tuple that produced it, and
 * critical changes (revocation, payment status, safety action) must
 * invalidate it promptly.
 */
@Entity('access_decisions')
@Index(['subjectPersonId', 'capability'])
export class AccessDecision {
  @PrimaryGeneratedColumn('uuid', { name: 'decision_id' })
  decisionId: string;

  @Column({ name: 'subject_person_id', type: 'uuid' })
  subjectPersonId: string;

  @Column({ type: 'enum', enum: AccessCapability })
  capability: AccessCapability;

  @Column({ name: 'resource_ref', type: 'jsonb' })
  resourceRef: Record<string, unknown>;

  @Column({ type: 'jsonb', default: {} })
  context: Record<string, unknown>;

  @Column({ name: 'evaluated_at', type: 'timestamptz', default: () => 'now()' })
  evaluatedAt: Date;

  @Column({ type: 'enum', enum: AccessDecisionResult })
  result: AccessDecisionResult;

  /** drives the "Why Access?" surface (XD-008 §8) — not exhaustively
   * enumerated in the approved text, so stored as a plain ref/string
   * rather than an invented closed enum. */
  @Column({ name: 'reason_code' })
  reasonCode: string;

  /** for cache-invalidation correctness (XD-008 §7) */
  @Column({ name: 'policy_versions_used', type: 'jsonb' })
  policyVersionsUsed: Record<string, unknown>;
}
