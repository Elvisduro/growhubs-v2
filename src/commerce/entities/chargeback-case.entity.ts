import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** `04_Dispute.md` (FIN-001/CL-011) — the 9 named states verbatim, per
 * the canonical lifecycle `opened -> evidence_collection -> submitted ->
 * won/lost/partial -> recovery/write_off -> closed`. Initial: opened.
 * Terminal: closed. */
export enum ChargebackCaseState {
  OPENED = 'opened',
  EVIDENCE_COLLECTION = 'evidence_collection',
  SUBMITTED = 'submitted',
  WON = 'won',
  LOST = 'lost',
  PARTIAL = 'partial',
  RECOVERY = 'recovery',
  WRITE_OFF = 'write_off',
  CLOSED = 'closed',
}

/**
 * ChargebackCase — tracks a provider/buyer-bank-initiated dispute against
 * a Payment. **Chargeback is itself a form of Dispute, not a separate
 * machine.** A chargeback is NOT automatically treated as academic/
 * service fraud: it triggers a financial dispute and proportionate
 * access/payout handling only; any fraud/integrity finding requires a
 * separate, evidence-based integrity case. A `won` outcome resumes the
 * SAME underlying Enrollment/Order — never creates a new one — and never
 * deletes or rewrites learning/delivery truth. Registered as a PLT-005
 * canonical lifecycle family; uses this codebase's established domain-
 * owned state/version-column pattern.
 */
@Entity('chargeback_cases')
export class ChargebackCase {
  @PrimaryGeneratedColumn('uuid', { name: 'case_id' })
  caseId: string;

  @Column({ name: 'payment_id', type: 'uuid' })
  paymentId: string;

  @Column({
    type: 'enum',
    enum: ChargebackCaseState,
    default: ChargebackCaseState.OPENED,
  })
  state: ChargebackCaseState;

  @Column({ name: 'state_version', default: 0 })
  stateVersion: number;

  @Column({ name: 'provider_case_ref', type: 'jsonb' })
  providerCaseRef: Record<string, unknown>;

  @Column({ name: 'response_deadline_at', type: 'timestamptz', nullable: true })
  responseDeadlineAt?: Date;

  /** delivery proof, seller response, T&Cs — the evidence package
   * submitted to the provider/card network. */
  @Column({ name: 'evidence_package', type: 'jsonb', nullable: true })
  evidencePackage?: Record<string, unknown>;

  @Column({ name: 'ruling_evidence', type: 'jsonb', nullable: true })
  rulingEvidence?: Record<string, unknown>;

  /** reserve/hold amounts applied and released. */
  @Column({ name: 'reserve_hold_record', type: 'jsonb', default: {} })
  reserveHoldRecord: Record<string, unknown>;

  /** explicitly recorded, separately from the outcome: whether a
   * distinct integrity/fraud case was opened as a result — never
   * inferred automatically from the Dispute outcome. */
  @Column({ name: 'integrity_case_opened', default: false })
  integrityCaseOpened: boolean;

  @Column({ name: 'integrity_case_ref', type: 'jsonb', nullable: true })
  integrityCaseRef?: Record<string, unknown>;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;

  @Column({ name: 'closed_at', type: 'timestamptz', nullable: true })
  closedAt?: Date;
}
