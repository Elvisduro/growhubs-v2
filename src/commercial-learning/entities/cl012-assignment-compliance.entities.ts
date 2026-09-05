import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** CL-012 §2.1 (CL-C1386) */
export enum AssignmentRequiredStatus {
  REQUIRED = 'REQUIRED',
  OPTIONAL = 'OPTIONAL',
}

/** CL-012 §3.1 (CL-C1386) — the 7 named main-flow states. Branches
 * (decline/exemption/waiver/reassign/revoke/expire/overdue/dispute) are
 * named as categories, not individual state values, in the approved text —
 * left unenumerated here rather than invented, same discipline as
 * Submission's branch states in FRM-001. */
export enum LearningAssignmentState {
  DRAFT = 'DRAFT',
  ASSIGNED = 'ASSIGNED',
  NOTIFIED = 'NOTIFIED',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  ACTIVATED = 'ACTIVATED',
  SATISFIED = 'SATISFIED',
  CLOSED = 'CLOSED',
}

/**
 * CL-012 §2.1 (CL-C1386) — LearningAssignment: the request/obligation
 * ("you must complete X"). Assignment never grants access directly
 * (CL-C1387) — Seat/Entitlement/Enrollment activation are each explicit,
 * separate steps (CL-C1388). If activation fails, that is
 * ACTIVATION_BLOCKED, never learner non-compliance (CL-C1389) — modeled
 * here as a value the derived ComplianceEvaluation must never assign
 * NON_COMPLIANT for on that basis alone (enforced in application logic,
 * not a DB constraint, since it's a cross-entity business rule).
 */
@Entity('learning_assignments')
export class LearningAssignment {
  @PrimaryGeneratedColumn('uuid', { name: 'assignment_id' })
  assignmentId: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  /** person or group — polymorphic, no dedicated Group table yet. */
  @Column({ name: 'assignee_ref', type: 'jsonb' })
  assigneeRef: Record<string, unknown>;

  /** Programme/Course/Path/Delivery — none has a dedicated table yet in
   * this scaffold. */
  @Column({ name: 'target_ref', type: 'jsonb' })
  targetRef: Record<string, unknown>;

  @Column({ name: 'assigner_ref' })
  assignerRef: string;

  @Column()
  reason: string;

  @Column({ name: 'required_status', type: 'enum', enum: AssignmentRequiredStatus })
  requiredStatus: AssignmentRequiredStatus;

  /** dates/priority/recurrence/completion/exemption */
  @Column({ type: 'jsonb' })
  policy: Record<string, unknown>;

  @Column({
    type: 'enum',
    enum: LearningAssignmentState,
    default: LearningAssignmentState.DRAFT,
  })
  state: LearningAssignmentState;

  /** engineering addition mirroring Submission's pattern (FRM-001): this
   * family is not itself explicitly cross-referenced to PLT-005 the way
   * FRM-001's Submission is (CORE-C2026), but the same domain-owned
   * state/version approach is used for consistency and future-proofing. */
  @Column({ name: 'state_version', default: 0 })
  stateVersion: number;
}

/** CORRECTION (this codebase): originally built from CL-012's own prose
 * before `08_BaseEnrollment.md` — the canonical, fully-enumerated
 * PLT-005 state machine for this exact object ("the single, cross-context
 * Enrollment object defined in CL-012") — had been read. That document
 * gives the complete 15-state set below, including the branches
 * (waitlist/pause/access-restriction/transfer/withdrawal/removal/expiry/
 * pre-start-cancel) this codebase had previously left as unenumerated
 * categories. Corrected to the full set; TRANSFERRED and ARCHIVED are the
 * only true terminal states — a TRANSFERRED enrollment closes in favour
 * of a NEW Enrollment row in the destination Delivery (see
 * sourceEnrollmentId below), never a resurrection of this row. */
export enum EnrollmentState {
  INVITED = 'INVITED',
  ELIGIBILITY_PENDING = 'ELIGIBILITY_PENDING',
  WAITLISTED = 'WAITLISTED',
  ENROLLED = 'ENROLLED',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  ACCESS_RESTRICTED = 'ACCESS_RESTRICTED',
  COMPLETION_REVIEW = 'COMPLETION_REVIEW',
  COMPLETED = 'COMPLETED',
  PRE_START_CANCELLED = 'PRE_START_CANCELLED',
  WITHDRAWN = 'WITHDRAWN',
  REMOVED_WITH_RECORD = 'REMOVED_WITH_RECORD',
  EXPIRED = 'EXPIRED',
  TRANSFERRED = 'TRANSFERRED',
  ARCHIVED = 'ARCHIVED',
}

/**
 * CL-012 §2.2 (CL-C1390) — the canonical Enrollment: "same object as the
 * PLT-005 Enrollment family" — this is the first concrete table for that
 * family (PLT-005 itself only defines the shared state-machine substrate,
 * not per-family tables). Uses the domain-owns-its-own-state-columns
 * option from PLT-005 §13 (same pattern as FRM-001's Submission), since
 * Enrollment needs its own rich related_snapshot/target_ref columns beyond
 * what the generic StateMachineObjectState row holds.
 *
 * Access restriction or removal never erases history (CL-C1391) — nothing
 * in this codebase issues a DELETE against this table; a removal is a
 * state transition (e.g. to ARCHIVED via a REMOVED-WITH-RECORD branch),
 * never a dropped row.
 */
@Entity('enrollments')
export class Enrollment {
  @PrimaryGeneratedColumn('uuid', { name: 'enrollment_id' })
  enrollmentId: string;

  @Column({ name: 'person_id', type: 'uuid' })
  personId: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  /** Course-or-Programme/Delivery — no dedicated table yet. */
  @Column({ name: 'target_ref', type: 'jsonb' })
  targetRef: Record<string, unknown>;

  @Column({ name: 'cohort_ref', nullable: true })
  cohortRef?: string;

  @Column()
  source: string;

  /** Entitlement/Assignment/Registration/role/date/completion at
   * enrollment time */
  @Column({ name: 'related_snapshot', type: 'jsonb' })
  relatedSnapshot: Record<string, unknown>;

  @Column({ type: 'enum', enum: EnrollmentState, default: EnrollmentState.INVITED })
  state: EnrollmentState;

  @Column({ name: 'state_version', default: 0 })
  stateVersion: number;

  /** set on the NEW Enrollment row created by a TRANSFERRED closure of a
   * prior one — links back to the source row per 08_BaseEnrollment.md
   * §2 ("a transfer opens a new Enrollment instance... related via
   * sourceEnrollmentId"); the source row itself is never deleted or
   * reactivated. */
  @Column({ name: 'source_enrollment_id', type: 'uuid', nullable: true })
  sourceEnrollmentId?: string;
}

/**
 * CL-012 §2.3 (CL-C1392-C1394) — ProgrammeRegistration: covers application/
 * review/offer/acceptance/conversion, for institutions that require it. A
 * simple creator's signup BYPASSES this entirely (CL-C1393).
 *
 * FIELD LIST NOTE: the approved text gives no literal field table for this
 * entity, only the prose above — the columns below are an engineering
 * synthesis of that prose, flagged here explicitly (same discipline used
 * for FRM-001's ConsentReceipt).
 */
export enum ProgrammeRegistrationState {
  APPLICATION = 'APPLICATION',
  REVIEW = 'REVIEW',
  OFFER = 'OFFER',
  ACCEPTANCE = 'ACCEPTANCE',
  CONVERTED = 'CONVERTED',
}

@Entity('programme_registrations')
export class ProgrammeRegistration {
  @PrimaryGeneratedColumn('uuid', { name: 'registration_id' })
  registrationId: string;

  @Column({ name: 'person_id', type: 'uuid' })
  personId: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  /** Programme this registration is for — no dedicated table yet. */
  @Column({ name: 'programme_ref' })
  programmeRef: string;

  @Column({
    type: 'enum',
    enum: ProgrammeRegistrationState,
    default: ProgrammeRegistrationState.APPLICATION,
  })
  state: ProgrammeRegistrationState;
}

/**
 * CL-012 §2.4 (CL-C1395-C1396) — LearningProgress: reconstructed from
 * versioned activity/units/attempts/Evidence/milestones — a READ MODEL
 * built from those event sources, never itself an independently-editable
 * row. LearningProgress alone is NOT a learning outcome (CL-C1396) — 100%
 * media progress does not by itself mean completion (see
 * ComplianceEvaluation's completion rule, CL-C1414).
 *
 * FIELD LIST NOTE: no literal field table given in the approved text
 * either — synthesized from the prose, flagged here as with
 * ProgrammeRegistration above. Application code must treat this table as
 * write-only-by-the-event-reconstruction-process — never a place a UI or
 * API writes to directly, since that would make it a second source of
 * truth, which CL-C1396 forbids in substance even though it does not use
 * that exact wording.
 */
@Entity('learning_progress')
export class LearningProgress {
  @PrimaryGeneratedColumn('uuid', { name: 'progress_id' })
  progressId: string;

  @Column({ name: 'person_id', type: 'uuid' })
  personId: string;

  @Column({ name: 'enrollment_id', type: 'uuid' })
  enrollmentId: string;

  /** the units/attempts/evidence-refs/milestones state this snapshot was
   * reconstructed from */
  @Column({ name: 'progress_snapshot', type: 'jsonb' })
  progressSnapshot: Record<string, unknown>;

  @Column({ name: 'computed_at', type: 'timestamptz', default: () => 'now()' })
  computedAt: Date;

  @Column({ default: 1 })
  version: number;
}

/** CL-012 §2.5 (CL-C1398) — the exact 14 named states (NOT_APPLICABLE and
 * NOT_ASSIGNED read as two distinct slash-separated values in the source
 * text, matching the same convention used for CL-011's
 * seller_failure/platform_failure). NON_COMPLIANT requires explicit
 * policy+evidence to assign (CL-C1399) and must never be assigned merely
 * for inactivity (CL-C1400) — that enforcement is an application-layer
 * rule over this enum, not expressible as a DB constraint. */
export enum ComplianceEvaluationState {
  NOT_APPLICABLE = 'NOT_APPLICABLE',
  NOT_ASSIGNED = 'NOT_ASSIGNED',
  ASSIGNED_NOT_STARTED = 'ASSIGNED_NOT_STARTED',
  IN_PROGRESS_ON_TRACK = 'IN_PROGRESS_ON_TRACK',
  IN_PROGRESS_AT_RISK = 'IN_PROGRESS_AT_RISK',
  OVERDUE_INCOMPLETE = 'OVERDUE_INCOMPLETE',
  COMPLETION_REVIEW = 'COMPLETION_REVIEW',
  COMPLETED_COMPLIANT = 'COMPLETED_COMPLIANT',
  COMPLETED_LATE = 'COMPLETED_LATE',
  EXEMPTED = 'EXEMPTED',
  WAIVED = 'WAIVED',
  NON_COMPLIANT = 'NON_COMPLIANT',
  DISPUTED = 'DISPUTED',
  UNKNOWN_INCOMPLETE_DATA = 'UNKNOWN_INCOMPLETE_DATA',
}

/**
 * CL-012 §2.5 (CL-C1397) — ComplianceEvaluation: always a DERIVED object,
 * never a manually-set field — derives from Assignment, Enrollment,
 * versioned requirements/dates/Evidence/Grade/Credential, and any
 * exemption/waiver.
 */
@Entity('compliance_evaluations')
export class ComplianceEvaluation {
  @PrimaryGeneratedColumn('uuid', { name: 'evaluation_id' })
  evaluationId: string;

  @Column({ name: 'assignment_id', type: 'uuid' })
  assignmentId: string;

  @Column({ name: 'enrollment_id', type: 'uuid' })
  enrollmentId: string;

  @Column({ type: 'enum', enum: ComplianceEvaluationState })
  state: ComplianceEvaluationState;

  @Column({ name: 'policy_snapshot_ref', type: 'uuid' })
  policySnapshotRef: string;

  /** the exact requirements/dates/Evidence/Grade/Credential/exemption
   * state it was computed from — this is what makes the derivation
   * re-verifiable rather than a black box. */
  @Column({ name: 'derivation_inputs', type: 'jsonb' })
  derivationInputs: Record<string, unknown>;
}

/**
 * CL-012 §2.6 (CL-C1401-C1404) — CompliancePolicySnapshot: each
 * ComplianceEvaluation binds a versioned snapshot covering required
 * learning/eligible delivery, dates/grace, completion expression, Grade/
 * Evidence/Credential requirements, recurrence, exemption/waiver rules,
 * late/timezone handling, and reporting scope. Policy changes never
 * rewrite history (CL-C1402) — same discipline as CL-011's
 * LearningCommercialPolicySnapshot (CL-C1352).
 *
 * FIELD LIST NOTE: like ProgrammeRegistration/LearningProgress above, no
 * literal field table is given for this entity — `terms` below holds the
 * prose-listed content as JSON, flagged as an engineering synthesis.
 */
@Entity('compliance_policy_snapshots')
export class CompliancePolicySnapshot {
  @PrimaryGeneratedColumn('uuid', { name: 'snapshot_id' })
  snapshotId: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  /** Programme/Course/Path/Delivery this policy governs */
  @Column({ name: 'scope_ref', type: 'jsonb' })
  scopeRef: Record<string, unknown>;

  /** required learning/eligible delivery/dates/grace/completion
   * expression/Grade/Evidence/Credential requirements/recurrence/
   * exemption/waiver rules/late/timezone handling/reporting scope */
  @Column({ type: 'jsonb' })
  terms: Record<string, unknown>;

  @Column({ name: 'captured_at', type: 'timestamptz', default: () => 'now()' })
  capturedAt: Date;
}
