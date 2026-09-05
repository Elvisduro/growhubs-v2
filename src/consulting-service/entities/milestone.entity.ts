import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * `12_Milestone.md` — the 8 named states exactly as given in the doc's
 * state table (lowercase, transcribed verbatim, same convention as
 * ServiceAgreement in this module). Initial: planned. Terminal: achieved,
 * not_achieved, waived, cancelled. `disputed` is explicitly non-terminal
 * (open pending resolution back to achieved/not_achieved/waived).
 *
 * Binding separation (CS-005): **"Milestone submitted is not accepted."**
 * Evidence submission (evidence_pending) and acceptance/achievement
 * (achieved) are distinct states connected by a real review path, never
 * an automatic pass-through — completing underlying tasks/Actions is
 * activity evidence, never automatic Milestone achievement. This mirrors
 * this codebase's Notification "sent is not delivered" and SupportCase
 * "ARIA answer does not close Support" structural separations: the
 * transition from evidence_pending to achieved/not_achieved requires an
 * explicit reviewer/decision-authority action, never inferred from the
 * mere presence of submitted evidence.
 */
export enum MilestoneState {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  EVIDENCE_PENDING = 'evidence_pending',
  ACHIEVED = 'achieved',
  NOT_ACHIEVED = 'not_achieved',
  WAIVED = 'waived',
  DISPUTED = 'disputed',
  CANCELLED = 'cancelled',
}

/**
 * Milestone — an agreed delivery checkpoint inside an active Engagement's
 * Delivery Plan Version, governed by (but not itself amending) a
 * ServiceAgreement. Distinct from Deliverable (own Draft->Accepted/
 * Rejected review cycle, out of this codebase's current scope) and from
 * Outcome (a longer-horizon separately-versioned construct) — a
 * Milestone may reference Deliverable acceptance as one evidence input
 * but does not own Deliverable state. Registered as a PLT-005 canonical
 * lifecycle family; uses this codebase's established domain-owned
 * state/version-column pattern.
 *
 * `not_achieved` and `disputed` are retained as first-class, valid
 * outcomes — never hidden or silently reclassified as success, per
 * CS-005's explicit "NOT_ACHIEVED... is valid evidence, not a system
 * failure to be hidden."
 */
@Entity('milestones')
export class Milestone {
  @PrimaryGeneratedColumn('uuid', { name: 'milestone_id' })
  milestoneId: string;

  /** the ServiceAgreement (via its Delivery Plan Version) this Milestone
   * is defined against — Milestone does not amend the Agreement
   * directly, a Change Request mediates cancellation/replacement. */
  @Column({ name: 'agreement_id', type: 'uuid' })
  agreementId: string;

  @Column({ name: 'delivery_plan_version_ref', type: 'jsonb' })
  deliveryPlanVersionRef: Record<string, unknown>;

  /** checkpoint meaning, contributing Actions/Sessions/Deliverables/
   * evidence types, required reviewer/decision authority, target/due
   * period, evidence threshold, exceptions/allowed states, visibility/
   * notification/dispute path — the required-complete-before-planning
   * content set named at the (none) -> planned transition. Engineering
   * synthesis for the storage shape; the required CATEGORIES are
   * transcribed from the doc, not invented. */
  @Column({ type: 'jsonb' })
  specification: Record<string, unknown>;

  @Column({
    type: 'enum',
    enum: MilestoneState,
    default: MilestoneState.PLANNED,
  })
  state: MilestoneState;

  @Column({ name: 'state_version', default: 0 })
  stateVersion: number;

  /** contributing Deliverable/Session/Action/external-evidence references
   * accumulated toward the declared evidence threshold. */
  @Column({ name: 'contributing_evidence', type: 'jsonb', default: [] })
  contributingEvidence: Record<string, unknown>[];

  /** reviewer/decision-authority record for an achieved/not_achieved
   * decision — required at that transition, per the doc's `authority`
   * failure class. */
  @Column({ name: 'decision_record', type: 'jsonb', nullable: true })
  decisionRecord?: Record<string, unknown>;

  /** dispute reason/evidence and resolution — provider delivery-
   * completion assessment and client perceived-value reporting are
   * explicitly allowed to diverge and neither silently overwrites the
   * other; where they conflict without resolution, the row moves to
   * DISPUTED rather than being forced to a single value. */
  @Column({ name: 'dispute_record', type: 'jsonb', nullable: true })
  disputeRecord?: Record<string, unknown>;

  /** waiver authority and reason — a waiver is explicitly NOT an
   * achievement claim. */
  @Column({ name: 'waiver_record', type: 'jsonb', nullable: true })
  waiverRecord?: Record<string, unknown>;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;

  @Column({ name: 'resolved_at', type: 'timestamptz', nullable: true })
  resolvedAt?: Date;
}
