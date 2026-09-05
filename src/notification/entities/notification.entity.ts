import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

/**
 * `18_Notification.md` — the 16 named states exactly as given in the
 * doc's state table. Initial: CREATED. Terminal: DELIVERED_CONFIRMED,
 * READ_ACKNOWLEDGED, DELIVERY_FAILED_TERMINAL, SUPPRESSED, CANCELLED,
 * EXPIRED_UNSENT (SEND_FAILED_TERMINAL is terminal "unless escalated" —
 * modeled as non-terminal here since ESCALATION_FALLBACK is a real
 * further transition out of it in practice via the delivery-failure
 * path; the doc's own transition table only escalates out of
 * DELIVERY_FAILED_TERMINAL/DELIVERY_UNKNOWN, not SEND_FAILED_TERMINAL
 * directly — application code enforces the actual reachable transitions,
 * this enum only enumerates the state names).
 *
 * Binding constraint (PLT-005): **Notification sent is not delivered.**
 * SENT means the platform handed the message to a channel provider.
 * DELIVERED_CONFIRMED is a distinct, separately-tracked, provider-
 * confirmed event. No code path may infer one from the other.
 */
export enum NotificationState {
  CREATED = 'CREATED',
  ROUTING = 'ROUTING',
  SUPPRESSED = 'SUPPRESSED',
  QUEUED = 'QUEUED',
  SENDING = 'SENDING',
  SENT = 'SENT',
  SEND_FAILED_RETRYABLE = 'SEND_FAILED_RETRYABLE',
  SEND_FAILED_TERMINAL = 'SEND_FAILED_TERMINAL',
  DELIVERY_PENDING = 'DELIVERY_PENDING',
  DELIVERED_CONFIRMED = 'DELIVERED_CONFIRMED',
  READ_ACKNOWLEDGED = 'READ_ACKNOWLEDGED',
  DELIVERY_UNKNOWN = 'DELIVERY_UNKNOWN',
  DELIVERY_FAILED_TERMINAL = 'DELIVERY_FAILED_TERMINAL',
  ESCALATION_FALLBACK = 'ESCALATION_FALLBACK',
  CANCELLED = 'CANCELLED',
  EXPIRED_UNSENT = 'EXPIRED_UNSENT',
}

/** channel is named throughout the doc (email/SMS/push/in-app) but no
 * closed enum is given verbatim as a single list — the four channel
 * words ARE named in the text (§Purpose & scope line 7); listed here as
 * the minimal set actually named, flagged as a light synthesis for the
 * enum FORM only, not for inventing channel types beyond what's named. */
export enum NotificationChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
  IN_APP = 'IN_APP',
}

/**
 * Notification — a single addressed, channel-routed message derived from
 * a triggering domain event. This machine owns ONLY the notification
 * object's own lifecycle (creation to closure) and the fact/timing of
 * send vs. delivery vs. read — never the Universal Inbox/Home projection,
 * provider integration logic, or the source event itself. Registered as
 * a PLT-005 canonical lifecycle family; uses this codebase's established
 * domain-owned state/version-column pattern.
 *
 * Named non-reversal rule: a downstream Notification failure never
 * reverses a captured Payment, grants an Entitlement, or mutates any
 * upstream canonical object — failure is contained entirely within this
 * entity plus its own retry/escalation/compensation columns.
 */
@Entity('notifications')
@Index(['sourceEventId', 'notificationClassId'], { unique: true })
export class Notification {
  @PrimaryGeneratedColumn('uuid', { name: 'notification_id' })
  notificationId: string;

  /** idempotency key = (source event ID, notification-class/template ID)
   * — a replayed source event does not create a second Notification
   * instance. Enforced via the unique index above, not just documented. */
  @Column({ name: 'source_event_id' })
  sourceEventId: string;

  @Column({ name: 'notification_class_id' })
  notificationClassId: string;

  /** correlation/causation chain back to the triggering domain object —
   * e.g. OrderConfirmed, PaymentFailed, ModerationCaseResolved. */
  @Column({ name: 'correlation_ref', type: 'jsonb' })
  correlationRef: Record<string, unknown>;

  @Column({ name: 'recipient_ref', type: 'jsonb' })
  recipientRef: Record<string, unknown>;

  @Column({
    type: 'enum',
    enum: NotificationState,
    default: NotificationState.CREATED,
  })
  state: NotificationState;

  @Column({ name: 'state_version', default: 0 })
  stateVersion: number;

  @Column({ type: 'enum', enum: NotificationChannel, nullable: true })
  channel?: NotificationChannel;

  /** reason recorded at SUPPRESSED, plus the policy version that produced
   * it (consent/frequency-cap/quiet-hours) — per audit-evidence
   * requirement. */
  @Column({ name: 'suppression_reason', type: 'jsonb', nullable: true })
  suppressionReason?: Record<string, unknown>;

  @Column({ name: 'attempt_count', default: 0 })
  attemptCount: number;

  /** provider request/response identifiers — needed to deduplicate
   * provider delivery/failure webhooks against a provider-supplied
   * message ID (§Idempotency & concurrency notes). */
  @Column({ name: 'provider_refs', type: 'jsonb', default: {} })
  providerRefs: Record<string, unknown>;

  @Column({ name: 'sent_at', type: 'timestamptz', nullable: true })
  sentAt?: Date;

  @Column({ name: 'delivered_at', type: 'timestamptz', nullable: true })
  deliveredAt?: Date;

  @Column({ name: 'read_at', type: 'timestamptz', nullable: true })
  readAt?: Date;

  /** which prior Notification instance this one escalated/fell back from
   * — an ESCALATION_FALLBACK dispatch is correlated to the same source
   * event, NOT a new notification instance for idempotency purposes, per
   * the doc's transition table; stored here as a same-table self-
   * reference rather than minting a fresh idempotency key. */
  @Column({ name: 'escalated_from_id', type: 'uuid', nullable: true })
  escalatedFromId?: string;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;

  @Column({ name: 'closed_at', type: 'timestamptz', nullable: true })
  closedAt?: Date;
}
