import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * `11_ServiceAgreement.md` — the 7 named Agreement-object states, exactly
 * as given in the doc's state table (lowercase, transcribed verbatim from
 * the source — unlike this codebase's other machines which use
 * UPPER_SNAKE_CASE; kept as the doc's own casing since CS-002/CS-003 use
 * it consistently and this is a direct 1:1 transcription, not a
 * synthesis). `proposal_accepted` is explicitly a PRE-Agreement context
 * state, "included for context, not an Agreement state itself" — it is
 * NOT part of this enum; a ServiceAgreement row is only created once a
 * Proposal Version reaches ACCEPTED (Proposal itself is out of this
 * entity's scope, referenced only by ID). Initial: draft. Terminal:
 * amended (for that version only — the successor is a new row),
 * expired, declined, terminated, closed.
 */
export enum ServiceAgreementState {
  DRAFT = 'draft',
  PENDING_SIGNATURE = 'pending_signature',
  ACTIVE = 'active',
  AMENDED = 'amended',
  EXPIRED = 'expired',
  DECLINED = 'declined',
  TERMINATED = 'terminated',
  CLOSED = 'closed',
}

/**
 * ServiceAgreement (SOW) — the immutable accepted-obligation record for
 * Consulting & Service delivery, per CS-002/CS-003. **A Proposal is not
 * an Agreement** — "Proposal Accepted -> Agreement" is an explicit
 * transition between two distinct canonical objects, never a relabeling
 * of one object, so this entity references an accepted Proposal Version
 * by id/snapshot rather than embedding or extending a Proposal row
 * (Proposal itself remains out of this codebase's current scope, same as
 * the Delivery/Acceptance/Dispute machines the source doc flags TBD).
 *
 * Amendment NEVER overwrites an Agreement version in place: an `amended`
 * row is retained immutably, and `supersededByAgreementId` points to the
 * new draft->pending_signature->active chain for the successor version —
 * same non-destructive-version pattern as this codebase's Credential
 * entity (CORRECTED linking via supersedesCredentialId) and TorvetSurface/
 * TorvetProjection's read-model-never-writes-back discipline.
 *
 * Registered as a PLT-005 canonical lifecycle family; uses this
 * codebase's established domain-owned state/version-column pattern
 * (state + stateVersion), with the caveat that the ENUM VALUES here are
 * lowercase per the source doc's own transcription, unlike other
 * families in this codebase.
 */
@Entity('service_agreements')
export class ServiceAgreement {
  @PrimaryGeneratedColumn('uuid', { name: 'agreement_id' })
  agreementId: string;

  /** the exactly-one accepted Proposal Version this Agreement was created
   * from — Proposal and Agreement remain separate objects/IDs (CS-002). */
  @Column({ name: 'proposal_version_ref', type: 'jsonb' })
  proposalVersionRef: Record<string, unknown>;

  /** Offer/Price and applicable policy versions referenced at draft
   * creation — immutable snapshot references, not live joins, per the
   * doc's "retains immutable references to every version that governed
   * acceptance and activation" audit requirement. */
  @Column({ name: 'offer_price_ref', type: 'jsonb', nullable: true })
  offerPriceRef?: Record<string, unknown>;

  @Column({ name: 'policy_version_refs', type: 'jsonb', default: {} })
  policyVersionRefs: Record<string, unknown>;

  @Column({
    type: 'enum',
    enum: ServiceAgreementState,
    default: ServiceAgreementState.DRAFT,
  })
  state: ServiceAgreementState;

  @Column({ name: 'state_version', default: 0 })
  stateVersion: number;

  /** parties, scope, milestones, commercial/payment/refund terms,
   * privacy/rights/recording/reporting terms, validity period — the
   * required-complete-before-pending_signature content set named in the
   * transitions table. Engineering synthesis for the storage shape (no
   * literal field-by-field table given), the required CATEGORIES
   * themselves are transcribed from the doc, not invented. */
  @Column({ type: 'jsonb' })
  content: Record<string, unknown>;

  @Column({ name: 'validity_expires_at', type: 'timestamptz', nullable: true })
  validityExpiresAt?: Date;

  /** signatory authority, method, timestamp, disclosures and evidence
   * recorded at pending_signature -> active — a commercial signature does
   * not imply unrelated participant consent, so this is the SIGNING
   * evidence specifically, not a general consent record. */
  @Column({ name: 'signature_evidence', type: 'jsonb', nullable: true })
  signatureEvidence?: Record<string, unknown>;

  /** which prior Agreement version this row's amendment/successor chain
   * derives from, if any — null for an original (non-amended-into)
   * Agreement. */
  @Column({ name: 'predecessor_agreement_id', type: 'uuid', nullable: true })
  predecessorAgreementId?: string;

  /** set when this version is superseded by an amendment — the version
   * itself is retained immutably (state moves to `amended`), never
   * deleted or rewritten. */
  @Column({ name: 'superseded_by_agreement_id', type: 'uuid', nullable: true })
  supersededByAgreementId?: string;

  /** termination reason, effective time and unresolved-obligation
   * disposition, per CS-005 — required at `terminated`. */
  @Column({ name: 'termination_record', type: 'jsonb', nullable: true })
  terminationRecord?: Record<string, unknown>;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;

  @Column({ name: 'closed_at', type: 'timestamptz', nullable: true })
  closedAt?: Date;
}
