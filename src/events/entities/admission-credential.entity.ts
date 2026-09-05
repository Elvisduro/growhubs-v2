import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * `14_AdmissionCredential.md` (EV-005) — the 8 persistent lifecycle
 * states given verbatim, transcribed lowercase per the doc's own
 * convention (matching EventRegistration/ServiceAgreement/Milestone in
 * this codebase). `admitted`/`review`/`rejected` are explicitly
 * PER-ATTEMPT Admission Decision outcomes recorded as immutable Scan/
 * Operational Events — NOT the Credential's own persistent state — so
 * they are deliberately EXCLUDED from this enum; they belong on
 * AdmissionScanEvent below. The Credential itself only ever persists as
 * one of: pending, issued, transferred, revoked, expired, consumed
 * (`presented` is included here as a transient marker some
 * implementations may want to observe mid-evaluation, but per the doc's
 * own note a review/rejected decision does not by itself change
 * Credential state without a subsequent authorized action).
 */
export enum AdmissionCredentialState {
  PENDING = 'pending',
  ISSUED = 'issued',
  PRESENTED = 'presented',
  TRANSFERRED = 'transferred',
  REVOKED = 'revoked',
  EXPIRED = 'expired',
  CONSUMED = 'consumed',
}

/** the 3 named Admission Decision outcomes — per-attempt, recorded on
 * AdmissionScanEvent, never on the Credential's own state column. Given
 * verbatim (green/amber/red mapped to admitted/review/rejected). */
export enum AdmissionDecisionResult {
  ADMITTED = 'admitted',
  REVIEW = 'review',
  REJECTED = 'rejected',
}

/**
 * AdmissionCredential — the opaque, signed, scoped, expiring/revocable
 * machine-verifiable proof linked to a confirmed Registration's
 * entitlement/ticket assignment; the actual source of entry truth. The
 * Ticket Document/Wallet Pass (human-readable), this Credential
 * (cryptographic), the Scan/Operational Event, and the Attendance Record
 * are separate but linked objects — "the displayed QR/barcode is not the
 * admission truth." Registered as a PLT-005 canonical lifecycle family;
 * uses this codebase's established domain-owned state/version-column
 * pattern.
 */
@Entity('admission_credentials')
export class AdmissionCredential {
  @PrimaryGeneratedColumn('uuid', { name: 'credential_id' })
  credentialId: string;

  /** the confirmed Registration this credential is linked to —
   * Credential never mutates Registration state directly, event/command
   * only. */
  @Column({ name: 'registration_id', type: 'uuid' })
  registrationId: string;

  /** scope (Event/Occurrence/day/Session/zone), validity window,
   * holder/transfer policy declared at issuance — engineering synthesis
   * for the storage shape, categories transcribed from the doc. */
  @Column({ name: 'scope_and_policy', type: 'jsonb' })
  scopeAndPolicy: Record<string, unknown>;

  /** Standard/Enhanced/High — the 3 named assurance levels (§Purpose &
   * scope / transitions table), given verbatim. */
  @Column({ name: 'security_level' })
  securityLevel: string;

  @Column({
    type: 'enum',
    enum: AdmissionCredentialState,
    default: AdmissionCredentialState.PENDING,
  })
  state: AdmissionCredentialState;

  @Column({ name: 'state_version', default: 0 })
  stateVersion: number;

  /** versioned signing key reference — actual key material never lives
   * here, only the reference/version used, per ARIA-boundary rule
   * against exposing credential secrets. */
  @Column({ name: 'signing_key_ref', nullable: true })
  signingKeyRef?: string;

  @Column({ name: 'validity_expires_at', type: 'timestamptz', nullable: true })
  validityExpiresAt?: Date;

  /** which prior credential this one supersedes, for transfer/rotation —
   * exactly one active credential per admission unit; the prior row is
   * never deleted. */
  @Column({ name: 'supersedes_credential_id', type: 'uuid', nullable: true })
  supersedesCredentialId?: string;

  /** revocation trigger (refund, cancellation, fraud signal, key
   * compromise, bulk rotation) — remains visible in history with an
   * exact reason, never hidden. */
  @Column({ name: 'revocation_reason', type: 'jsonb', nullable: true })
  revocationReason?: Record<string, unknown>;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;
}

/**
 * AdmissionScanEvent — one immutable Scan/Operational Event: a single
 * presentation/lookup attempt at a gate/station, producing one Admission
 * Decision. Append-only, never mutated — an override AMENDS by adding a
 * new event referencing the original (which is retained, not deleted),
 * per the doc's explicit "original decision retained, not deleted" rule
 * and the Superadmin-boundary rule that scan evidence is never deleted
 * to "solve" an onsite exception.
 */
@Entity('admission_scan_events')
export class AdmissionScanEvent {
  @PrimaryGeneratedColumn('uuid', { name: 'scan_event_id' })
  scanEventId: string;

  @Column({ name: 'credential_id', type: 'uuid' })
  credentialId: string;

  @Column({
    name: 'decision_result',
    type: 'enum',
    enum: AdmissionDecisionResult,
  })
  decisionResult: AdmissionDecisionResult;

  /** exact reason shown for the decision (e.g. "revoked", "wrong zone",
   * "already consumed") — no unnecessary data exposed beyond this. */
  @Column({ name: 'decision_reason', type: 'jsonb' })
  decisionReason: Record<string, unknown>;

  @Column({ name: 'device_station_ref', type: 'jsonb' })
  deviceStationRef: Record<string, unknown>;

  /** device trust/time quality and sync provenance — needed for offline-
   * first reconciliation (two offline gates scanning the same static
   * credential is retained as a conflict, never silently resolved by
   * picking a winner). */
  @Column({ name: 'sync_provenance', type: 'jsonb', default: {} })
  syncProvenance: Record<string, unknown>;

  /** set when a REVIEW decision was later overridden by authorized staff
   * — the original event row is never edited or deleted; this column on
   * a LATER row references the amended-from event. */
  @Column({ name: 'override_of_scan_event_id', type: 'uuid', nullable: true })
  overrideOfScanEventId?: string;

  @Column({ name: 'override_authority_ref', type: 'jsonb', nullable: true })
  overrideAuthorityRef?: Record<string, unknown>;

  @Column({ name: 'event_time', type: 'timestamptz' })
  eventTime: Date;

  @Column({ name: 'recorded_at', type: 'timestamptz', default: () => 'now()' })
  recordedAt: Date;
}
