import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** PLT-001 (line 820) — the six named per-target outcome values, given
 * verbatim in the approved text. Every propagation target reaches exactly
 * one of these; PARTIALLY_COMPLETED at the plan level exists precisely so
 * PROVIDER_PENDING/OUTSIDE_PLATFORM_CONTROL targets are never silently
 * reported as fully complete. */
export enum PropagationTargetOutcome {
  DELETED = 'DELETED',
  ANONYMISED = 'ANONYMISED',
  RESTRICTED = 'RESTRICTED',
  RETAINED_WITH_BASIS = 'RETAINED_WITH_BASIS',
  PROVIDER_PENDING = 'PROVIDER_PENDING',
  OUTSIDE_PLATFORM_CONTROL = 'OUTSIDE_PLATFORM_CONTROL',
}

/**
 * PLT-001 — DeletionPropagationPlan: the cascading execution plan spun up
 * at ACTION_REQUIRED, one row per DataSubjectRequest, versioned so a
 * concurrent DSR against the same subject can be cross-referenced rather
 * than racing a second plan against the same object (§Idempotency &
 * concurrency notes).
 *
 * FIELD LIST NOTE: the doc lists the target SURFACES a plan must cover
 * (source objects, Torvet/projections, search/indexes, analytics
 * identifiers, cache/CDN, media derivatives, transcript/summary,
 * embeddings/vector stores, ARIA memory, CRM, Tasks, notifications,
 * connectors, controlled exports, backups — line 826/822) but gives no
 * literal plan-row field table — `targets` holds one PropagationTarget
 * per row (this entity's companion below), an engineering synthesis for
 * the storage shape only; the target SURFACE list itself is transcribed
 * from the approved text, not invented.
 */
@Entity('deletion_propagation_plans')
export class DeletionPropagationPlan {
  @PrimaryGeneratedColumn('uuid', { name: 'plan_id' })
  planId: string;

  @Column({ name: 'request_id', type: 'uuid' })
  requestId: string;

  @Column({ default: 1 })
  version: number;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;
}

/**
 * PropagationTarget: one domain-owner command/report row within a
 * DeletionPropagationPlan. Each target is commanded via ITS OWN domain's
 * canonical interface (event/command) — never a shared-table write from
 * the DSR machine — and reports its own outcome back here. A duplicate
 * command to a target that already reports DELETED returns the same
 * outcome idempotently rather than attempting a second deletion.
 */
@Entity('propagation_targets')
export class PropagationTarget {
  @PrimaryGeneratedColumn('uuid', { name: 'target_id' })
  targetId: string;

  @Column({ name: 'plan_id', type: 'uuid' })
  planId: string;

  /** which domain/system this target represents (Order, Torvet
   * projections, search index, ARIA memory, CRM, backups, ...) — plain
   * string reference, not a closed enum, since the doc's surface list is
   * descriptive prose, not a literal field-level taxonomy. */
  @Column({ name: 'domain_name' })
  domainName: string;

  @Column({ name: 'object_ref', type: 'jsonb' })
  objectRef: Record<string, unknown>;

  @Column({
    type: 'enum',
    enum: PropagationTargetOutcome,
    nullable: true,
  })
  outcome?: PropagationTargetOutcome;

  /** basis recorded when outcome = RETAINED_WITH_BASIS (e.g. a LegalHold
   * reference, or a credential/financial-fact retention rule per line
   * 826). */
  @Column({ name: 'retention_basis_ref', type: 'jsonb', nullable: true })
  retentionBasisRef?: Record<string, unknown>;

  /** idempotency key for the propagation command to this target, per
   * §Idempotency & concurrency notes. */
  @Column({ name: 'idempotency_key' })
  idempotencyKey: string;

  @Column({ name: 'attempted_at', type: 'timestamptz', nullable: true })
  attemptedAt?: Date;

  @Column({ name: 'resolved_at', type: 'timestamptz', nullable: true })
  resolvedAt?: Date;
}
