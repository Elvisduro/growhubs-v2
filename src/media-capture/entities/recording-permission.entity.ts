import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * RecordingPermission — the granted-permission object, distinct from
 * `ConsentEvidence` (the evidence a permission response happened) per
 * `CORE-C1609`. `CORE-C1638`/`CORE-C1648`/`CORE-C1653` (Permission scope /
 * ARIA prohibited actions): **"Recording permission never automatically
 * authorises marketing, public distribution, employee scoring, model
 * training, testimonial, Torvet, cross-tenant benchmarks or biometric
 * identity."** — `grantedScope` therefore records exactly what WAS
 * granted (never assumed to include the prohibited list above unless a
 * separate, later grant explicitly adds it — `CORE-C1629`: a purpose
 * change is a NEW purpose requiring its own permission path).
 */
@Entity('recording_permissions')
export class RecordingPermission {
  @PrimaryGeneratedColumn('uuid', { name: 'recording_permission_id' })
  recordingPermissionId: string;

  @Column({ name: 'recording_session_id', type: 'uuid' })
  recordingSessionId: string;

  @Column({ name: 'participant_id', type: 'uuid' })
  participantId: string;

  @Column({ name: 'consent_evidence_id', type: 'uuid', nullable: true })
  consentEvidenceId?: string;

  /** exactly what was granted — never assumed to extend to marketing/
   * public distribution/scoring/model training/testimonial/Torvet/
   * cross-tenant benchmarks/biometric identity (CORE-C1638). */
  @Column({ name: 'granted_scope', type: 'jsonb' })
  grantedScope: Record<string, unknown>;

  @Column({ name: 'granted_at', type: 'timestamptz' })
  grantedAt: Date;

  @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true })
  revokedAt?: Date;
}
