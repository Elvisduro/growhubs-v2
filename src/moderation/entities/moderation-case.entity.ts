import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Ordinary Moderation Case branch — per this engagement's own
 * `20_ModerationCase.md` (grounded in PLT-005 lines 1132-1153 and CM-011),
 * registered as PLT-005's canonical "Moderation Case" lifecycle family
 * (CORE-C2021) and referenced by CM-012 §2.5 (CM-C1148: ModerationEnvelope/
 * ConversationCase feed into this family).
 *
 * This is the GENERAL-PURPOSE branch only: spam, harassment, IP/policy
 * violation, low-risk content disputes, fraud signals, ordinary conduct
 * issues. The ChildSafetyCase branch is a SEPARATE table
 * (child-safety-case.entity.ts) with its own segregated access model — see
 * that file's doc comment for why they are never the same table or the
 * same access path, per CM-011's hard segregation requirement.
 *
 * The 11 named states below are the ordinary branch's exact states from
 * `20_ModerationCase.md`'s state table. Domain owner: Trust & Safety /
 * Moderation. Uses the domain-owned state/version-column pattern
 * established for every other PLT-005 family in this codebase (FRM-001's
 * Submission, CL-012's Enrollment, TV-012's TorvetProjection).
 */
export enum ModerationCaseState {
  REPORTED_OR_DETECTED = 'REPORTED_OR_DETECTED',
  CLASSIFICATION = 'CLASSIFICATION',
  AUTO_CONTAINED = 'AUTO_CONTAINED',
  MODERATOR_REVIEW = 'MODERATOR_REVIEW',
  ACTION_PENDING_APPROVAL = 'ACTION_PENDING_APPROVAL',
  ACTION_TAKEN = 'ACTION_TAKEN',
  APPEAL_OPEN = 'APPEAL_OPEN',
  MERGED_DUPLICATE = 'MERGED_DUPLICATE',
  RESOLVED_NO_ACTION = 'RESOLVED_NO_ACTION',
  RESOLVED_ACTION_TAKEN = 'RESOLVED_ACTION_TAKEN',
  RESOLVED_APPEAL_UPHELD = 'RESOLVED_APPEAL_UPHELD',
}

@Entity('moderation_cases')
export class ModerationCase {
  @PrimaryGeneratedColumn('uuid', { name: 'case_id' })
  caseId: string;

  /** the reported/detected content, conduct, or product across any
   * GrowHubs surface (Course, Community, Torvet, Media, Store, Events,
   * messaging) — polymorphic. */
  @Column({ name: 'subject_ref', type: 'jsonb' })
  subjectRef: Record<string, unknown>;

  @Column({
    type: 'enum',
    enum: ModerationCaseState,
    default: ModerationCaseState.REPORTED_OR_DETECTED,
  })
  state: ModerationCaseState;

  @Column({ name: 'state_version', default: 0 })
  stateVersion: number;

  /** report content reference, per the audit-evidence requirement every
   * transition must record (actor, evidence/report content reference,
   * classification/severity, approval chain, appeal outcome). */
  @Column({ name: 'report_evidence_ref', type: 'jsonb' })
  reportEvidenceRef: Record<string, unknown>;

  /** severity/type classification, and — critically — the record that the
   * CM-011 taxonomy gate was evaluated (whether or not it matched) before
   * any general moderator gained visibility. */
  @Column({ type: 'jsonb', default: {} })
  classification: Record<string, unknown>;

  /** set only if this case turned out to match the CM-011 typed-signal
   * taxonomy and was re-homed into ChildSafetyCase — see that entity. A
   * non-null value here means general-moderator access to this row's
   * further detail must already have stopped (the CLASSIFICATION ->
   * ChildSafetyCase transition is a one-way access-plane switch, not
   * merely a status flag — enforced at the authorization layer, not by
   * this column alone). */
  @Column({ name: 'child_safety_case_ref', type: 'uuid', nullable: true })
  childSafetyCaseRef?: string;

  @Column({ name: 'approval_ref', type: 'uuid', nullable: true })
  approvalRef?: string;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;

  @Column({ name: 'closed_at', type: 'timestamptz', nullable: true })
  closedAt?: Date;
}
