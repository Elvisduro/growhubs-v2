import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * RestorationAction — TR-001's object recorded when a RESTRICTED/REMOVED
 * asset is restored (`CORE-C1675`). `CORE-C1701`: **"Takedown alone does
 * not determine refund or revenue ownership"** — `financialImpactNote` is
 * kept explicit and separate rather than assumed from the restoration
 * itself.
 */
@Entity('restoration_actions')
export class RestorationAction {
  @PrimaryGeneratedColumn('uuid', { name: 'restoration_action_id' })
  restorationActionId: string;

  @Column({ name: 'rights_claim_id', type: 'uuid' })
  rightsClaimId: string;

  @Column({ type: 'jsonb' })
  evidence: Record<string, unknown>;

  @Column({ name: 'financial_impact_note', type: 'jsonb', nullable: true })
  financialImpactNote?: Record<string, unknown>;

  @Column({ name: 'restored_at', type: 'timestamptz', default: () => 'now()' })
  restoredAt: Date;
}
