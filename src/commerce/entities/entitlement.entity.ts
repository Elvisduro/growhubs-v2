import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** `07_Entitlement.md` (XD-008/PLT-005/PLT-006/FIN-001) — the 7 named
 * states verbatim. Initial: pending_grant. Terminal: revoked, expired.
 *
 * Load-bearing consequence (PLT-005 L1140): a downstream Entitlement
 * grant failure after a successful Payment is NEVER a silent no-op — it
 * becomes an urgent recoverable inconsistency, tracked and repaired as a
 * first-class failure state of this machine (grant_failed), not absorbed
 * into or masked by Payment/Order state. */
export enum EntitlementState {
  PENDING_GRANT = 'pending_grant',
  GRANTED = 'granted',
  GRANT_FAILED = 'grant_failed',
  RESTRICTED = 'restricted',
  SUSPENDED = 'suspended',
  REVOKED = 'revoked',
  EXPIRED = 'expired',
}

/**
 * Entitlement — a functional, grantable/revocable commercial right,
 * independent of the Payment/Order that funded it. XD-008 is explicit:
 * "Entitlement is commercial right; Enrollment delivery participation;
 * Membership Community relation; Role operational authority; Ticket
 * admission; Agreement Service relation; Workspace/Tenant Membership
 * scoped presence; ExplicitGrant bounded exception. **None substitutes
 * another.**" Also distinct from PLT-006's Allowance, Usage and
 * Financial Credit — an Entitlement authorises THAT a capability exists
 * at all; Allowance/Usage govern HOW MUCH of a metered resource it
 * includes. Registered as a PLT-005 canonical lifecycle family; uses
 * this codebase's established domain-owned state/version-column pattern.
 *
 * Revocation is an event/state, not a deletion — same principle as this
 * codebase's Credential entity.
 */
@Entity('entitlements')
export class Entitlement {
  @PrimaryGeneratedColumn('uuid', { name: 'entitlement_id' })
  entitlementId: string;

  /** target/tenant/capability/version snapshot at grant time. */
  @Column({ name: 'target_ref', type: 'jsonb' })
  targetRef: Record<string, unknown>;

  @Column({ name: 'capability_ref', type: 'jsonb' })
  capabilityRef: Record<string, unknown>;

  /** the triggering Payment/Order/Subscription/Bundle event —
   * idempotency key bound to it. */
  @Column({ name: 'triggering_event_ref', type: 'jsonb' })
  triggeringEventRef: Record<string, unknown>;

  @Column({
    type: 'enum',
    enum: EntitlementState,
    default: EntitlementState.PENDING_GRANT,
  })
  state: EntitlementState;

  @Column({ name: 'state_version', default: 0 })
  stateVersion: number;

  /** grant-failure evidence (error class, retry count) — urgent
   * recoverable inconsistency, routed to the Transition Repair Queue. */
  @Column({ name: 'grant_failure_evidence', type: 'jsonb', nullable: true })
  grantFailureEvidence?: Record<string, unknown>;

  /** restriction/suspension/revocation policy/case evidence — chargeback
   * reserve, RefundCase, Subscription grace/restricted/suspended, etc. */
  @Column({ name: 'policy_case_evidence', type: 'jsonb', nullable: true })
  policyCaseEvidence?: Record<string, unknown>;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt?: Date;

  @Column({ name: 'idempotency_key', unique: true })
  idempotencyKey: string;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;
}
