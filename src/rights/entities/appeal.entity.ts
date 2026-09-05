import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Appeal — TR-001's object for either party's appeal of a `ClaimDecision`
 * (`CORE-C1675`). `CORE-C1682`: "Removal disputes receive effective,
 * timely redress and meaningful human review" — `reviewerRef` on the
 * resulting decision must differ from the original decision's reviewer
 * for that review to be meaningful; enforcing that is an application-
 * layer rule, not a column, but `appellantRef` records who is entitled
 * to ask for it.
 */
@Entity('appeals')
export class Appeal {
  @PrimaryGeneratedColumn('uuid', { name: 'appeal_id' })
  appealId: string;

  @Column({ name: 'rights_claim_id', type: 'uuid' })
  rightsClaimId: string;

  @Column({ name: 'appellant_ref', type: 'jsonb' })
  appellantRef: Record<string, unknown>;

  @Column({ type: 'jsonb' })
  grounds: Record<string, unknown>;

  @Column({ name: 'filed_at', type: 'timestamptz', default: () => 'now()' })
  filedAt: Date;

  @Column({ name: 'resolved_at', type: 'timestamptz', nullable: true })
  resolvedAt?: Date;
}
