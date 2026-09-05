import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** PF-012 §6.1 (PF-C0547) — the exact 6 named trigger kinds. */
export enum OrganizationRecoveryTriggerKind {
  DEATH = 'DEATH',
  INCAPACITY = 'INCAPACITY',
  DEPARTURE = 'DEPARTURE',
  DISPUTE = 'DISPUTE',
  COMPROMISE = 'COMPROMISE',
  ADMINISTRATIVE_LOCKOUT = 'ADMINISTRATIVE_LOCKOUT',
}

/** PF-012 §6.1 (PF-C0547) — the 10 named lifecycle states (APPROVED/DENIED
 * read as two distinct slash-separated branch values, same convention used
 * throughout this codebase for CL-011's seller_failure/platform_failure
 * and CL-012's NOT_APPLICABLE/NOT_ASSIGNED). "Appeal and reopening
 * branches" are named as categories, not individual values, in the
 * approved text — left unenumerated here rather than invented. */
export enum OrganizationRecoveryState {
  REPORTED = 'REPORTED',
  CONTAINED = 'CONTAINED',
  EVIDENCE_COLLECTION = 'EVIDENCE_COLLECTION',
  REVIEW = 'REVIEW',
  INTERIM_CONTROL = 'INTERIM_CONTROL',
  APPROVED = 'APPROVED',
  DENIED = 'DENIED',
  HANDOVER = 'HANDOVER',
  MONITORED = 'MONITORED',
  CLOSED = 'CLOSED',
}

/**
 * PF-012 §6.1 (PF-C0547) — OrganizationRecoveryCase: covers founder/owner
 * death, incapacity, departure, dispute, compromise, and administrative
 * lockout.
 *
 * Emergency access during a recovery case is least-privilege, time-boxed,
 * and dual-controlled for sensitive actions (PF-C0548) — mirrors XD-008's
 * Superadmin emergency-access rules (XD-C0634-C0635) at the organization-
 * continuity layer. CRITICAL PROHIBITION (PF-C0549): emergency access
 * cannot silently alter MoR, beneficiary, payout destination, domain
 * ownership, retention, legal hold, or historical truth — enforced at the
 * application/authority layer (an OrganizationRecoveryCase's
 * emergency-access grants must never be issued with those capabilities),
 * not expressible as a column constraint here.
 *
 * Governance invariant 3 (PF-C0573): succession never activates solely
 * from an AI inference or an unverified message — nothing in this schema
 * lets `state` transition to INTERIM_CONTROL/APPROVED/HANDOVER except
 * through the verified-evidence path this table's `evidenceRefs` and
 * §6.3's human/specialist review represent; that is an application-layer
 * guarantee this table's structure supports (append-only state history via
 * PLT-005 wiring, once this family is registered there) but does not by
 * itself enforce at the database level.
 */
@Entity('organization_recovery_cases')
export class OrganizationRecoveryCase {
  @PrimaryGeneratedColumn('uuid', { name: 'recovery_case_id' })
  recoveryCaseId: string;

  @Column({ name: 'organization_id', type: 'uuid' })
  organizationId: string;

  @Column({ name: 'trigger_kind', type: 'enum', enum: OrganizationRecoveryTriggerKind })
  triggerKind: OrganizationRecoveryTriggerKind;

  @Column({
    type: 'enum',
    enum: OrganizationRecoveryState,
    default: OrganizationRecoveryState.REPORTED,
  })
  state: OrganizationRecoveryState;

  /** jurisdiction- and case-sensitive, minimised, encrypted, retention-
   * classed, visible only to authorised specialists (§6.3, PF-C0552) —
   * the encryption/visibility controls themselves are an
   * infrastructure/access-policy concern layered on top of this column,
   * not expressed by the column's type. */
  @Column({ name: 'evidence_refs', type: 'jsonb', default: [] })
  evidenceRefs: Record<string, unknown>[];
}
