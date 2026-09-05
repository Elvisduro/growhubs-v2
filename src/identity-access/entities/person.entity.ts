import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum PersonStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  CLOSED = 'CLOSED',
}

/**
 * PF-011 §2.2 — Person: the canonical human. Every contextual role is a
 * role attached to this one row (PF-C0468). May participate across many
 * tenants without duplication (PF-C0469) — hence TenantMembership is a
 * join table, never a FK on Person.
 */
@Entity('people')
export class Person {
  @PrimaryGeneratedColumn('uuid', { name: 'person_id' })
  personId: string;

  /** private/legal name — distinct from any public Profile display name
   * (PF-002 owns the public Profile object; not duplicated here). */
  @Column({ name: 'canonical_name' })
  canonicalName: string;

  /** governs minor-status gates (CM-011, FRM-001) — read by those systems,
   * not owned by them. */
  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth?: string;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;

  @Column({ type: 'enum', enum: PersonStatus, default: PersonStatus.ACTIVE })
  status: PersonStatus;
}
