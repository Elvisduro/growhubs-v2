import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AccessCapability } from './access-capability.enum';

/**
 * XD-008 §3 (XD-C0586) — the 14 named access sources. Each grants ONLY its
 * own semantic meaning (XD-C0587) — none of these substitutes for another
 * (XD-C0604): a Role does not imply an Entitlement, an Enrollment does not
 * imply a Ticket, etc.
 */
export enum AccessSourceType {
  PUBLIC_ACCOUNT_CAPABILITY = 'PUBLIC_ACCOUNT_CAPABILITY',
  TENANT_WORKSPACE_MEMBERSHIP = 'TENANT_WORKSPACE_MEMBERSHIP',
  ORGANIZATION_OBJECT_ROLE = 'ORGANIZATION_OBJECT_ROLE',
  ENTITLEMENT = 'ENTITLEMENT',
  ENROLLMENT = 'ENROLLMENT',
  COMMUNITY_MEMBERSHIP = 'COMMUNITY_MEMBERSHIP',
  REGISTRATION_TICKET = 'REGISTRATION_TICKET',
  AGREEMENT_BOOKING = 'AGREEMENT_BOOKING',
  GROUP_COHORT = 'GROUP_COHORT',
  SPONSORED_SEAT = 'SPONSORED_SEAT',
  EXPLICIT_GRANT = 'EXPLICIT_GRANT',
  GUARDIAN_REPRESENTATION = 'GUARDIAN_REPRESENTATION',
  PLATFORM_AUTHORITY = 'PLATFORM_AUTHORITY',
  FEDERATED_GRANT = 'FEDERATED_GRANT',
}

/**
 * XD-008 §2.2 (XD-C0585) — AccessGrant: a positive grant, the "yes" side of
 * the decision. Critical constraint (XD-C0605): tenant ownership, admin
 * status, or payer status does NOT imply unrestricted private/safety/
 * financial/cross-tenant data access — owning the business does not mean
 * seeing everything in it.
 */
@Entity('access_grants')
export class AccessGrant {
  @PrimaryGeneratedColumn('uuid', { name: 'grant_id' })
  grantId: string;

  /** FK -> PF-011's Person */
  @Column({ name: 'subject_person_id', type: 'uuid' })
  subjectPersonId: string;

  @Column({ type: 'enum', enum: AccessCapability })
  capability: AccessCapability;

  /** polymorphic {type, id} */
  @Column({ name: 'resource_ref', type: 'jsonb' })
  resourceRef: Record<string, unknown>;

  @Column({ name: 'source_type', type: 'enum', enum: AccessSourceType })
  sourceType: AccessSourceType;

  /** the specific Entitlement/Enrollment/Role/etc. row that produced this grant */
  @Column({ name: 'source_ref', type: 'jsonb' })
  sourceRef: Record<string, unknown>;

  @Column({ type: 'jsonb', default: {} })
  context: Record<string, unknown>;

  @Column({ name: 'valid_from', type: 'timestamptz', nullable: true })
  validFrom?: Date;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt?: Date;
}
