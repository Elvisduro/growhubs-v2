import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum RoleAssignmentSource {
  SELF_SERVE = 'SELF_SERVE',
  INVITED = 'INVITED',
  DELEGATED = 'DELEGATED',
  AGENCY = 'AGENCY',
}

export enum RoleAssignmentStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED',
}

/**
 * PF-011 §2.7 — Role assignment record (PF-C0500): scoped and dated, never
 * a single global is_admin boolean (PF-C0501 — no such column exists
 * anywhere in this schema). Every authority grant is a row here.
 *
 * Extended per PF-012 §3.1 (PF-C0534): RoleDefinition/RoleAssignment/
 * Delegation are each scoped to Organization/Tenant/Unit/Workspace/
 * capability and time — `organizationId` and `capabilityScope` below close
 * the gap versus PF-011's original tenant/workspace/unit-only scope.
 * Inheritance down the hierarchy is explicit, never implicit (PF-C0535);
 * a local restriction can only narrow what an inherited role would
 * otherwise grant, never expand it (PF-C0536) — both are application-layer
 * rules over this table's rows, not expressible as a single column here.
 * Effective access is always resolved through XD-008 (PF-C0537) — this
 * table is an INPUT to access resolution, never a parallel access-decision
 * mechanism of its own.
 */
@Entity('role_assignments')
export class RoleAssignment {
  @PrimaryGeneratedColumn('uuid', { name: 'role_assignment_id' })
  roleAssignmentId: string;

  @Column({ name: 'person_id', type: 'uuid' })
  personId: string;

  /** PF-012 §3.1 — nullable since not every role assignment is
   * organization-scoped (e.g. a bare workspace-level role). */
  @Column({ name: 'organization_id', type: 'uuid', nullable: true })
  organizationId?: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ name: 'workspace_id', type: 'uuid', nullable: true })
  workspaceId?: string;

  @Column({ name: 'unit_id', type: 'uuid', nullable: true })
  unitId?: string;

  @Column({ name: 'object_id', type: 'uuid', nullable: true })
  objectId?: string;

  /** the RoleDefinition this assignment grants — RoleDefinition itself is
   * XD-008/XD-007 territory, referenced here by key only. */
  @Column({ name: 'role_key' })
  roleKey: string;

  /** PF-012 §3.1 (PF-C0534) */
  @Column({ name: 'capability_scope', type: 'jsonb', default: {} })
  capabilityScope: Record<string, unknown>;

  @Column({ type: 'enum', enum: RoleAssignmentSource })
  source: RoleAssignmentSource;

  @Column({ name: 'granted_at', type: 'timestamptz', default: () => 'now()' })
  grantedAt: Date;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt?: Date;

  /** nullable, for agency-delegated roles. */
  @Column({ name: 'delegation_ref', nullable: true })
  delegationRef?: string;

  @Column({ type: 'enum', enum: RoleAssignmentStatus, default: RoleAssignmentStatus.ACTIVE })
  status: RoleAssignmentStatus;
}
