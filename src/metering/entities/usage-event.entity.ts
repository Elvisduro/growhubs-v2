import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

/** `CORE-C1956` (PLT-006, GOV-002 EXECUTED, `MASTER_SPEC.md:980`) — the
 * 6 linear lifecycle states plus 7 named branches given verbatim: "the
 * UsageEvent lifecycle is ESTIMATED → RESERVED → STARTED → MEASURED →
 * RECONCILED → FINAL, with cancelled/released, partial, provider-pending,
 * disputed, reversal-corrected and non-billable-failure branches."
 * Initial: ESTIMATED. Terminal: FINAL (CANCELLED/RELEASED are also
 * terminal — an event that never proceeds past estimation/reservation). */
export enum UsageEventState {
  ESTIMATED = 'ESTIMATED',
  RESERVED = 'RESERVED',
  STARTED = 'STARTED',
  MEASURED = 'MEASURED',
  RECONCILED = 'RECONCILED',
  FINAL = 'FINAL',
  CANCELLED = 'CANCELLED',
  RELEASED = 'RELEASED',
  PARTIAL = 'PARTIAL',
  PROVIDER_PENDING = 'PROVIDER_PENDING',
  DISPUTED = 'DISPUTED',
  REVERSAL_CORRECTED = 'REVERSAL_CORRECTED',
  NON_BILLABLE_FAILURE = 'NON_BILLABLE_FAILURE',
}

/**
 * UsageEvent — PLT-006's immutable metering record (`CORE-C1955`):
 * "Immutable UsageEvent records tenant/meter version/source/actor/
 * provider/timing, estimated/reserved/actual/billable quantities,
 * allowance/overage allocation, cost evidence, idempotency and
 * correction links." Registered as a PLT-005 canonical lifecycle family;
 * uses this codebase's established domain-owned state/version-column
 * pattern (the underlying row is immutable in the sense that corrections
 * never overwrite it — CORE-C1957 — but its `state`/`stateVersion` still
 * advance through the machine above via the shared StateMachineEngine,
 * same as every other family in this codebase).
 *
 * `CORE-C1957`: **"Corrections use linked adjustments, never historical
 * overwrite."** — `correctionOfUsageEventId` links a REVERSAL_CORRECTED
 * event to the original it corrects; the original row is never mutated.
 */
@Entity('usage_events')
@Index(['tenantId', 'meterDefinitionId'])
export class UsageEvent {
  @PrimaryGeneratedColumn('uuid', { name: 'usage_event_id' })
  usageEventId: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ name: 'meter_definition_id', type: 'uuid' })
  meterDefinitionId: string;

  /** the MeterDefinition's version this event was measured against —
   * pinned at creation, never "whatever the definition currently is"
   * (same pinned-version discipline as KillSwitchActivation). */
  @Column({ name: 'meter_definition_version' })
  meterDefinitionVersion: number;

  @Column({ name: 'source_ref', type: 'jsonb' })
  sourceRef: Record<string, unknown>;

  @Column({ name: 'actor_ref', type: 'jsonb' })
  actorRef: Record<string, unknown>;

  @Column({ name: 'provider_ref', type: 'jsonb', nullable: true })
  providerRef?: Record<string, unknown>;

  @Column({ name: 'timing', type: 'jsonb' })
  timing: Record<string, unknown>;

  @Column({ name: 'estimated_quantity', type: 'numeric', nullable: true })
  estimatedQuantity?: string;

  @Column({ name: 'reserved_quantity', type: 'numeric', nullable: true })
  reservedQuantity?: string;

  @Column({ name: 'actual_quantity', type: 'numeric', nullable: true })
  actualQuantity?: string;

  @Column({ name: 'billable_quantity', type: 'numeric', nullable: true })
  billableQuantity?: string;

  @Column({ name: 'allowance_allocation', type: 'jsonb', nullable: true })
  allowanceAllocation?: Record<string, unknown>;

  @Column({ name: 'overage_allocation', type: 'jsonb', nullable: true })
  overageAllocation?: Record<string, unknown>;

  @Column({ name: 'cost_evidence', type: 'jsonb', nullable: true })
  costEvidence?: Record<string, unknown>;

  @Column({
    type: 'enum',
    enum: UsageEventState,
    default: UsageEventState.ESTIMATED,
  })
  state: UsageEventState;

  @Column({ name: 'state_version', default: 0 })
  stateVersion: number;

  /** links a REVERSAL_CORRECTED event to the original it corrects
   * (CORE-C1957) — never a mutation of that original row. */
  @Column({ name: 'correction_of_usage_event_id', type: 'uuid', nullable: true })
  correctionOfUsageEventId?: string;

  @Column({ name: 'idempotency_key', unique: true })
  idempotencyKey: string;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;
}
