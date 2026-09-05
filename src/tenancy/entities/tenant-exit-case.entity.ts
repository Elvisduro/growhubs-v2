import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** `CORE-C2158` (TEN-001, GOV-002 EXECUTED, `MASTER_SPEC.md:1540`) — the
 * 10 named exit types verbatim: "Tenant exit distinguishes cancel-plan,
 * downgrade, dormancy, transfer, agency handover, merge, split, voluntary
 * closure, platform-enforced closure and insolvency/succession." */
export enum TenantExitType {
  CANCEL_PLAN = 'CANCEL_PLAN',
  DOWNGRADE = 'DOWNGRADE',
  DORMANCY = 'DORMANCY',
  TRANSFER = 'TRANSFER',
  AGENCY_HANDOVER = 'AGENCY_HANDOVER',
  MERGE = 'MERGE',
  SPLIT = 'SPLIT',
  VOLUNTARY_CLOSURE = 'VOLUNTARY_CLOSURE',
  PLATFORM_ENFORCED_CLOSURE = 'PLATFORM_ENFORCED_CLOSURE',
  INSOLVENCY_OR_SUCCESSION = 'INSOLVENCY_OR_SUCCESSION',
}

/** `CORE-C2159` — the 10 linear closure-lifecycle states plus 5 named
 * branches, given verbatim: "Closure lifecycle is requested→eligibility
 * check→export preparing→financial reconciliation→access transition→
 * grace period→restriction→closure execution→retention-only→completed,
 * with cancelled/disputed/legal-hold/safety-hold/succession branches."
 * Initial: REQUESTED. Terminal: COMPLETED (CANCELLED is also terminal —
 * an exit that never proceeds). `CORE-C2192`: **"Closure is not blind
 * deletion"** — RETENTION_ONLY retains records per `PLT-001`, it is not
 * erasure. */
export enum TenantExitCaseState {
  REQUESTED = 'REQUESTED',
  ELIGIBILITY_CHECK = 'ELIGIBILITY_CHECK',
  EXPORT_PREPARING = 'EXPORT_PREPARING',
  FINANCIAL_RECONCILIATION = 'FINANCIAL_RECONCILIATION',
  ACCESS_TRANSITION = 'ACCESS_TRANSITION',
  GRACE_PERIOD = 'GRACE_PERIOD',
  RESTRICTION = 'RESTRICTION',
  CLOSURE_EXECUTION = 'CLOSURE_EXECUTION',
  RETENTION_ONLY = 'RETENTION_ONLY',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DISPUTED = 'DISPUTED',
  LEGAL_HOLD = 'LEGAL_HOLD',
  SAFETY_HOLD = 'SAFETY_HOLD',
  SUCCESSION = 'SUCCESSION',
}

/**
 * TenantExitCase — TEN-001, GOV-002 EXECUTED but with no dedicated
 * `TEN-001_*_SCHEMA_v1.md` document yet; grounded directly in
 * `gov002_repaired/CORE_repaired.md` rows `CORE-C2158`–`CORE-C2197`
 * (same discipline as `15_Publication.md` and this codebase's PLT-006
 * entities — formalized from the decision's own stated lifecycle/
 * taxonomy, nothing invented beyond it).
 *
 * Governed invariants directly enforced by this shape (all `CORE-Cxxxx`,
 * `MASTER_SPEC.md:1540-1556`): exit/transfer/export are INDEPENDENT
 * governed actions (`CORE-C2160`) — this entity tracks the CLOSURE
 * lifecycle only, never folding ownership-transfer or export-grant logic
 * into itself; exports EXCLUDE other-controller/cross-tenant data,
 * private third-party comms, Trust & Safety/fraud/security evidence,
 * legal holds, ARIA policy/model data, rights-restricted and protected
 * child-safety material (`CORE-C2162`) — `exportScope` records only what
 * was actually included, per `CORE-C2161`'s permitted-inclusion list;
 * financial reconciliation resolves or RESERVES payments/refunds/
 * disputes/chargebacks/tax/subscriptions/coupons/Entitlements/partner
 * allocations rather than silently dropping them (`CORE-C2174`); GrowHubs
 * never withholds funds without basis and never pays around risk/tax
 * controls (`CORE-C2177`/`CORE-C2178`); an AccessTransitionPlan
 * (`CORE-C2171`) is mandatory before/through ACCESS_TRANSITION so paid
 * customers are never silently stranded (`CORE-C2173`/`CORE-C2196`);
 * Person/Account/LearnerRecord/Passport/Credential-provenance continuity
 * is NEVER part of this case's own data — those survive independently
 * under `PF-011`/`CL-013`/`09_Credential.md` (`CORE-C2164`-`C2167`,
 * `C2193`) and are deliberately NOT columns here.
 */
@Entity('tenant_exit_cases')
export class TenantExitCase {
  @PrimaryGeneratedColumn('uuid', { name: 'exit_case_id' })
  exitCaseId: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ name: 'exit_type', type: 'enum', enum: TenantExitType })
  exitType: TenantExitType;

  @Column({
    type: 'enum',
    enum: TenantExitCaseState,
    default: TenantExitCaseState.REQUESTED,
  })
  state: TenantExitCaseState;

  @Column({ name: 'state_version', default: 0 })
  stateVersion: number;

  /** eligibility check result at ELIGIBILITY_CHECK. */
  @Column({ name: 'eligibility_evidence', type: 'jsonb', nullable: true })
  eligibilityEvidence?: Record<string, unknown>;

  /** the actual export produced — scope, requester/purpose, snapshot,
   * encryption, expiry, download log and revocation, per CORE-C2163's
   * mandatory export-binding fields; scope itself bounded by CORE-C2161
   * (inclusions) / CORE-C2162 (exclusions). */
  @Column({ name: 'export_record', type: 'jsonb', nullable: true })
  exportRecord?: Record<string, unknown>;

  /** resolves-or-reserves payments/refunds/disputes/chargebacks/tax/
   * subscriptions/coupons/Entitlements/partner allocations (CORE-C2174). */
  @Column({ name: 'financial_reconciliation_record', type: 'jsonb', nullable: true })
  financialReconciliationRecord?: Record<string, unknown>;

  /** notice, Course/Community/Event/Service access, alternative delivery/
   * refund, subscriptions, scheduled bookings/events, downloads, physical
   * orders, support contact, export deadline, white-label/domain
   * behavior, public/Torvet status and partner obligations — the full
   * AccessTransitionPlan shape per CORE-C2171. */
  @Column({ name: 'access_transition_plan', type: 'jsonb', nullable: true })
  accessTransitionPlan?: Record<string, unknown>;

  @Column({ name: 'grace_period_ends_at', type: 'timestamptz', nullable: true })
  gracePeriodEndsAt?: Date;

  /** legal/safety/dispute/succession hold evidence when the case is in
   * one of those branch states. */
  @Column({ name: 'hold_evidence', type: 'jsonb', nullable: true })
  holdEvidence?: Record<string, unknown>;

  @Column({ name: 'requested_at', type: 'timestamptz', default: () => 'now()' })
  requestedAt: Date;

  @Column({ name: 'closed_at', type: 'timestamptz', nullable: true })
  closedAt?: Date;
}
