import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * RepeatInfringementCase — TR-001's cross-claim, per-uploader aggregate
 * object (`CORE-C1675`), distinct from any single `RightsClaim` (it is
 * built FROM multiple claims' UPHELD outcomes, never from claim volume
 * alone). `CORE-C1684` (verbatim scoring factors): "substantiated
 * outcomes, reversals, severity, knowledge, recurrence, identity
 * confidence, prior education, jurisdiction and proportionality."
 * `CORE-C1685`: **"never count raw claim volume alone."** `CORE-C1687`:
 * a REJECTED or reversed claim never counts toward this case — only
 * `upheldClaimRefs` may be populated with UPHELD claim ids, and
 * `scoringFactors` must be able to justify every entry there.
 */
@Entity('repeat_infringement_cases')
export class RepeatInfringementCase {
  @PrimaryGeneratedColumn('uuid', { name: 'repeat_infringement_case_id' })
  repeatInfringementCaseId: string;

  @Column({ name: 'uploader_ref', type: 'jsonb' })
  uploaderRef: Record<string, unknown>;

  /** only UPHELD RightsClaim ids — never REJECTED/PARTIAL/reversed
   * (CORE-C1687). */
  @Column({ name: 'upheld_claim_refs', type: 'jsonb', default: [] })
  upheldClaimRefs: string[];

  @Column({ name: 'scoring_factors', type: 'jsonb' })
  scoringFactors: Record<string, unknown>;

  /** the enforcement response ladder position (CORE-C1686: education/
   * warning through upload/monetisation/distribution restrictions and
   * temporary suspension to reviewed termination with reason/appeal). */
  @Column({ name: 'enforcement_response', type: 'jsonb', nullable: true })
  enforcementResponse?: Record<string, unknown>;

  @Column({ name: 'opened_at', type: 'timestamptz', default: () => 'now()' })
  openedAt: Date;

  @Column({ name: 'closed_at', type: 'timestamptz', nullable: true })
  closedAt?: Date;
}
