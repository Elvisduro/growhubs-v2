import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** FRM-001 §2.7 (CORE-C1566) — the exact 8 named identity modes. A
 * Submission creates NO Contact/Lead automatically regardless of mode
 * (CORE-C1567) — identity capture and business-record creation are two
 * separate steps. */
export enum SubmissionIdentityMode {
  ANONYMOUS = 'ANONYMOUS',
  PSEUDONYMOUS = 'PSEUDONYMOUS',
  AUTHENTICATED = 'AUTHENTICATED',
  INVITED = 'INVITED',
  TENANT_MEMBER = 'TENANT_MEMBER',
  APPLICANT = 'APPLICANT',
  GUARDIAN_REPRESENTATIVE = 'GUARDIAN_REPRESENTATIVE',
  FEDERATED = 'FEDERATED',
}

/**
 * CORRECTION (this codebase): originally built from FRM-001's own prose,
 * which names branch CATEGORIES ("validation/duplicate/consent/spam/
 * manual/rejection/withdrawal/expiry/failure branches") without a fixed
 * enum, before `10_FormSubmission.md` — the canonical PLT-005 state
 * machine for this exact "Submission" family — had been read. That
 * document constructs concrete state labels directly from those named
 * branch categories (flagged there as constructed-not-verbatim, same
 * discipline followed here) and gives the full 15-state set below,
 * corrected from the previous 8-state main-flow-only enum.
 *
 * Critical semantic boundary (CORE-C1561 / FRM-001): ACCEPTED here never
 * means accepted into a Course/job/Community/Service — only that the
 * submission was technically processed without error.
 */
export enum SubmissionState {
  STARTED = 'STARTED',
  PARTIAL_SAVED = 'PARTIAL_SAVED',
  VALIDATING = 'VALIDATING',
  SUBMITTED = 'SUBMITTED',
  PROCESSING = 'PROCESSING',
  ACCEPTED = 'ACCEPTED',
  ROUTED = 'ROUTED',
  COMPLETED = 'COMPLETED',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  DUPLICATE_DETECTED = 'DUPLICATE_DETECTED',
  SPAM_FLAGGED = 'SPAM_FLAGGED',
  MANUAL_REVIEW = 'MANUAL_REVIEW',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
  EXPIRED = 'EXPIRED',
  PROCESSING_FAILED = 'PROCESSING_FAILED',
}

/**
 * FRM-001 §2.4 (CORE-C1556) — Submission: binds the exact version, context,
 * identity, source, answers (-> ResponseValue rows), consents (->
 * ConsentReceipt, referenced not owned), files, risk assessment, processing
 * state, and outcomes of one attempt.
 *
 * CORE-C2026 registers this as a canonical PLT-005 lifecycle family — it
 * must be wired into the same shared StateMachineEngine already delivered
 * for PLT-005's other families, not given its own bespoke transition logic.
 * Per PLT-005 §13's explicitly-left-open storage choice (see
 * StateMachineObjectState's doc comment), this entity uses the
 * "domain maintains its own state/version columns" option: `state` and
 * `stateVersion` below are what `attemptTransition`'s `expectedVersion`
 * checks against for THIS object, rather than a StateMachineObjectState
 * row. Concrete SubmissionState `StateMachineDefinition`/
 * `TransitionDefinition` rows (the actual guard/approval wiring) are
 * follow-up implementation work, not created by this migration.
 */
@Entity('submissions')
export class Submission {
  @PrimaryGeneratedColumn('uuid', { name: 'submission_id' })
  submissionId: string;

  /** the exact version answered — never re-pointed */
  @Column({ name: 'form_version_id', type: 'uuid' })
  formVersionId: string;

  @Column({ name: 'identity_mode', type: 'enum', enum: SubmissionIdentityMode })
  identityMode: SubmissionIdentityMode;

  /** embed location, referrer, device */
  @Column({ name: 'source_context', type: 'jsonb', default: {} })
  sourceContext: Record<string, unknown>;

  @Column({ type: 'enum', enum: SubmissionState, default: SubmissionState.STARTED })
  state: SubmissionState;

  /** optimistic-concurrency version for this object's own state column —
   * see class doc comment; passed as StateMachineEngine's expectedVersion. */
  @Column({ name: 'state_version', default: 0 })
  stateVersion: number;

  /** spam/duplicate/fraud signals */
  @Column({ name: 'risk_flags', type: 'jsonb', default: {} })
  riskFlags: Record<string, unknown>;

  /** prevents duplicate Contacts/Applications/Orders/Bookings/Tasks/
   * consent records from one submission event (CORE-C1585) */
  @Column({ name: 'idempotency_key', unique: true })
  idempotencyKey: string;

  /** ConsentReceipt is independent of Submission (CORE-C1558) — a
   * Submission REFERENCES receipts, never owns them; the concrete join
   * shape (an array of ids here vs. a separate join table) is an
   * engineering choice, since the approved doc's field table for
   * Submission does not spell out the exact consent-linking column. */
  @Column({ name: 'consent_receipt_ids', type: 'jsonb', default: [] })
  consentReceiptIds: string[];
}
