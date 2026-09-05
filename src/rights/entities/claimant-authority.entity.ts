import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * ClaimantAuthority — TR-001's "Claimant/AuthorityEvidence" object
 * (`CORE-C1675`, bundled by the register's own slash pairing): who is
 * claiming, and their evidence of authority to do so. `CORE-C1688`:
 * "External DSP import does not prove ownership" — `authorityEvidence`
 * is what a claim actually stands or falls on, never mere import
 * presence.
 */
@Entity('claimant_authorities')
export class ClaimantAuthority {
  @PrimaryGeneratedColumn('uuid', { name: 'claimant_authority_id' })
  claimantAuthorityId: string;

  @Column({ name: 'rights_claim_id', type: 'uuid' })
  rightsClaimId: string;

  @Column({ name: 'claimant_ref', type: 'jsonb' })
  claimantRef: Record<string, unknown>;

  @Column({ name: 'authority_evidence', type: 'jsonb' })
  authorityEvidence: Record<string, unknown>;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;
}
