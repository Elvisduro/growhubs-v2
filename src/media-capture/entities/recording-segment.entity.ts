import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * RecordingSegment — `CORE-C1625`: "Late arrival creates new notice/
 * evidence scope and segment presence." A RecordingSession is composed
 * of one or more segments; a late arrival, pause/resume, or refusal-
 * driven exclusion (`CORE-C1626`) each bound a new segment so that
 * notice/evidence scope is always attributable to the exact span it
 * covers, rather than one blanket scope for the whole session.
 */
@Entity('recording_segments')
export class RecordingSegment {
  @PrimaryGeneratedColumn('uuid', { name: 'recording_segment_id' })
  recordingSegmentId: string;

  @Column({ name: 'recording_session_id', type: 'uuid' })
  recordingSessionId: string;

  @Column({ name: 'started_at', type: 'timestamptz' })
  startedAt: Date;

  @Column({ name: 'ended_at', type: 'timestamptz', nullable: true })
  endedAt?: Date;

  /** which ParticipantNotice/ConsentEvidence rows bound this exact
   * segment's notice/evidence scope (CORE-C1625). */
  @Column({ name: 'notice_evidence_scope', type: 'jsonb' })
  noticeEvidenceScope: Record<string, unknown>;

  @Column({ name: 'participants_present', type: 'jsonb' })
  participantsPresent: Record<string, unknown>[];
}
