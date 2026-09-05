import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * `09_Credential.md` — the 8 named states exactly as given in the doc's
 * state table. Initial: PENDING_ISSUANCE. REVOKED and ARCHIVED are
 * terminal for ordinary operation; the doc itself flags reinstatement of
 * a REVOKED credential as an explicit, unresolved gap ("TBD — not
 * specified in approved decisions") — this codebase does NOT invent a
 * reinstatement transition. A wrongful revocation is corrected via a new
 * CORRECTED/re-ISSUED record that supersedes the revocation, preserving
 * it in history, per the doc's own recommendation, never a silent
 * un-revoke.
 */
export enum CredentialState {
  PENDING_ISSUANCE = 'PENDING_ISSUANCE',
  CRITERIA_NOT_MET = 'CRITERIA_NOT_MET',
  ISSUED = 'ISSUED',
  DISPUTED = 'DISPUTED',
  CORRECTED = 'CORRECTED',
  REVOKED = 'REVOKED',
  EXPIRED = 'EXPIRED',
  ARCHIVED = 'ARCHIVED',
}

/** the four permitted credential-specific revocation/dispute grounds,
 * given verbatim (§Purpose & Scope, §Transitions) — the ONLY valid
 * grounds. Refund, payment lapse, sponsor cancellation, chargeback loss,
 * Community departure, and later price/policy changes are explicitly
 * NOT, by themselves, valid grounds (CL-011) — deliberately absent from
 * this enum so no code path can select them as a Credential-mutating
 * ground. */
export enum CredentialActionGround {
  UNMET_CRITERIA_POST_ISSUANCE = 'UNMET_CRITERIA_POST_ISSUANCE',
  PROVEN_INTEGRITY_OR_IDENTITY_ISSUE = 'PROVEN_INTEGRITY_OR_IDENTITY_ISSUE',
  ISSUER_ERROR_OR_DUPLICATE = 'ISSUER_ERROR_OR_DUPLICATE',
  LEGAL_OR_SAFETY_DECISION = 'LEGAL_OR_SAFETY_DECISION',
}

/**
 * Credential — an issued outcome record (certificate, badge, licence-
 * equivalent, official result) attached to a Person's learning history.
 * Distinct PLT-005 lifecycle family from Grade/Transcript/Portfolio
 * (CL-013) and Entitlement/Enrollment (CL-011/CL-012) — this machine
 * governs ONLY the Credential's own record and status. Uses this
 * codebase's established domain-owned state/version-column pattern.
 *
 * Binding separation (PLT-005): **Credential revocation is an event/
 * state, rather than deletion.** Revocation and correction never
 * overwrite the prior record — `supersedesCredentialId` links a new
 * version to what it supersedes, and the prior row remains fully
 * readable, satisfying CL-013's "revocation without historical deletion"
 * proof requirement.
 *
 * A payment-side event (chargeback, refund) is explicitly forbidden from
 * writing Credential state directly (CL-011) — it may only be a signal
 * to open a credential-specific case (moving this row to DISPUTED via
 * manual review), never a command that itself carries Credential-
 * mutating authority. That prohibition is enforced at the command-
 * handler layer; `disputeCaseRef` below is what a DISPUTED row points to
 * as its evidence.
 */
@Entity('credentials')
export class Credential {
  @PrimaryGeneratedColumn('uuid', { name: 'credential_id' })
  credentialId: string;

  /** the Person this credential is attached to. */
  @Column({ name: 'person_ref', type: 'jsonb' })
  personRef: Record<string, unknown>;

  /** which Credential type/definition this is an instance of (badge,
   * certificate, licence-equivalent, ...) — engineering synthesis for the
   * reference shape, since no separate CredentialDefinition table is
   * given a literal field list in the source text. */
  @Column({ name: 'credential_type_ref', type: 'jsonb' })
  credentialTypeRef: Record<string, unknown>;

  /** the EnrollmentCompleted event / CompletionSnapshot this credential
   * evaluation was triggered from. */
  @Column({ name: 'completion_snapshot_ref', type: 'jsonb', nullable: true })
  completionSnapshotRef?: Record<string, unknown>;

  @Column({
    type: 'enum',
    enum: CredentialState,
    default: CredentialState.PENDING_ISSUANCE,
  })
  state: CredentialState;

  @Column({ name: 'state_version', default: 0 })
  stateVersion: number;

  /** the credential-specific ground for a DISPUTED/REVOKED/CORRECTED
   * transition — one of the four permitted values, never inferred from a
   * payment-side event. */
  @Column({
    name: 'action_ground',
    type: 'enum',
    enum: CredentialActionGround,
    nullable: true,
  })
  actionGround?: CredentialActionGround;

  /** the credential-specific case (never a bare chargeback flag) backing
   * a DISPUTED status — a chargeback is a financial Dispute and is not
   * itself academic fraud (CL-011); this must reference a separate,
   * evidence-based integrity case. */
  @Column({ name: 'dispute_case_ref', type: 'jsonb', nullable: true })
  disputeCaseRef?: Record<string, unknown>;

  /** links this version to the prior Credential row it supersedes
   * (CORRECTED) or revokes-in-place-of (a re-ISSUED record after a
   * wrongful-revocation correction) — the prior row is never deleted or
   * overwritten. */
  @Column({ name: 'supersedes_credential_id', type: 'uuid', nullable: true })
  supersedesCredentialId?: string;

  /** validity-window expiry, where the Credential type carries one
   * (e.g. a time-boxed certification) — read by CL-012's
   * ComplianceEvaluation as a sponsor/compliance-reportable fact. */
  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt?: Date;

  @Column({ name: 'issued_at', type: 'timestamptz', nullable: true })
  issuedAt?: Date;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;
}
