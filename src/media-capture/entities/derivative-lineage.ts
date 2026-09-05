import { Column } from 'typeorm';

/**
 * Shared lineage-field base for MI-001's derivative objects (`Transcript`,
 * `SpeakerLabel`, `DerivedArtifact`) — kept as three DISTINCT tables per
 * `CORE-C1609`'s "remain distinct objects" rule (this is a plain,
 * undecorated abstract class, not an `@Entity`, so TypeORM gives each
 * subclass its OWN table with these columns rather than a shared one —
 * standard TypeORM column-inheritance, not table-per-class inheritance).
 *
 * `CORE-C1636`: "Raw recording, Transcript/captions, SpeakerLabel,
 * Summary/notes, Tasks, CRM entries, Search/vector indexes, Knowledge
 * items, clips/thumbnails, exports/integrations and ARIA memory/caches
 * are separate lineage-bearing derivatives."
 *
 * `CORE-C1637`: "Each derivative records source session/segment, policy
 * snapshot, purpose, participant scope, provider/model/version/
 * confidence, retention and access." — the field shape below, verbatim.
 */
export abstract class DerivativeLineageBase {
  @Column({ name: 'recording_session_id', type: 'uuid' })
  recordingSessionId: string;

  @Column({ name: 'recording_segment_id', type: 'uuid', nullable: true })
  recordingSegmentId?: string;

  @Column({ name: 'capture_policy_snapshot_id', type: 'uuid' })
  capturePolicySnapshotId: string;

  @Column()
  purpose: string;

  @Column({ name: 'participant_scope', type: 'jsonb' })
  participantScope: Record<string, unknown>;

  @Column({ name: 'provider_model_version_confidence', type: 'jsonb' })
  providerModelVersionConfidence: Record<string, unknown>;

  @Column({ name: 'retention_policy', type: 'jsonb' })
  retentionPolicy: Record<string, unknown>;

  @Column({ name: 'access_policy', type: 'jsonb' })
  accessPolicy: Record<string, unknown>;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;
}
