import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum OrgKind {
  BUSINESS = 'BUSINESS',
  AGENCY = 'AGENCY',
  INSTITUTION = 'INSTITUTION',
  CLUB = 'CLUB',
  SCHOOL = 'SCHOOL',
  GROUP = 'GROUP',
}

/**
 * PF-011 §2.3 — Organization: a real business/institution/agency/club/school
 * (PF-C0470), distinct from Tenant — may exist Profile/federated-only before
 * ever operating a tenant (PF-C0471). Cardinality: Organization 1->N Tenant,
 * 1->N OrganizationUnit (PF-C0484).
 */
@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid', { name: 'organization_id' })
  organizationId: string;

  @Column({ name: 'legal_name' })
  legalName: string;

  @Column({ name: 'org_kind', type: 'enum', enum: OrgKind })
  orgKind: OrgKind;

  /** false for a Profile/federated-only Organization. */
  @Column({ name: 'has_operational_tenant', default: false })
  hasOperationalTenant: boolean;

  /** set once/if an operational Tenant exists. */
  @Column({ name: 'primary_tenant_id', type: 'uuid', nullable: true, unique: true })
  primaryTenantId?: string;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;
}
