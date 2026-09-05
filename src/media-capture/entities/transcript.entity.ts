import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { DerivativeLineageBase } from './derivative-lineage';

/** MeetingTranscript — one of MI-001's named lineage-bearing derivatives
 * (`CORE-C1636`). See `derivative-lineage.ts` for the shared field
 * shape (`CORE-C1637`). `CORE-C1634`: anonymous diarisation ("Speaker 1")
 * is distinct from declared participant mapping and voice-biometric
 * identification — this entity holds the transcript text/captions only;
 * speaker attribution is `SpeakerLabel`'s own, separate object. Named
 * `MeetingTranscript`/`meeting_transcripts` (not `Transcript`/
 * `transcripts`) to avoid colliding with CL-013's unrelated
 * `Transcript` entity, which already owns that class name and table. */
@Entity('meeting_transcripts')
export class MeetingTranscript extends DerivativeLineageBase {
  @PrimaryGeneratedColumn('uuid', { name: 'meeting_transcript_id' })
  meetingTranscriptId: string;

  @Column({ type: 'jsonb' })
  content: Record<string, unknown>;
}
