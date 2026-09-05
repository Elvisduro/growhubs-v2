import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** PF-011 §3.2 (PF-C0518). Workspace closure never deletes Tenant-owned
 * objects or breaks customer access (PF-C0519). */
export enum WorkspaceLifecycleState {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  RESTORED = 'RESTORED',
  CLOSED = 'CLOSED',
}

/**
 * PF-011 §2.6 — Workspace: collaboration/navigation/budget/ARIA-grant
 * container inside exactly one Tenant (PF-C0476) — explicitly NOT the
 * isolation root (PF-C0477); Workspace models operational collaboration,
 * while OrganizationUnit models real hierarchy (PF-C0479 vs PF-C0478).
 */
@Entity('workspaces')
export class Workspace {
  @PrimaryGeneratedColumn('uuid', { name: 'workspace_id' })
  workspaceId: string;

  /** Tenant 1->N Workspace (PF-C0482). */
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  /** optional binding (PF-C0485). */
  @Column({ name: 'bound_organization_unit_id', type: 'uuid', nullable: true })
  boundOrganizationUnitId?: string;

  @Column({
    name: 'lifecycle_state',
    type: 'enum',
    enum: WorkspaceLifecycleState,
    default: WorkspaceLifecycleState.DRAFT,
  })
  lifecycleState: WorkspaceLifecycleState;

  @Column()
  name: string;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;
}
