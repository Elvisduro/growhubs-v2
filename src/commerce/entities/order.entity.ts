import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** `01_Order.md` (MS-011/FIN-001) — the 10 named states verbatim. Initial:
 * draft. Terminal: cancelled, closed. `disputed` is a non-terminal flag
 * state per the doc's own transition table (any non-terminal state can
 * enter it, and it returns to "prior state" on Dispute.closed). */
export enum OrderState {
  DRAFT = 'draft',
  CHECKOUT_PENDING = 'checkout_pending',
  PLACED = 'placed',
  CONFIRMED = 'confirmed',
  PARTIAL_FULFILMENT = 'partial_fulfilment',
  FULL_FULFILMENT = 'full_fulfilment',
  EXCEPTION = 'exception',
  CANCELLED = 'cancelled',
  DISPUTED = 'disputed',
  CLOSED = 'closed',
}

/**
 * Order — the commercial-intent record for a Checkout Session's resolved
 * line items. **The Order is not a payment state** — Order and Payment
 * are separate machines that reference each other by ID; Order tracks
 * commercial fulfilment/exception status, Payment tracks money movement.
 * Order is also not the Entitlement or Enrollment machine: it triggers
 * those via events but does not own their state. Registered as a
 * PLT-005 canonical lifecycle family; uses this codebase's established
 * domain-owned state/version-column pattern.
 *
 * Zero-value (free) Products follow the same states via a zero-value
 * Order/Registration/Entitlement path — never a fabricated Payment.
 */
@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid', { name: 'order_id' })
  orderId: string;

  @Column({ name: 'buyer_ref', type: 'jsonb' })
  buyerRef: Record<string, unknown>;

  /** exactly one resolvable Merchant of Record — single-MoR-per-Order
   * invariant. */
  @Column({ name: 'merchant_of_record_ref', type: 'jsonb' })
  merchantOfRecordRef: Record<string, unknown>;

  @Column({
    type: 'enum',
    enum: OrderState,
    default: OrderState.DRAFT,
  })
  state: OrderState;

  @Column({ name: 'state_version', default: 0 })
  stateVersion: number;

  /** line items, in progress until checkout_pending. */
  @Column({ type: 'jsonb', default: [] })
  lines: Record<string, unknown>[];

  /** the historical commercial/tax/policy snapshot frozen at `placed` —
   * retained unmodified regardless of later rule changes (FIN-001
   * L1520). MoR, seller, buyer/tax evidence, tax rule, FX, price/
   * discount/coupon/shipping/tax/fees, refund policy, invoice facts. */
  @Column({ name: 'frozen_snapshot', type: 'jsonb', nullable: true })
  frozenSnapshot?: Record<string, unknown>;

  /** the correlated Payment machine instance — Order does not own
   * Payment state, only references it. */
  @Column({ name: 'payment_ref', type: 'jsonb', nullable: true })
  paymentRef?: Record<string, unknown>;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;

  @Column({ name: 'closed_at', type: 'timestamptz', nullable: true })
  closedAt?: Date;
}
