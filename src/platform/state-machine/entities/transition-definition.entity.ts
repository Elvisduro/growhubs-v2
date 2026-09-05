import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * PLT-005 §2.2 — TransitionDefinition: one legal move within a
 * StateMachineDefinition version.
 */
@Entity('transition_definitions')
export class TransitionDefinition {
  @PrimaryGeneratedColumn('uuid', { name: 'transition_def_id' })
  transitionDefId: string;

  @Column({ name: 'machine_id', type: 'uuid' })
  machineId: string;

  @Column({ name: 'from_state' })
  fromState: string;

  @Column({ name: 'to_state' })
  toState: string;

  /** precondition checks. */
  @Column({ type: 'jsonb', default: {} })
  guards: Record<string, unknown>;

  @Column({ name: 'evidence_requirements', type: 'jsonb', default: {} })
  evidenceRequirements: Record<string, unknown>;

  /** -> ApprovalPolicy (XD-007) when required. */
  @Column({ name: 'approval_policy_ref', type: 'uuid', nullable: true })
  approvalPolicyRef?: string;

  @Column({ name: 'timers_events', type: 'jsonb', default: {} })
  timersEvents: Record<string, unknown>;

  /** financial/access/retention effects declared explicitly. */
  @Column({ name: 'side_effects', type: 'jsonb', default: {} })
  sideEffects: Record<string, unknown>;

  @Column({ name: 'idempotency_policy', type: 'jsonb', default: {} })
  idempotencyPolicy: Record<string, unknown>;

  @Column({ name: 'timeout_retry_compensation', type: 'jsonb', default: {} })
  timeoutRetryCompensation: Record<string, unknown>;
}
