import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * CL-011 §1 (CL-C1348-C1350) — the single most important boundary in the
 * whole Commercial/Learning triad: Payment/Refund, Entitlement, Enrollment,
 * Progress, Evidence, Grade, and Credential are seven distinct objects,
 * never one merged "enrollment status" row. Finance MAY govern future
 * access; it must NEVER rewrite learning history.
 *
 * FORBIDDEN SHORTCUTS (CL-C1354), enforced structurally in this file and
 * cl012: there is no generic `refunded` boolean anywhere in this schema,
 * and nothing here exposes a direct payment-webhook write path to Grade or
 * Credential (those tables aren't even defined yet — see cl013's Gradebook
 * note) — every commercial event that touches learning must go through
 * CommercialLearningCase below.
 */

/**
 * CL-011 §2.1 (CL-C1351) — LearningCommercialPolicySnapshot: every
 * commercial Enrollment binds a versioned, historical snapshot of the
 * Offer/Order/MoR terms in force at that moment. Later policy changes
 * NEVER mutate this row (CL-C1352) — a correction is always a new
 * snapshot.
 */
@Entity('learning_commercial_policy_snapshots')
export class LearningCommercialPolicySnapshot {
  @PrimaryGeneratedColumn('uuid', { name: 'snapshot_id' })
  snapshotId: string;

  /** FK -> CL-012's canonical Enrollment (the PLT-005 Enrollment family) */
  @Column({ name: 'enrollment_id', type: 'uuid' })
  enrollmentId: string;

  /** generic refs — Offer/Order/MoR do not yet have dedicated tables in
   * this scaffold, so stored as plain string refs rather than DB FKs. */
  @Column({ name: 'offer_ref', nullable: true })
  offerRef?: string;

  @Column({ name: 'order_ref', nullable: true })
  orderRef?: string;

  @Column({ name: 'mor_ref', nullable: true })
  morRef?: string;

  /** access/refund/withdrawal/digital-start/subscription/instalment/
   * grace/consumption/offline/credential/sponsor/jurisdiction terms */
  @Column({ type: 'jsonb' })
  terms: Record<string, unknown>;

  @Column({ name: 'captured_at', type: 'timestamptz', default: () => 'now()' })
  capturedAt: Date;
}

/** CL-011 §2.2 (CL-C1353) — the exact 16 named trigger kinds. */
export enum CommercialLearningCaseTriggerKind {
  DUPLICATE = 'DUPLICATE',
  CANCELLATION = 'CANCELLATION',
  WITHDRAWAL = 'WITHDRAWAL',
  GOODWILL = 'GOODWILL',
  PARTIAL = 'PARTIAL',
  SELLER_FAILURE = 'SELLER_FAILURE',
  PLATFORM_FAILURE = 'PLATFORM_FAILURE',
  SUBSCRIPTION_DEFAULT = 'SUBSCRIPTION_DEFAULT',
  INSTALMENT_DEFAULT = 'INSTALMENT_DEFAULT',
  FRAUD = 'FRAUD',
  CHARGEBACK = 'CHARGEBACK',
  SPONSOR = 'SPONSOR',
  PLAN = 'PLAN',
  SCHOLARSHIP = 'SCHOLARSHIP',
  BILLING = 'BILLING',
  SAFETY = 'SAFETY',
}

/**
 * CL-011 §2.2 (CL-C1353) — CommercialLearningCase: the single object that
 * must exist whenever a material commercial event touches the learning
 * record — the mechanism that enforces the §1 boundary in practice. Binds
 * the finance event, the Entitlement, the Enrollment, current learning/
 * credential state, the applicable policy/jurisdiction, proposed
 * consequences, approvals, notices, appeal, and resolution.
 */
@Entity('commercial_learning_cases')
export class CommercialLearningCase {
  @PrimaryGeneratedColumn('uuid', { name: 'case_id' })
  caseId: string;

  @Column({
    name: 'trigger_kind',
    type: 'enum',
    enum: CommercialLearningCaseTriggerKind,
  })
  triggerKind: CommercialLearningCaseTriggerKind;

  /** Payment/Refund/Dispute are PLT-005 families without a dedicated
   * concrete table yet in this scaffold — stored as a generic ref rather
   * than a fabricated FK. */
  @Column({ name: 'finance_event_ref' })
  financeEventRef: string;

  /** Entitlement has no dedicated table yet in this scaffold (referenced
   * throughout XD-008/CL-011/CL-012 but never given its own field table by
   * an approved document so far) — generic ref, not a fabricated FK. */
  @Column({ name: 'entitlement_ref' })
  entitlementRef: string;

  /** real FK -> CL-012's canonical Enrollment table. */
  @Column({ name: 'enrollment_ref', type: 'uuid' })
  enrollmentRef: string;

  /** Progress/Evidence/Grade/Credential state at case-open time */
  @Column({ name: 'learning_state_snapshot', type: 'jsonb' })
  learningStateSnapshot: Record<string, unknown>;

  @Column({ name: 'policy_snapshot_ref', type: 'uuid' })
  policySnapshotRef: string;

  /** never left to be inferred by the UI from a refund percentage
   * (CL-C1360) — must be populated with the actual, specific consequence
   * list. */
  @Column({ name: 'proposed_consequences', type: 'jsonb' })
  proposedConsequences: Record<string, unknown>;

  @Column({ type: 'jsonb', default: [] })
  approvals: Record<string, unknown>[];

  /** role-scoped notice content (CL-C1377): learner/payer/instructor/seller
   * each see different content from the same case — this column holds all
   * of it, keyed by role, rather than one undifferentiated message. */
  @Column({ type: 'jsonb', default: {} })
  notices: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  appeal?: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  resolution?: Record<string, unknown>;
}
