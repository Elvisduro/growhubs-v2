import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

/** PLT-005 §3.2 (CORE-C1999) — the canonical failure vocabulary every
 * machine must be able to produce. */
export enum TransitionAttemptResult {
  SUCCESS = 'SUCCESS',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  AUTHORITY_FAILED = 'AUTHORITY_FAILED',
  PRECONDITION_FAILED = 'PRECONDITION_FAILED',
  VERSION_CONFLICT = 'VERSION_CONFLICT',
  DUPLICATE = 'DUPLICATE',
  APPROVAL_FAILED = 'APPROVAL_FAILED',
  EVIDENCE_FAILED = 'EVIDENCE_FAILED',
  POLICY_FAILED = 'POLICY_FAILED',
  KILL_SWITCH = 'KILL_SWITCH',
  DEPENDENCY_FAILED = 'DEPENDENCY_FAILED',
  PROVIDER_FAILED = 'PROVIDER_FAILED',
  TIMEOUT = 'TIMEOUT',
  EXTERNAL_UNKNOWN = 'EXTERNAL_UNKNOWN',
  PARTIAL = 'PARTIAL',
  COMPENSATION = 'COMPENSATION',
  MANUAL_REVIEW = 'MANUAL_REVIEW',
}

/**
 * PLT-005 §2.3 — TransitionAttempt: the IMMUTABLE audit record of every
 * attempted transition, successful or not (CORE-C1994). Nothing in this
 * codebase issues an UPDATE or DELETE against this table — see
 * StateMachineEngine, which is the only writer and exposes no update/delete
 * method.
 */
@Entity('transition_attempts')
@Index(['objectType', 'objectId', 'idempotencyKey'], { unique: true })
@Index(['objectType', 'objectId'])
export class TransitionAttempt {
  @PrimaryGeneratedColumn('uuid', { name: 'attempt_id' })
  attemptId: string;

  @Column({ name: 'object_type' })
  objectType: string;

  @Column({ name: 'object_id' })
  objectId: string;

  @Column({ name: 'transition_def_id', type: 'uuid' })
  transitionDefId: string;

  /** see StateMachineEngine §3.2 for optimistic-concurrency semantics. */
  @Column({ name: 'expected_version' })
  expectedVersion: number;

  @Column({ name: 'actor_ref' })
  actorRef: string;

  /** the AuthorityGrant (XD-007) this attempt was made under. */
  @Column({ name: 'authority_ref', nullable: true })
  authorityRef?: string;

  /** for tracing cross-domain journeys. */
  @Column({ name: 'correlation_id' })
  correlationId: string;

  @Column({ name: 'causation_id', nullable: true })
  causationId?: string;

  @Column({ name: 'idempotency_key' })
  idempotencyKey: string;

  @Column({ type: 'enum', enum: TransitionAttemptResult })
  result: TransitionAttemptResult;

  @Column({ name: 'attempted_at', type: 'timestamptz', default: () => 'now()' })
  attemptedAt: Date;
}
