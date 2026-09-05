import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** `CORE-C1619` (MI-001, GOV-002 EXECUTED, `MASTER_SPEC.md:1408`) — the
 * 4 permitted evidence methods given verbatim: "Supported evidence may
 * include device/web confirmation, signed meeting record, marked verbal
 * confirmation or permitted guardian/representative evidence." */
export enum ConsentEvidenceMethod {
  DEVICE_WEB_CONFIRMATION = 'DEVICE_WEB_CONFIRMATION',
  SIGNED_MEETING_RECORD = 'SIGNED_MEETING_RECORD',
  MARKED_VERBAL_CONFIRMATION = 'MARKED_VERBAL_CONFIRMATION',
  GUARDIAN_REPRESENTATIVE_EVIDENCE = 'GUARDIAN_REPRESENTATIVE_EVIDENCE',
}

/**
 * ConsentEvidence — `CORE-C1618`: "Where explicit permission is required,
 * ConsentEvidence records person/role, response, notice version, scope,
 * time, method and source." `CORE-C1617`: presence or one start tone
 * alone is NOT automatically consent — this row is the actual evidence
 * substitute for that insufficiency.
 *
 * `response` is intentionally a plain string, not an enum: the decision
 * register states that a response is recorded but gives no literal set
 * of response values (unlike `method`, which IS given as an exact list
 * above) — ENGINEERING SYNTHESIS FLAG, left free-text/caller-defined
 * rather than an invented enum, same restraint used throughout this
 * engagement wherever a source doc names a field but not its value set.
 */
@Entity('consent_evidences')
export class ConsentEvidence {
  @PrimaryGeneratedColumn('uuid', { name: 'consent_evidence_id' })
  consentEvidenceId: string;

  @Column({ name: 'recording_session_id', type: 'uuid' })
  recordingSessionId: string;

  @Column({ name: 'person_role_ref', type: 'jsonb' })
  personRoleRef: Record<string, unknown>;

  /** ENGINEERING SYNTHESIS: free-text, see class doc comment. */
  @Column()
  response: string;

  /** the CapturePolicySnapshot/notice version this response was given
   * against. */
  @Column({ name: 'notice_version' })
  noticeVersion: number;

  @Column({ type: 'jsonb' })
  scope: Record<string, unknown>;

  @Column({ name: 'method', type: 'enum', enum: ConsentEvidenceMethod })
  method: ConsentEvidenceMethod;

  @Column({ type: 'jsonb' })
  source: Record<string, unknown>;

  @Column({ name: 'responded_at', type: 'timestamptz' })
  respondedAt: Date;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;
}
