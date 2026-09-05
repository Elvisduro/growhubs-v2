import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum TenantKind {
  /** PF-011 §2.4.1 — every Person gets exactly one Personal Tenant (PF-C0489). */
  PERSONAL = 'PERSONAL',
  BUSINESS = 'BUSINESS',
}

/** PF-011 §3.1 (PF-C0516). Suspension is capability-specific under PLT-003
 * (the Kill Switch registry) — a suspended tenant does not necessarily lose
 * all capabilities at once (PF-C0517). */
export enum TenantLifecycleState {
  PROVISIONING = 'PROVISIONING',
  ACTIVE = 'ACTIVE',
  RESTRICTED = 'RESTRICTED',
  SUSPENDED_PARTIAL = 'SUSPENDED_PARTIAL',
  EXITING = 'EXITING',
  RETENTION_ONLY = 'RETENTION_ONLY',
  CLOSED = 'CLOSED',
  DELETED_OR_ANONYMISED = 'DELETED_OR_ANONYMISED',
}

/**
 * PF-011 §2.4 — Tenant: THE ISOLATION ROOT (PF-C0472). Every business-owned
 * mutable object elsewhere in the platform carries exactly this FK
 * (PF-C0473). The single most load-bearing row in the whole schema.
 *
 * Row-Level Security is enabled on this table (and every tenant-scoped
 * table) — see src/migrations/*-EnableRlsTenantIsolation.ts.
 */
@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid', { name: 'tenant_id' })
  tenantId: string;

  /** Tenant 1->1 primary owning Organization (PF-C0483). */
  @Column({ name: 'owning_organization_id', type: 'uuid' })
  owningOrganizationId: string;

  @Column({ name: 'tenant_kind', type: 'enum', enum: TenantKind })
  tenantKind: TenantKind;

  @Column({
    name: 'lifecycle_state',
    type: 'enum',
    enum: TenantLifecycleState,
    default: TenantLifecycleState.PROVISIONING,
  })
  lifecycleState: TenantLifecycleState;

  /** a tenant normally has a primary payer (PF-C0503). */
  @Column({ name: 'primary_payer_billing_account_id', type: 'uuid', nullable: true })
  primaryPayerBillingAccountId?: string;

  /** feeds PLT-002 controller/processor allocation — value source is
   * PLT-002, not defined here. */
  @Column({ name: 'data_residency_region', nullable: true })
  dataResidencyRegion?: string;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;
}
