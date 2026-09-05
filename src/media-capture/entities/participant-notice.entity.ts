import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * ParticipantNotice — `CORE-C1615`: "Notice is delivered before start,
 * remains visibly/audibly indicated during capture, and is repeated for
 * late arrivals and material purpose/output change." `CORE-C1616`:
 * "Notice explains recorder/controller, purpose, captured data, storage,
 * derivatives, audience, retention and objection/deletion path." —
 * `noticeContent` holds exactly that list, per the pinned
 * `CapturePolicySnapshot` version in force. `CORE-C1617`: **"Presence or
 * one start tone alone is not automatically consent"** — this row records
 * that notice was delivered, never that it was consented to; see
 * `ConsentEvidence` for the separate, explicit consent record.
 */
@Entity('participant_notices')
export class ParticipantNotice {
  @PrimaryGeneratedColumn('uuid', { name: 'participant_notice_id' })
  participantNoticeId: string;

  @Column({ name: 'recording_session_id', type: 'uuid' })
  recordingSessionId: string;

  @Column({ name: 'participant_id', type: 'uuid' })
  participantId: string;

  @Column({ name: 'capture_policy_snapshot_id', type: 'uuid' })
  capturePolicySnapshotId: string;

  /** recorder/controller, purpose, captured data, storage, derivatives,
   * audience, retention, objection/deletion path (CORE-C1616, verbatim
   * field list). */
  @Column({ name: 'notice_content', type: 'jsonb' })
  noticeContent: Record<string, unknown>;

  @Column({ name: 'delivered_at', type: 'timestamptz' })
  deliveredAt: Date;

  @Column({ name: 'repeated_for_late_arrival', default: false })
  repeatedForLateArrival: boolean;

  @Column({ name: 'repeated_for_purpose_change', default: false })
  repeatedForPurposeChange: boolean;
}
