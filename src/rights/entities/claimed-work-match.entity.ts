import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * ClaimedWorkMatch — TR-001's "ClaimedWork/Match" object (`CORE-C1675`
 * bundles these with a slash, so this codebase models them as one table:
 * what the claimant asserts is theirs, plus the — possibly automated —
 * match against the affected GrowHubs asset). `CORE-C1680`: **"Automated
 * matching is a signal, never a final finding"** — `matchEvidence` is
 * kept structurally separate from `RightsClaim.claimDecision`, which only
 * a human `ClaimDecision` row can populate.
 */
@Entity('claimed_work_matches')
export class ClaimedWorkMatch {
  @PrimaryGeneratedColumn('uuid', { name: 'claimed_work_match_id' })
  claimedWorkMatchId: string;

  @Column({ name: 'rights_claim_id', type: 'uuid' })
  rightsClaimId: string;

  @Column({ name: 'work_description', type: 'jsonb' })
  workDescription: Record<string, unknown>;

  @Column({ name: 'match_evidence', type: 'jsonb', nullable: true })
  matchEvidence?: Record<string, unknown>;

  @Column({ name: 'is_automated_match', default: false })
  isAutomatedMatch: boolean;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;
}
