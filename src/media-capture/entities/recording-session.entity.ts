import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** `CORE-C1623` (MI-001, GOV-002 EXECUTED, `MASTER_SPEC.md:1410`) — the
 * 11 linear lifecycle states plus 3 named terminal branches given
 * verbatim: "The lifecycle covers preparing→notice-pending→ready→
 * recording-local→paused→stopped→sync-pending→uploading→verified→
 * processing→available→archived/deletion-pending/deleted." Initial:
 * PREPARING. Terminal: ARCHIVED/DELETION_PENDING/DELETED (three distinct
 * terminal outcomes, not one — same discipline as this codebase never
 * collapsing distinct terminal meanings into a single status). `CORE-C1624`:
 * a failed upload never silently deletes the only copy or claims
 * successful sync — the SYNC_PENDING/UPLOADING states exist precisely so
 * that failure is visible rather than masked. */
export enum RecordingSessionState {
  PREPARING = 'PREPARING',
  NOTICE_PENDING = 'NOTICE_PENDING',
  READY = 'READY',
  RECORDING_LOCAL = 'RECORDING_LOCAL',
  PAUSED = 'PAUSED',
  STOPPED = 'STOPPED',
  SYNC_PENDING = 'SYNC_PENDING',
  UPLOADING = 'UPLOADING',
  VERIFIED = 'VERIFIED',
  PROCESSING = 'PROCESSING',
  AVAILABLE = 'AVAILABLE',
  ARCHIVED = 'ARCHIVED',
  DELETION_PENDING = 'DELETION_PENDING',
  DELETED = 'DELETED',
}

/**
 * RecordingSession — MI-001's central object. `CORE-C1610`: "RecordingSession
 * binds purpose, participants, jurisdiction/policy, notice, permissions,
 * capture time and lifecycle rather than being treated as a media file."
 * Field shape below is `CORE-C1611`'s pre-capture declaration list,
 * verbatim: "tenant, purpose, meeting/context type, known location/
 * jurisdiction and participants, sensitive/minor/workplace context,
 * requested audio/video/transcript/diarisation/summary/Task/CRM outputs,
 * retention and notice/permission basis."
 *
 * No dedicated `MI-001_*_SCHEMA_v1.md` document exists yet; grounded
 * directly in `gov002_repaired/CORE_repaired.md` rows `CORE-C1608`–
 * `CORE-C1661` (same discipline as this codebase's PLT-006/TEN-001
 * entities). `CORE-C1609` names 15 distinct MI-001 objects (Meeting,
 * RecordingSession, RecordingSegment, Participant, ParticipantNotice,
 * RecordingPermission, ConsentEvidence, CapturePolicySnapshot,
 * RawRecording, Transcript, SpeakerLabel, DerivedArtifact,
 * MeetingAccessGrant, RecordingCase, DeletionPropagationJob) — only the
 * two most compliance-load-bearing ones (this entity and
 * ConsentEvidence/CapturePolicySnapshot) are modeled in this pass, since
 * those are the ones the decision register gives concrete field-level
 * content for; the rest remain named-but-unmodeled rather than invented,
 * same restraint as `15_Publication.md`'s TBD notes. `DeletionPropagationJob`
 * in particular likely reuses this codebase's existing PLT-001
 * `DeletionPropagationPlan`/`PropagationTarget` machinery (see
 * `src/dsr/entities/deletion-propagation-plan.entity.ts`) rather than a
 * wholly new table — left for a follow-up pass rather than guessed here.
 */
@Entity('recording_sessions')
export class RecordingSession {
  @PrimaryGeneratedColumn('uuid', { name: 'recording_session_id' })
  recordingSessionId: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  /** the parent Meeting this session recorded — see meeting.entity.ts. */
  @Column({ name: 'meeting_id', type: 'uuid', nullable: true })
  meetingId?: string;

  /** the CapturePolicySnapshot version pinned at capture time —
   * `CORE-C1658`: "CapturePolicySnapshot bounds all processing." */
  @Column({ name: 'capture_policy_snapshot_id', type: 'uuid' })
  capturePolicySnapshotId: string;

  @Column()
  purpose: string;

  @Column({ name: 'meeting_context_type' })
  meetingContextType: string;

  @Column({ name: 'known_location_jurisdiction', type: 'jsonb', nullable: true })
  knownLocationJurisdiction?: Record<string, unknown>;

  @Column({ name: 'participants_ref', type: 'jsonb' })
  participantsRef: Record<string, unknown>[];

  /** `CORE-C1630`/`CORE-C1632`: sensitive-meeting and child/minor
   * context triggers minimisation/redaction and CM-011 handling. */
  @Column({ name: 'sensitive_minor_workplace_context', type: 'jsonb', default: {} })
  sensitiveMinorWorkplaceContext: Record<string, unknown>;

  /** requested audio/video/transcript/diarisation/summary/Task/CRM
   * outputs — declared before capture (CORE-C1611); does NOT itself
   * authorise every derivative (CORE-C1659) — actual derivative creation
   * is bounded separately by the pinned CapturePolicySnapshot. */
  @Column({ name: 'requested_outputs', type: 'jsonb' })
  requestedOutputs: Record<string, unknown>;

  @Column({ name: 'retention_request', type: 'jsonb', nullable: true })
  retentionRequest?: Record<string, unknown>;

  @Column({ name: 'notice_permission_basis', type: 'jsonb' })
  noticePermissionBasis: Record<string, unknown>;

  @Column({
    type: 'enum',
    enum: RecordingSessionState,
    default: RecordingSessionState.PREPARING,
  })
  state: RecordingSessionState;

  @Column({ name: 'state_version', default: 0 })
  stateVersion: number;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;

  @Column({ name: 'ended_at', type: 'timestamptz', nullable: true })
  endedAt?: Date;
}
