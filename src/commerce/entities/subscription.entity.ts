import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** `05_Subscription.md` (PLT-005/PLT-006/XD-008/MS-011) — the 7 named
 * states verbatim. Initial: pending_activation. Terminal: ended.
 *
 * Binding separation: **"cancel scheduled is not ended"** — a
 * cancel_scheduled Subscription still has active access through its
 * paid-through period. */
export enum SubscriptionState {
  PENDING_ACTIVATION = 'pending_activation',
  ACTIVE = 'active',
  GRACE = 'grace',
  RESTRICTED = 'restricted',
  SUSPENDED = 'suspended',
  CANCEL_SCHEDULED = 'cancel_scheduled',
  ENDED = 'ended',
}

/**
 * Subscription — the billing-contract lifecycle for a recurring
 * commercial relationship, independent of the Entitlement(s) it
 * provisions and the Payment(s) that fund it. Deliberately not
 * Entitlement (PLT-006 separates functional Entitlement, included
 * Allowance, measured Usage and monetary Financial Credit — Subscription
 * is the upstream billing contract that AUTHORISES an Allowance to flow
 * into one or more Entitlements, it does not itself grant access) and
 * not Payment (each billing period's charge is a distinct Payment-
 * machine instance). Registered as a PLT-005 canonical lifecycle family;
 * uses this codebase's established domain-owned state/version-column
 * pattern.
 */
@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid', { name: 'subscription_id' })
  subscriptionId: string;

  @Column({ name: 'buyer_ref', type: 'jsonb' })
  buyerRef: Record<string, unknown>;

  @Column({ name: 'plan_offer_ref', type: 'jsonb' })
  planOfferRef: Record<string, unknown>;

  @Column({ name: 'mor_tax_currency_snapshot', type: 'jsonb' })
  morTaxCurrencySnapshot: Record<string, unknown>;

  @Column({
    type: 'enum',
    enum: SubscriptionState,
    default: SubscriptionState.PENDING_ACTIVATION,
  })
  state: SubscriptionState;

  @Column({ name: 'state_version', default: 0 })
  stateVersion: number;

  /** period-boundary renewal is keyed by (Subscription ID, period index)
   * so a replayed scheduler tick cannot double-renew or double-charge. */
  @Column({ name: 'current_period_index', default: 0 })
  currentPeriodIndex: number;

  /** the correlated Payment-machine instance for the current period. */
  @Column({ name: 'current_period_payment_ref', type: 'jsonb', nullable: true })
  currentPeriodPaymentRef?: Record<string, unknown>;

  @Column({ name: 'grace_timer_started_at', type: 'timestamptz', nullable: true })
  graceTimerStartedAt?: Date;

  @Column({ name: 'restriction_timer_started_at', type: 'timestamptz', nullable: true })
  restrictionTimerStartedAt?: Date;

  @Column({ name: 'paid_through_at', type: 'timestamptz', nullable: true })
  paidThroughAt?: Date;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;

  @Column({ name: 'ended_at', type: 'timestamptz', nullable: true })
  endedAt?: Date;
}
