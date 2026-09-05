import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** XD-008 §2.3 (XD-C0595) — these six remain separate mechanisms and are
 * never collapsed into one. */
export enum RestrictionKind {
  MODERATION = 'MODERATION',
  ACCOUNT_SUSPENSION = 'ACCOUNT_SUSPENSION',
  MEMBERSHIP_REMOVAL = 'MEMBERSHIP_REMOVAL',
  ACCESS_RESTRICTION = 'ACCESS_RESTRICTION',
  FINANCIAL_HOLD = 'FINANCIAL_HOLD',
  LEGAL_SAFETY_HOLD = 'LEGAL_SAFETY_HOLD',
}

/**
 * XD-008 §2.3 (XD-C0585) — AccessRestriction: a first-class, scoped
 * restriction — never a bare "user is banned" flag; restrictions are
 * capability/scope-specific, not universal (XD-C0594).
 * `precedencePosition` is 1 or 2 in the 6-position resolution algorithm
 * (§4): position 1 = absolute platform/legal/safety prohibition
 * (XD-C0588), position 2 = scoped security/legal/safety restriction
 * (XD-C0589). Enforced as a CHECK constraint at the DB level, not just a
 * comment, since this precedence ordering is the single most important
 * invariant in this schema.
 */
@Entity('access_restrictions')
export class AccessRestriction {
  @PrimaryGeneratedColumn('uuid', { name: 'restriction_id' })
  restrictionId: string;

  @Column({ name: 'subject_person_id', type: 'uuid' })
  subjectPersonId: string;

  /** which capability(ies)/resource(s) this restriction actually covers */
  @Column({ type: 'jsonb' })
  scope: Record<string, unknown>;

  @Column({ name: 'restriction_kind', type: 'enum', enum: RestrictionKind })
  restrictionKind: RestrictionKind;

  /** 1 or 2 — see class doc comment; CHECK constraint added in the
   * migration (TypeORM decorators can't express a literal-set CHECK
   * cleanly), not left as an unenforced convention. */
  @Column({ name: 'precedence_position', type: 'smallint' })
  precedencePosition: number;

  @Column({ name: 'imposed_at', type: 'timestamptz', default: () => 'now()' })
  imposedAt: Date;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt?: Date;
}
