import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * `13_EventRegistration.md` (EV-004) — the 11 named states exactly as
 * given in the doc's state table (lowercase, transcribed verbatim, same
 * convention as this codebase's Consulting & Service module). Initial:
 * not_open (contextual pre-state) / browsing_hold in practice for a real
 * Registration row (not_open describes the Ticket Type's own visibility,
 * not a Registration instance — a Registration row is only created at
 * browsing_hold or later; see class doc comment). Terminal: hold_expired
 * (for that attempt), cancelled, refunded, closed.
 *
 * Registration, attendee identity, Order, Entitlement, ticket/pass,
 * check-in and attendance remain DISTINCT states (EV-004) — Registration
 * never implies marketing consent or attendance. The Ticket/scan/check-in
 * lifecycle is a wholly separate machine (AdmissionCredential, EV-005) —
 * "Ticket presented/scanned is not admission accepted" is enforced by
 * keeping them as genuinely separate tables, never collapsed into one.
 */
export enum EventRegistrationState {
  NOT_OPEN = 'not_open',
  BROWSING_HOLD = 'browsing_hold',
  HOLD_EXPIRED = 'hold_expired',
  PENDING_PAYMENT = 'pending_payment',
  CONFIRMED = 'confirmed',
  WAITLISTED = 'waitlisted',
  WAITLIST_OFFER_PENDING = 'waitlist_offer_pending',
  TRANSFERRED = 'transferred',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  CLOSED = 'closed',
}

/**
 * EventRegistration — one person's declared/approved participation
 * relationship to an admission scope (Event/Occurrence/Session/Ticket
 * Type), distinct from the purchaser, Order, Ticket credential, check-in
 * and Attendance. This entity covers Registration and the commercial
 * Ticket/Order/Entitlement handshake that produces it; it does NOT own
 * Order/Payment (Commerce truth, referenced by id) or the Admission
 * Credential/scan/check-in lifecycle (a wholly separate table, see
 * admission-credential.entity.ts). Registered as a PLT-005 canonical
 * lifecycle family; uses this codebase's established domain-owned
 * state/version-column pattern.
 *
 * A `confirmed` Registration is a necessary but NOT sufficient condition
 * for admission — admission truth lives entirely in AdmissionCredential.
 */
@Entity('event_registrations')
export class EventRegistration {
  @PrimaryGeneratedColumn('uuid', { name: 'registration_id' })
  registrationId: string;

  @Column({ name: 'person_ref', type: 'jsonb' })
  personRef: Record<string, unknown>;

  /** the purchaser, if different from the registrant (e.g. someone buys
   * tickets for a group) — deliberately separate from personRef per
   * EV-004's distinct-identities rule. */
  @Column({ name: 'purchaser_ref', type: 'jsonb', nullable: true })
  purchaserRef?: Record<string, unknown>;

  /** the exact admission scope: Event/Occurrence/Session/Ticket Type —
   * and the single authoritative Inventory Pool referenced (configured
   * Ticket Type quantities never multiply pool capacity, EV-004
   * invariant #2). */
  @Column({ name: 'admission_scope_ref', type: 'jsonb' })
  admissionScopeRef: Record<string, unknown>;

  @Column({ name: 'inventory_pool_ref', type: 'jsonb' })
  inventoryPoolRef: Record<string, unknown>;

  @Column({
    type: 'enum',
    enum: EventRegistrationState,
    default: EventRegistrationState.BROWSING_HOLD,
  })
  state: EventRegistrationState;

  @Column({ name: 'state_version', default: 0 })
  stateVersion: number;

  /** the atomic, time-bounded inventory hold — idempotency key +
   * expected version live here per §Idempotency & concurrency. */
  @Column({ name: 'hold_idempotency_key', unique: true })
  holdIdempotencyKey: string;

  @Column({ name: 'hold_expires_at', type: 'timestamptz', nullable: true })
  holdExpiresAt?: Date;

  /** Order/Payment references — Commerce owns the truth, this is a
   * pointer only. */
  @Column({ name: 'order_ref', type: 'jsonb', nullable: true })
  orderRef?: Record<string, unknown>;

  /** the resulting Entitlement, granted at CONFIRMED — Access owns the
   * entitlement truth, this is a pointer only. */
  @Column({ name: 'entitlement_ref', type: 'jsonb', nullable: true })
  entitlementRef?: Record<string, unknown>;

  /** ordered Waitlist Entry — present only while WAITLISTED/
   * WAITLIST_OFFER_PENDING; joining creates no charge, Order, or
   * guaranteed admission. */
  @Column({ name: 'waitlist_entry_ref', type: 'jsonb', nullable: true })
  waitlistEntryRef?: Record<string, unknown>;

  @Column({ name: 'waitlist_offer_expires_at', type: 'timestamptz', nullable: true })
  waitlistOfferExpiresAt?: Date;

  /** which prior Registration this one transferred from, if any —
   * original purchaser/payment history is never rewritten. */
  @Column({ name: 'transferred_from_registration_id', type: 'uuid', nullable: true })
  transferredFromRegistrationId?: string;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;

  @Column({ name: 'closed_at', type: 'timestamptz', nullable: true })
  closedAt?: Date;
}
