import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * PLT-003 / `22_KillSwitch.md` — the activation lifecycle's 8 linear
 * states plus 5 named branches (13 total), exactly as given in the doc's
 * state table. Initial: DRAFT. Terminal: CLOSED (CANCELLED is also
 * terminal, per the doc's Y marking).
 */
export enum KillSwitchActivationState {
  DRAFT = 'DRAFT',
  ARMED = 'ARMED',
  ACTIVE = 'ACTIVE',
  STABILISING = 'STABILISING',
  RECOVERY_READY = 'RECOVERY_READY',
  RESTORING = 'RESTORING',
  MONITORING = 'MONITORING',
  CLOSED = 'CLOSED',
  FAILED = 'FAILED',
  PARTIAL = 'PARTIAL',
  SCOPE_CHANGE = 'SCOPE_CHANGE',
  RESTORE_FAILURE = 'RESTORE_FAILURE',
  CANCELLED = 'CANCELLED',
}

/** the 7 named in-flight-action classification outcomes — binding
 * sub-contract at ACTIVE; every in-flight action must reach one of these,
 * never left ambiguous, and MONITORING -> CLOSED requires all of them to
 * have reached a terminal classification ("never closed from silence"). */
export enum InFlightActionClassification {
  COMPLETED_BEFORE_SWITCH = 'COMPLETED_BEFORE_SWITCH',
  CANCELLED_SAFELY = 'CANCELLED_SAFELY',
  PAUSED_RESUMABLE = 'PAUSED_RESUMABLE',
  QUARANTINED_FOR_REVIEW = 'QUARANTINED_FOR_REVIEW',
  EXTERNAL_STATUS_UNKNOWN = 'EXTERNAL_STATUS_UNKNOWN',
  COMPENSATION_REQUIRED = 'COMPENSATION_REQUIRED',
  MANUAL_RECOVERY_REQUIRED = 'MANUAL_RECOVERY_REQUIRED',
}

/**
 * PLT-003 — KillSwitchActivation: one incident-scoped firing of a
 * KillSwitchDefinition. Registered as a PLT-005 canonical lifecycle
 * family; uses this codebase's established domain-owned state/version-
 * column pattern (state + stateVersion), same as every other family
 * (ModerationCase, FRM-001's Submission, CL-012's Enrollment, TV-012's
 * TorvetProjection).
 *
 * `inFlightActions` holds the classification counts/detail required at
 * ACTIVE (§"In-flight action classification") — engineering synthesis for
 * the exact storage shape (jsonb array of {actionRef, classification,
 * idempotencyKey, ...}), since no literal column list is given; the seven
 * classification VALUES themselves are given verbatim in the source doc
 * and are captured in the enum above, not invented.
 *
 * `approvalRef`/`secondReviewRef` capture the K3 two-person / K4
 * incident-commander-plus-review authority requirement — actual approval-
 * chain storage reuses XD-007's Approval entity from the PLT-005
 * substrate (referenced by id here, not duplicated).
 */
@Entity('kill_switch_activations')
export class KillSwitchActivation {
  @PrimaryGeneratedColumn('uuid', { name: 'activation_id' })
  activationId: string;

  @Column({ name: 'definition_id', type: 'uuid' })
  definitionId: string;

  /** the definition's version at the moment of activation — this
   * machine's own idempotency/concurrency notes require every activation
   * to reference a specific pinned version, not "whatever the definition
   * currently is." */
  @Column({ name: 'definition_version' })
  definitionVersion: number;

  @Column({
    type: 'enum',
    enum: KillSwitchActivationState,
    default: KillSwitchActivationState.DRAFT,
  })
  state: KillSwitchActivationState;

  @Column({ name: 'state_version', default: 0 })
  stateVersion: number;

  /** incident this activation is linked to — polymorphic reference,
   * engineering synthesis (no dedicated Incident entity exists yet in
   * this codebase). */
  @Column({ name: 'incident_ref', type: 'jsonb', nullable: true })
  incidentRef?: Record<string, unknown>;

  /** blast-radius scope at the CURRENT stage — mutated by SCOPE_CHANGE,
   * always the minimum effective radius per the doc's authority-rule
   * transition guard. */
  @Column({ name: 'blast_radius_scope', type: 'jsonb' })
  blastRadiusScope: Record<string, unknown>;

  @Column({ name: 'approval_ref', type: 'uuid', nullable: true })
  approvalRef?: string;

  /** K3/K4's required second-person review record — separate from the
   * primary approval since the doc distinguishes "two-person approval"
   * (K3) / "incident-commander... with prompt second-person review
   * queued" (K4) as its own audit requirement. */
  @Column({ name: 'second_review_ref', type: 'uuid', nullable: true })
  secondReviewRef?: string;

  /** classification detail for every action mid-flight when this switch
   * activated — see class doc comment. */
  @Column({ name: 'in_flight_actions', type: 'jsonb', default: [] })
  inFlightActions: Record<string, unknown>[];

  /** idempotency key for the activation command itself, per the doc's
   * "duplicate activation trigger... deduplicated into one activation
   * object" rule. */
  @Column({ name: 'idempotency_key', unique: true })
  idempotencyKey: string;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;

  @Column({ name: 'closed_at', type: 'timestamptz', nullable: true })
  closedAt?: Date;
}
