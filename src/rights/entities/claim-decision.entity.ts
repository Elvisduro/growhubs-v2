import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * ClaimDecision — TR-001's human-review-outcome object (`CORE-C1675`),
 * populated only at the `RightsClaim`'s REVIEW state, never by
 * `ClaimedWorkMatch`'s automated evidence alone (`CORE-C1680`).
 * `CORE-C1681` (Human review factors, verbatim): "authority/ownership
 * evidence, licence/territory/duration/scope, lawful-use context,
 * transformation/amount, abuse risk, provider contracts and effect on
 * both rights holder and uploader."
 */
@Entity('claim_decisions')
export class ClaimDecision {
  @PrimaryGeneratedColumn('uuid', { name: 'claim_decision_id' })
  claimDecisionId: string;

  @Column({ name: 'rights_claim_id', type: 'uuid' })
  rightsClaimId: string;

  /** the review-factor evidence considered (CORE-C1681's list). */
  @Column({ name: 'review_factors', type: 'jsonb' })
  reviewFactors: Record<string, unknown>;

  /** UPHELD / REJECTED / PARTIAL — mirrors RightsClaimState's own values
   * rather than a new enum, since the decision outcome and the claim's
   * resulting state are the same three named values (CORE-C1675). */
  @Column()
  outcome: string;

  @Column({ name: 'reviewer_ref', type: 'jsonb' })
  reviewerRef: Record<string, unknown>;

  @Column({ name: 'decided_at', type: 'timestamptz', default: () => 'now()' })
  decidedAt: Date;
}
