import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Participant — MI-001's presence object (`CORE-C1609`), distinct from
 * `ParticipantNotice` (the notice delivered to them) and `ConsentEvidence`
 * (their recorded response). `CORE-C1625`: late arrival creates new
 * notice/evidence scope and SEGMENT PRESENCE — `joinedAt`/`leftAt` is
 * what a `RecordingSegment` (see recording-segment.entity.ts) checks
 * against to determine which participants were actually present in it.
 */
@Entity('participants')
export class Participant {
  @PrimaryGeneratedColumn('uuid', { name: 'participant_id' })
  participantId: string;

  @Column({ name: 'recording_session_id', type: 'uuid' })
  recordingSessionId: string;

  @Column({ name: 'person_ref', type: 'jsonb' })
  personRef: Record<string, unknown>;

  @Column()
  role: string;

  @Column({ name: 'joined_at', type: 'timestamptz' })
  joinedAt: Date;

  @Column({ name: 'left_at', type: 'timestamptz', nullable: true })
  leftAt?: Date;

  /** `CORE-C1625`: a participant joining after capture start is a late
   * arrival, triggering repeated notice and new evidence scope. */
  @Column({ name: 'is_late_arrival', default: false })
  isLateArrival: boolean;
}
