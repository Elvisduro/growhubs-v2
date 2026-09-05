import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** PLT-001 (Master Spec line 814) — the R0-R7 RetentionClass taxonomy is
 * named in the approved text but no literal definition-per-class table is
 * given (concrete retention periods are explicitly deferred to legally-
 * validated Policy Packs, per the doc's own closing note). The 8 labels
 * (R0-R7) themselves ARE given verbatim; what each one MEANS is Policy-
 * Pack content, not a database enum this codebase can invent — so this
 * enum captures only the label set, never a definition. Pseudonymised
 * data is still personal data (line 814) — no "anonymised == exempt"
 * shortcut exists anywhere in this codebase's handling of these classes.
 */
export enum RetentionClass {
  R0 = 'R0',
  R1 = 'R1',
  R2 = 'R2',
  R3 = 'R3',
  R4 = 'R4',
  R5 = 'R5',
  R6 = 'R6',
  R7 = 'R7',
}

/** `21_DataSubjectRequest.md` states table — 11 named states exactly as
 * given, initial RECEIVED, terminal COMPLETED/DECLINED_WITH_REASON/
 * CANCELLED_BY_REQUESTER. */
export enum DataSubjectRequestState {
  RECEIVED = 'RECEIVED',
  IDENTITY_VERIFICATION = 'IDENTITY_VERIFICATION',
  NEEDS_INFORMATION = 'NEEDS_INFORMATION',
  SCOPING = 'SCOPING',
  IN_REVIEW = 'IN_REVIEW',
  RESTRICTED_BY_LEGAL_HOLD = 'RESTRICTED_BY_LEGAL_HOLD',
  ACTION_REQUIRED = 'ACTION_REQUIRED',
  PROPAGATING = 'PROPAGATING',
  PARTIALLY_COMPLETED = 'PARTIALLY_COMPLETED',
  APPEALED = 'APPEALED',
  COMPLETED = 'COMPLETED',
  DECLINED_WITH_REASON = 'DECLINED_WITH_REASON',
  CANCELLED_BY_REQUESTER = 'CANCELLED_BY_REQUESTER',
}

/** the 9 named right-types this machine governs (§Purpose & scope, first
 * sentence): access, correction, deletion, restriction, objection,
 * consent withdrawal, portability, explanation, account-closure. */
export enum DataSubjectRequestKind {
  ACCESS = 'ACCESS',
  CORRECTION = 'CORRECTION',
  DELETION = 'DELETION',
  RESTRICTION = 'RESTRICTION',
  OBJECTION = 'OBJECTION',
  CONSENT_WITHDRAWAL = 'CONSENT_WITHDRAWAL',
  PORTABILITY = 'PORTABILITY',
  EXPLANATION = 'EXPLANATION',
  ACCOUNT_CLOSURE = 'ACCOUNT_CLOSURE',
}

/**
 * PLT-001 — DataSubjectRequest: the single canonical, coordinating record
 * for one data-subject rights request. This machine sits in front of and
 * orchestrates every domain that holds personal data — it never writes
 * directly into those domains' tables (see DeletionPropagationPlan /
 * PropagationTarget below for the per-target command/report pattern).
 * Registered as PLT-005's canonical DSR lifecycle family; uses this
 * codebase's established domain-owned state/version-column pattern.
 *
 * True deletion, anonymisation, and justified retention (legal hold) are
 * three STRUCTURALLY DISTINCT outcomes per affected object/field — never
 * blended into one "handled" flag. That distinction lives on
 * PropagationTarget.outcome, not on this row.
 */
@Entity('data_subject_requests')
export class DataSubjectRequest {
  @PrimaryGeneratedColumn('uuid', { name: 'request_id' })
  requestId: string;

  /** the data subject this request concerns — polymorphic reference,
   * since a request may be filed by an authorized agent/guardian on the
   * subject's behalf (subject and requester are not always the same
   * actor). */
  @Column({ name: 'subject_ref', type: 'jsonb' })
  subjectRef: Record<string, unknown>;

  /** who actually filed it — self, or an authorized agent/guardian. */
  @Column({ name: 'requester_ref', type: 'jsonb' })
  requesterRef: Record<string, unknown>;

  @Column({ type: 'enum', enum: DataSubjectRequestKind })
  kind: DataSubjectRequestKind;

  @Column({
    type: 'enum',
    enum: DataSubjectRequestState,
    default: DataSubjectRequestState.RECEIVED,
  })
  state: DataSubjectRequestState;

  @Column({ name: 'state_version', default: 0 })
  stateVersion: number;

  /** which channel the request arrived through — engineering synthesis
   * (no closed enum given), plain string. */
  @Column({ name: 'intake_channel' })
  intakeChannel: string;

  /** jurisdiction-driven response deadline, started at RECEIVED. */
  @Column({ name: 'deadline_at', type: 'timestamptz', nullable: true })
  deadlineAt?: Date;

  /** per-class RetentionClass mapping + basis/decision produced at
   * SCOPING/IN_REVIEW — one entry per affected object/field class.
   * Engineering synthesis for the storage shape; RetentionClass values
   * themselves are the enum above, not invented. */
  @Column({ name: 'class_determinations', type: 'jsonb', default: [] })
  classDeterminations: Record<string, unknown>[];

  /** documented reason when declined, or the reason category surfaced to
   * the requester for a RESTRICTED_BY_LEGAL_HOLD scope. */
  @Column({ name: 'decision_reason', type: 'jsonb', nullable: true })
  decisionReason?: Record<string, unknown>;

  /** appeal record: original determination preserved, never overwritten,
   * revised determination recorded alongside it (per audit-evidence
   * requirement, "the original is never overwritten"). */
  @Column({ name: 'appeal_record', type: 'jsonb', nullable: true })
  appealRecord?: Record<string, unknown>;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt?: Date;
}
