import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * CounterNotice — TR-001's object for the uploader's response to a claim
 * (`CORE-C1675`). `CORE-C1677`: GrowHubs "identifies work/material/
 * location, captures authority/contact/good-faith declarations, promptly
 * notifies the uploader, supports counter-notice/appeal and preserves
 * communication/clock evidence" — `clockEvidence` specifically preserves
 * the timing facts any statutory response-window depends on.
 */
@Entity('counter_notices')
export class CounterNotice {
  @PrimaryGeneratedColumn('uuid', { name: 'counter_notice_id' })
  counterNoticeId: string;

  @Column({ name: 'rights_claim_id', type: 'uuid' })
  rightsClaimId: string;

  @Column({ name: 'uploader_declaration', type: 'jsonb' })
  uploaderDeclaration: Record<string, unknown>;

  @Column({ name: 'good_faith_declaration', type: 'jsonb' })
  goodFaithDeclaration: Record<string, unknown>;

  @Column({ name: 'clock_evidence', type: 'jsonb' })
  clockEvidence: Record<string, unknown>;

  @Column({ name: 'filed_at', type: 'timestamptz', default: () => 'now()' })
  filedAt: Date;
}
