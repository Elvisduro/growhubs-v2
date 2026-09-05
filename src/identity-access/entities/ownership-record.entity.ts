import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * PF-012 §4.1 (PF-C0540-C0541) — OwnershipRecord: identifies the legally/
 * economically accountable owner — explicitly SEPARATE from the
 * operational Tenant Owner or administrator roles (which live in
 * RoleAssignment). The person who legally owns the business is not
 * automatically the same as whoever holds the day-to-day admin role.
 */
@Entity('ownership_records')
export class OwnershipRecord {
  @PrimaryGeneratedColumn('uuid', { name: 'ownership_record_id' })
  ownershipRecordId: string;

  @Column({ name: 'organization_id', type: 'uuid' })
  organizationId: string;

  /** the accountable party, distinct from Tenant Owner */
  @Column({ name: 'legal_owner_ref' })
  legalOwnerRef: string;

  @Column({ name: 'ownership_evidence', type: 'jsonb' })
  ownershipEvidence: Record<string, unknown>;

  @Column({ name: 'effective_from', type: 'timestamptz', default: () => 'now()' })
  effectiveFrom: Date;
}

/** PF-012 §4.2 (PF-C0542) — no exact enum-value list is given for transfer
 * status; this is an engineering synthesis of the named process steps
 * (verified parties, authority evidence, conflict/compliance checks,
 * protected handover, notification, cooling-off/dual control, immutable
 * audit, rollback/appeal), flagged explicitly. */
export enum OwnershipTransferStatus {
  PROPOSED = 'PROPOSED',
  PARTIES_VERIFIED = 'PARTIES_VERIFIED',
  COOLING_OFF = 'COOLING_OFF',
  APPROVED = 'APPROVED',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
  APPEALED = 'APPEALED',
}

/**
 * PF-012 §4.2 (PF-C0542-C0543) — OwnershipTransfer: the immutable audit
 * trail of one ownership change. Requires verified parties, authority
 * evidence, conflict and compliance checks, protected financial/domain/
 * data handover, notification, cooling-off or dual control where risk
 * requires it, immutable audit, and rollback/appeal handling (PF-C0542).
 * Must preserve historical attribution, contracts, learning records,
 * payouts, and tax evidence (PF-C0543) — new ownership never rewrites who
 * did what before the change, which is exactly why this is its own
 * append-only row rather than an UPDATE to OwnershipRecord.
 *
 * This is also the mechanism TEN-001's tenant-transfer contract invokes
 * directly (CORE-C2179, PF-012 §4.2) — TEN-001 does not reinvent transfer
 * logic, it calls this one.
 */
@Entity('ownership_transfers')
export class OwnershipTransfer {
  @PrimaryGeneratedColumn('uuid', { name: 'transfer_id' })
  transferId: string;

  @Column({ name: 'ownership_record_id', type: 'uuid' })
  ownershipRecordId: string;

  @Column({ name: 'from_owner_ref' })
  fromOwnerRef: string;

  @Column({ name: 'to_owner_ref' })
  toOwnerRef: string;

  @Column({ name: 'authority_evidence', type: 'jsonb' })
  authorityEvidence: Record<string, unknown>;

  @Column({ name: 'conflict_compliance_checks', type: 'jsonb', default: {} })
  conflictComplianceChecks: Record<string, unknown>;

  @Column({
    type: 'enum',
    enum: OwnershipTransferStatus,
    default: OwnershipTransferStatus.PROPOSED,
  })
  status: OwnershipTransferStatus;

  @Column({ name: 'initiated_at', type: 'timestamptz', default: () => 'now()' })
  initiatedAt: Date;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt?: Date;
}
