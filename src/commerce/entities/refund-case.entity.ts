import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** `03_Refund.md` (FIN-001/CL-011) — the 9 named states verbatim.
 * Initial: requested. Terminal: closed (rejected is terminal "unless
 * appealed," modeled as non-terminal here since appeal is a real further
 * transition the doc's own table describes). */
export enum RefundCaseState {
  REQUESTED = 'requested',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  APPEAL_PENDING = 'appeal_pending',
  PROVIDER_PROCESSING = 'provider_processing',
  PROVIDER_REFUNDED = 'provider_refunded',
  FAILED = 'failed',
  CLOSED = 'closed',
}

/**
 * RefundCase — a full or partial reversal request against a Payment, from
 * initiation through review, approval, provider processing, and result.
 * **"Refund approved" and "provider-refunded" are two distinct states/
 * events, not one** — approval is a business/policy decision; provider
 * confirmation is a separate financial fact only the Payment machine can
 * report. The Refund machine never itself moves money — it commands
 * Payment to do so and waits for Payment's event. Registered as a
 * PLT-005 canonical lifecycle family; uses this codebase's established
 * domain-owned state/version-column pattern.
 */
@Entity('refund_cases')
export class RefundCase {
  @PrimaryGeneratedColumn('uuid', { name: 'refund_case_id' })
  refundCaseId: string;

  @Column({ name: 'payment_id', type: 'uuid' })
  paymentId: string;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  /** reason classified: customer/cooling-off, seller cancellation,
   * stock/delivery failure, event cancellation, duplicate, fraud,
   * goodwill, rights restriction, platform failure, legal requirement —
   * the 10 named reason categories, given verbatim. */
  @Column({ name: 'reason_category' })
  reasonCategory: string;

  @Column({ name: 'initiator_ref', type: 'jsonb' })
  initiatorRef: Record<string, unknown>;

  @Column({ name: 'lines_quantities', type: 'jsonb' })
  linesQuantities: Record<string, unknown>;

  @Column({
    type: 'enum',
    enum: RefundCaseState,
    default: RefundCaseState.REQUESTED,
  })
  state: RefundCaseState;

  @Column({ name: 'state_version', default: 0 })
  stateVersion: number;

  /** amount, tax treatment, cash-vs-credit restoration, fee/
   * responsibility allocation — fixed at APPROVED, funds not yet moved. */
  @Column({ name: 'approval_record', type: 'jsonb', nullable: true })
  approvalRecord?: Record<string, unknown>;

  /** the linked CommercialLearningCase, if this Order was a learning-
   * commercial Order (CL-011) — a generic-boolean "refunded" flag is
   * deliberately not used. */
  @Column({ name: 'commercial_learning_case_ref', type: 'jsonb', nullable: true })
  commercialLearningCaseRef?: Record<string, unknown>;

  @Column({ name: 'provider_refund_ref', type: 'jsonb', nullable: true })
  providerRefundRef?: Record<string, unknown>;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;

  @Column({ name: 'closed_at', type: 'timestamptz', nullable: true })
  closedAt?: Date;
}
