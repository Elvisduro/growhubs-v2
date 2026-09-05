import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { ReversibilityClass } from './action-capability.entity';

/**
 * XD-007 §2.4 (XD-C0538) — the exact lifecycle: 9 main-flow states plus 11
 * named branch states, all spelled out in the approved schema text.
 * REVALIDATING (XD-C0539) is where ARIA must re-check grant validity,
 * principal/role, consent, source version/state, terms/price, budget, Kill
 * Switch status, jurisdiction/provider status, conflicts, and expiry
 * immediately before execution — a grant checked once at proposal time is
 * not trusted at execution time.
 */
export enum ARIAActionRequestState {
  PROPOSED = 'PROPOSED',
  POLICY_CHECK = 'POLICY_CHECK',
  AWAITING_APPROVAL = 'AWAITING_APPROVAL',
  APPROVED = 'APPROVED',
  REVALIDATING = 'REVALIDATING',
  EXECUTING = 'EXECUTING',
  SUCCEEDED = 'SUCCEEDED',
  OUTCOME_MONITORING = 'OUTCOME_MONITORING',
  CLOSED = 'CLOSED',
  DENIED = 'DENIED',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED',
  KILL_SWITCH_HALTED = 'KILL_SWITCH_HALTED',
  EVIDENCE_INSUFFICIENT = 'EVIDENCE_INSUFFICIENT',
  SCOPE_EXCEEDED = 'SCOPE_EXCEEDED',
  FAILED = 'FAILED',
  PARTIALLY_EXECUTED = 'PARTIALLY_EXECUTED',
  EXTERNAL_OUTCOME_UNKNOWN = 'EXTERNAL_OUTCOME_UNKNOWN',
  COMPENSATION_IN_PROGRESS = 'COMPENSATION_IN_PROGRESS',
  CORRECTED = 'CORRECTED',
}

/**
 * XD-007 §2.4 — ARIAActionRequest: every proposed execution is one of these
 * rows — the full audit trail of what ARIA wanted to do, why, and what
 * happened (XD-C0537). Revocation of the underlying AuthorityGrant must
 * stop future work but never erase history (XD-007 §3, XD-C0541) — rows
 * here are never deleted, only progressed through the state machine above
 * (consistent with PLT-005's TransitionAttempt immutability discipline —
 * this table is the XD-007-specific analogue; a domain wiring ARIA actions
 * through PLT-005's shared StateMachineEngine would use object_type =
 * "ARIAActionRequest" there, with this table holding the ARIA-specific
 * payload fields the generic engine does not model).
 */
@Entity('aria_action_requests')
@Index(['capabilityId'])
@Index(['grantId'])
export class ARIAActionRequest {
  @PrimaryGeneratedColumn('uuid', { name: 'request_id' })
  requestId: string;

  /** human or automated trigger */
  @Column({ type: 'jsonb' })
  initiator: Record<string, unknown>;

  @Column({ name: 'use_case' })
  useCase: string;

  @Column({ name: 'capability_id', type: 'uuid' })
  capabilityId: string;

  @Column({ name: 'grant_id', type: 'uuid', nullable: true })
  grantId?: string;

  @Column({ type: 'jsonb' })
  target: Record<string, unknown>;

  @Column({ type: 'jsonb' })
  change: Record<string, unknown>;

  @Column({ type: 'jsonb', default: {} })
  sources: Record<string, unknown>;

  @Column({ type: 'jsonb', default: {} })
  uncertainty: Record<string, unknown>;

  @Column({ name: 'side_effects', type: 'jsonb', default: {} })
  sideEffects: Record<string, unknown>;

  @Column({ name: 'affected_people', type: 'jsonb', default: {} })
  affectedPeople: Record<string, unknown>;

  @Column({ name: 'reversibility_class', type: 'enum', enum: ReversibilityClass })
  reversibilityClass: ReversibilityClass;

  @Column({ name: 'compensation_plan', type: 'jsonb', nullable: true })
  compensationPlan?: Record<string, unknown>;

  @Column({ type: 'jsonb', default: {} })
  cost: Record<string, unknown>;

  @Column({ type: 'jsonb', default: [] })
  approvals: Record<string, unknown>[];

  @Column({ name: 'idempotency_key' })
  idempotencyKey: string;

  @Column({
    name: 'execution_state',
    type: 'enum',
    enum: ARIAActionRequestState,
    default: ARIAActionRequestState.PROPOSED,
  })
  executionState: ARIAActionRequestState;

  @Column({ type: 'jsonb', nullable: true })
  outcome?: Record<string, unknown>;
}
