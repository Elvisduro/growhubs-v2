import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * RawRecording — the actual captured media object, kept distinct from
 * `RecordingSession` (`CORE-C1610`: "rather than being treated as a media
 * file") and from every derivative (`Transcript`/`SpeakerLabel`/
 * `DerivedArtifact`). `CORE-C1620`: "Offline capture stores policy/notice
 * state and encrypted segments locally, displays `RECORDING LOCALLY`, and
 * uses resumable/idempotent integrity-checked upload." `CORE-C1624`:
 * **"A failed upload never silently deletes the only copy or claims
 * successful sync"** — `integrityVerifiedAt` is set only after the
 * integrity check actually passes, never assumed from upload completion
 * alone.
 */
@Entity('raw_recordings')
export class RawRecording {
  @PrimaryGeneratedColumn('uuid', { name: 'raw_recording_id' })
  rawRecordingId: string;

  @Column({ name: 'recording_session_id', type: 'uuid' })
  recordingSessionId: string;

  @Column({ name: 'storage_ref', type: 'jsonb' })
  storageRef: Record<string, unknown>;

  @Column()
  checksum: string;

  @Column({ name: 'size_bytes', type: 'bigint' })
  sizeBytes: string;

  @Column({ name: 'captured_at', type: 'timestamptz' })
  capturedAt: Date;

  @Column({ name: 'uploaded_at', type: 'timestamptz', nullable: true })
  uploadedAt?: Date;

  /** set only after a real integrity check passes (CORE-C1624) — never
   * inferred from upload completion alone. */
  @Column({ name: 'integrity_verified_at', type: 'timestamptz', nullable: true })
  integrityVerifiedAt?: Date;
}
