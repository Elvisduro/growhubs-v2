import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * RequestedAction — TR-001's object recording what the claimant is
 * asking for (`CORE-C1675`). `CORE-C1678` names the temporary controls
 * an action MAY invoke if granted pending review: playback, download,
 * Torvet, monetisation, redistribution, new derivatives, DSP delivery
 * and ARIA reuse restrictions.
 */
@Entity('requested_actions')
export class RequestedAction {
  @PrimaryGeneratedColumn('uuid', { name: 'requested_action_id' })
  requestedActionId: string;

  @Column({ name: 'rights_claim_id', type: 'uuid' })
  rightsClaimId: string;

  @Column({ name: 'action_kind', type: 'jsonb' })
  actionKind: Record<string, unknown>;

  @Column({ name: 'requested_at', type: 'timestamptz', default: () => 'now()' })
  requestedAt: Date;
}
