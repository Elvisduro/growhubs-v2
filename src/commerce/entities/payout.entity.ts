import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** `06_Payout.md` (FIN-001/MS-011) — the 11 named states verbatim.
 * Initial: earned. Terminal: paid, reversed. */
export enum PayoutState {
  EARNED = 'earned',
  PENDING_CLEARANCE = 'pending_clearance',
  AVAILABLE = 'available',
  SCHEDULED = 'scheduled',
  IN_TRANSIT = 'in_transit',
  PAID = 'paid',
  HELD = 'held',
  FAILED = 'failed',
  RETURNED = 'returned',
  REVERSED = 'reversed',
  DISPUTED = 'disputed',
}

/**
 * Payout — tracks the movement of a seller's (or GrowHubs') settled-and-
 * payable ledger balance out to its external beneficiary account.
 * Deliberately not Payment, Refund, Fee, Reserve or LedgerEntry — these
 * seven objects stay distinct. Payout settles a payable the ledger
 * already recognises; it never itself creates revenue. Registered as a
 * PLT-005 canonical lifecycle family; uses this codebase's established
 * domain-owned state/version-column pattern.
 */
@Entity('payouts')
export class Payout {
  @PrimaryGeneratedColumn('uuid', { name: 'payout_id' })
  payoutId: string;

  @Column({ name: 'beneficiary_ref', type: 'jsonb' })
  beneficiaryRef: Record<string, unknown>;

  @Column({ name: 'mor_ref', type: 'jsonb' })
  morRef: Record<string, unknown>;

  @Column({
    type: 'enum',
    enum: PayoutState,
    default: PayoutState.EARNED,
  })
  state: PayoutState;

  @Column({ name: 'state_version', default: 0 })
  stateVersion: number;

  @Column({ name: 'amount_ref', type: 'jsonb' })
  amountRef: Record<string, unknown>;

  /** reserve/hold policy and evidence tracked separately from the
   * available balance. */
  @Column({ name: 'reserve_hold_record', type: 'jsonb', default: {} })
  reserveHoldRecord: Record<string, unknown>;

  /** KYC/KYB, beneficiary account, applicable TaxPack — no Payout occurs
   * on missing identity/beneficiary/TaxPack (FIN-001 L1526). */
  @Column({ name: 'eligibility_check', type: 'jsonb', nullable: true })
  eligibilityCheck?: Record<string, unknown>;

  @Column({ name: 'provider_instruction_ref', type: 'jsonb', nullable: true })
  providerInstructionRef?: Record<string, unknown>;

  @Column({ name: 'ledger_entries', type: 'jsonb', default: [] })
  ledgerEntries: Record<string, unknown>[];

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;

  @Column({ name: 'paid_at', type: 'timestamptz', nullable: true })
  paidAt?: Date;
}
