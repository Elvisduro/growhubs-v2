import { Column, Entity, PrimaryColumn } from 'typeorm';

export enum MembershipStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  REMOVED = 'REMOVED',
}

/**
 * PF-011 §2.7 — Membership/capability tables kept explicitly separate
 * (PF-C0499): TenantMembership gives tenant presence ONLY (PF-C0496).
 * Never implies Role/Entitlement (PF-C0498) — see RoleAssignment for that.
 */
@Entity('tenant_memberships')
export class TenantMembership {
  @PrimaryColumn({ name: 'person_id', type: 'uuid' })
  personId: string;

  @PrimaryColumn({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ type: 'enum', enum: MembershipStatus, default: MembershipStatus.ACTIVE })
  status: MembershipStatus;

  @Column({ name: 'joined_at', type: 'timestamptz', default: () => 'now()' })
  joinedAt: Date;
}

/**
 * PF-011 §2.7 — WorkspaceMembership gives local collaboration presence ONLY
 * (PF-C0497) — never the same as TenantMembership or a Role.
 */
@Entity('workspace_memberships')
export class WorkspaceMembership {
  @PrimaryColumn({ name: 'person_id', type: 'uuid' })
  personId: string;

  @PrimaryColumn({ name: 'workspace_id', type: 'uuid' })
  workspaceId: string;

  @Column({ type: 'enum', enum: MembershipStatus, default: MembershipStatus.ACTIVE })
  status: MembershipStatus;

  @Column({ name: 'joined_at', type: 'timestamptz', default: () => 'now()' })
  joinedAt: Date;
}
