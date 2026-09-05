import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** `CORE-C1645` (MI-001): "Each target reports DELETED, ANONYMISED,
 * DETACHED, RESTRICTED_RETAINED, LEGAL_HOLD, NOT_FOUND or FAILED_RETRY."
 * The 7 named outcomes verbatim. */
export enum DeletionPropagationTargetOutcome {
  DELETED = 'DELETED',
  ANONYMISED = 'ANONYMISED',
  DETACHED = 'DETACHED',
  RESTRICTED_RETAINED = 'RESTRICTED_RETAINED',
  LEGAL_HOLD = 'LEGAL_HOLD',
  NOT_FOUND = 'NOT_FOUND',
  FAILED_RETRY = 'FAILED_RETRY',
}

/**
 * DeletionPropagationJob — MI-001's own named object (`CORE-C1609`),
 * distinct from this codebase's existing PLT-001 `DeletionPropagationPlan`/
 * `PropagationTarget` (see `src/dsr/entities/deletion-propagation-plan.entity.ts`):
 * the register names it as its own MI-001 object rather than a reuse of
 * the PLT-001 machinery, so it is modeled here separately rather than
 * coupled to that table's schema without decision-text saying they are
 * the same object.
 *
 * `CORE-C1644`: "A valid deletion/restriction uses DeletionPropagationJob
 * across local/synced copies, renditions, transcript/captions,
 * SpeakerLabels, summaries/notes, Tasks, CRM, indexes, Knowledge, clips/
 * thumbnails, exports/integrations, ARIA memory/cache and backup policy."
 * — the 13 named target kinds, verbatim, held in `targetResults` rather
 * than 13 more tables (same one-object-many-kinds treatment as
 * `DerivedArtifact`). `CORE-C1646`: independently justified business
 * records MAY remain minimised/detached with a recorded reason — reason
 * lives inside each target result. `CORE-C1647`: **"Failure never
 * masquerades as completed erasure"** — `FAILED_RETRY` is a first-class
 * outcome value, never silently coerced to `DELETED`.
 */
@Entity('deletion_propagation_jobs')
export class DeletionPropagationJob {
  @PrimaryGeneratedColumn('uuid', { name: 'deletion_propagation_job_id' })
  deletionPropagationJobId: string;

  @Column({ name: 'recording_session_id', type: 'uuid' })
  recordingSessionId: string;

  /** the deletion/restriction command evidence that authorised this job
   * (CORE-C1644: "a valid deletion/restriction" — never a free-form
   * delete). */
  @Column({ name: 'command_evidence', type: 'jsonb' })
  commandEvidence: Record<string, unknown>;

  /** one entry per target kind (local/synced copies, renditions,
   * transcript/captions, SpeakerLabels, summaries/notes, Tasks, CRM,
   * indexes, Knowledge, clips/thumbnails, exports/integrations, ARIA
   * memory/cache, backup policy), each with its own
   * DeletionPropagationTargetOutcome and optional reason. */
  @Column({ name: 'target_results', type: 'jsonb', default: [] })
  targetResults: Array<{
    target: string;
    outcome: DeletionPropagationTargetOutcome;
    reason?: string;
  }>;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt?: Date;
}
