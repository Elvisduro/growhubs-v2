import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** ENGINEERING SYNTHESIS FLAG: the decision register discusses each of
 * these as its own handled scenario (`CORE-C1626` refusal, `CORE-C1627`/
 * `CORE-C1628` withdrawal, `CORE-C1629` purpose change, `CORE-C1630`
 * bystander/sensitive meeting, and the "lost/local compromised device"
 * / "denied cross-tenant sharing" required-proof scenarios of
 * `CORE-C1656`) but never names a "RecordingCase type" enum directly —
 * this grouping is this codebase's own, not a literal transcription. */
export enum RecordingCaseType {
  REFUSAL = 'REFUSAL',
  WITHDRAWAL = 'WITHDRAWAL',
  PURPOSE_CHANGE_REQUEST = 'PURPOSE_CHANGE_REQUEST',
  BYSTANDER_SENSITIVE_MEETING = 'BYSTANDER_SENSITIVE_MEETING',
  LOST_COMPROMISED_DEVICE = 'LOST_COMPROMISED_DEVICE',
  CROSS_TENANT_SHARING_DENIAL = 'CROSS_TENANT_SHARING_DENIAL',
}

/**
 * RecordingCase — MI-001's review/exception case object (`CORE-C1609`).
 * `CORE-C1627`: "Withdrawal creates a review and prospective control."
 * `CORE-C1628`: withdrawal is NOT automatically retrospective erasure
 * when another valid obligation applies — `resolution` records what was
 * actually decided, never assumed. `CORE-C1656` (Required proof
 * scenarios) names the concrete situations this object exists to make
 * provable.
 */
@Entity('recording_cases')
export class RecordingCase {
  @PrimaryGeneratedColumn('uuid', { name: 'recording_case_id' })
  recordingCaseId: string;

  @Column({ name: 'recording_session_id', type: 'uuid' })
  recordingSessionId: string;

  @Column({ name: 'case_type', type: 'enum', enum: RecordingCaseType })
  caseType: RecordingCaseType;

  @Column({ type: 'jsonb' })
  evidence: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  resolution?: Record<string, unknown>;

  @Column({ name: 'opened_at', type: 'timestamptz', default: () => 'now()' })
  openedAt: Date;

  @Column({ name: 'closed_at', type: 'timestamptz', nullable: true })
  closedAt?: Date;
}
