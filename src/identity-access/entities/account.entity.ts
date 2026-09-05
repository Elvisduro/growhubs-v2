import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Person } from './person.entity';

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  LOCKED = 'LOCKED',
  RECOVERY_PENDING = 'RECOVERY_PENDING',
  CLOSED = 'CLOSED',
}

/**
 * PF-011 §2.1 — Account: the authentication identity. Never a public
 * Profile, never a tenant (PF-C0466). Exactly one Account per Person by
 * default (PF-C0480). Authorization never resolves through Account — only
 * through Person -> TenantMembership -> Role.
 */
@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn('uuid', { name: 'account_id' })
  accountId: string;

  @Column({ name: 'person_id', type: 'uuid', unique: true })
  personId: string;

  @OneToOne(() => Person)
  @JoinColumn({ name: 'person_id' })
  person: Person;

  @Column({ name: 'primary_email', unique: true })
  primaryEmail: string;

  /** password hash / SSO subject / passkey — never shared/team login
   * (PF-C0467: "Shared/team login is prohibited"). */
  @Column({ name: 'auth_credential_ref' })
  authCredentialRef: string;

  @Column({ name: 'recovery_methods', type: 'jsonb', default: {} })
  recoveryMethods: Record<string, unknown>;

  /** see PF-002A's separate device/login history object — not duplicated here */
  @Column({ name: 'device_history_ref', nullable: true })
  deviceHistoryRef?: string;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;

  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  lastLoginAt?: Date;

  @Column({ type: 'enum', enum: AccountStatus, default: AccountStatus.ACTIVE })
  status: AccountStatus;
}
