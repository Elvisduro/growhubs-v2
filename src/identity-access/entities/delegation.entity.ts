import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** PF-012 §3.1 (PF-C0534) — no exact enum-value list is given for a
 * Delegation's own status, so this is an engineering synthesis. */
export enum DelegationStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED',
}

/**
 * PF-012 §3.1 (PF-C0534) — Delegation: one of the three scoped role
 * objects (alongside RoleDefinition and RoleAssignment), each scoped to
 * Organization/Tenant/Unit/Workspace/capability and time. §3.3 (PF-C0539):
 * an agency managing several client organizations never merges them into
 * one tenant — each client keeps its own PF-011 isolation boundary, and
 * the agency's access is exactly this: a delegated, revocable grant into
 * each client tenant.
 *
 * FIELD LIST NOTE: the approved text names Delegation as a scoped object
 * (PF-C0534) but gives no literal field table for it (unlike
 * OrganizationUnit/RoleAssignment/OwnershipRecord/SuccessionPlan/
 * OrganizationRecoveryCase above/below) — the columns here are an
 * engineering synthesis from that one clause plus the agency-client use
 * case in §3.3, flagged explicitly.
 */
@Entity('delegations')
export class Delegation {
  @PrimaryGeneratedColumn('uuid', { name: 'delegation_id' })
  delegationId: string;

  @Column({ name: 'delegator_person_id', type: 'uuid' })
  delegatorPersonId: string;

  /** the agency/person receiving delegated access */
  @Column({ name: 'delegate_person_id', type: 'uuid' })
  delegatePersonId: string;

  /** Organization/Tenant/Unit/Workspace this delegation covers */
  @Column({ name: 'scope_ref', type: 'jsonb' })
  scopeRef: Record<string, unknown>;

  @Column({ name: 'capability_scope', type: 'jsonb', default: {} })
  capabilityScope: Record<string, unknown>;

  @Column({ name: 'valid_from', type: 'timestamptz', default: () => 'now()' })
  validFrom: Date;

  @Column({ name: 'valid_to', type: 'timestamptz', nullable: true })
  validTo?: Date;

  @Column({ type: 'enum', enum: DelegationStatus, default: DelegationStatus.ACTIVE })
  status: DelegationStatus;
}
