import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** `02_Payment.md` (MS-011/FIN-001) — the 11 named states verbatim.
 * Initial: created. Terminal: failed, closed.
 *
 * Binding separation: **authorised, captured, and settled are three
 * distinct states and must never be collapsed** — funds reserved vs.
 * funds taken vs. funds cleared to the seller-payable ledger are
 * different legal/financial facts. */
export enum PaymentState {
  CREATED = 'created',
  ACTION_REQUIRED = 'action_required',
  PROCESSING = 'processing',
  AUTHORISED = 'authorised',
  CAPTURED = 'captured',
  SETTLED = 'settled',
  FAILED = 'failed',
  REFUND_PENDING = 'refund_pending',
  REFUNDED = 'refunded',
  DISPUTED = 'disputed',
  UNKNOWN = 'unknown',
  CLOSED = 'closed',
}

/**
 * Payment — tracks the money-movement lifecycle for one Order's total
 * (or a scoped subset). Deliberately not the Order machine — Order
 * tracks commercial fulfilment, Payment tracks funds. GrowHubs is MoR
 * only for its own subscriptions/add-ons/ARIA packages/platform
 * services; for member-created products the member is MoR, recorded on
 * every event. Registered as a PLT-005 canonical lifecycle family; uses
 * this codebase's established domain-owned state/version-column pattern.
 */
@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid', { name: 'payment_id' })
  paymentId: string;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  @Column({ name: 'mor_tax_currency_snapshot', type: 'jsonb' })
  morTaxCurrencySnapshot: Record<string, unknown>;

  @Column({
    type: 'enum',
    enum: PaymentState,
    default: PaymentState.CREATED,
  })
  state: PaymentState;

  @Column({ name: 'state_version', default: 0 })
  stateVersion: number;

  /** provider request/response/auth/capture/settlement/refund/dispute
   * evidence references — the money-movement layer, kept separate and
   * cross-referenced from GrowHubs' own double-entry ledger. */
  @Column({ name: 'provider_evidence', type: 'jsonb', default: {} })
  providerEvidence: Record<string, unknown>;

  /** the specific ledger entries posted at settlement/refund/dispute
   * resolution (or explicit note that none were posted yet, e.g. at
   * authorised) — reversal/replacement entries only, settled facts are
   * never edited or deleted. */
  @Column({ name: 'ledger_entries', type: 'jsonb', default: [] })
  ledgerEntries: Record<string, unknown>[];

  @Column({ name: 'idempotency_key', unique: true })
  idempotencyKey: string;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;

  @Column({ name: 'closed_at', type: 'timestamptz', nullable: true })
  closedAt?: Date;
}
