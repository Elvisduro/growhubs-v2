import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** `CORE-C1639` (MI-001): "`XD-008` resolves access separately for raw
 * media, transcript, speaker mapping, summary, Tasks, CRM, export/
 * download, sharing and ARIA." — the 9 named resource kinds verbatim. */
export enum MeetingAccessResourceKind {
  RAW_MEDIA = 'RAW_MEDIA',
  TRANSCRIPT = 'TRANSCRIPT',
  SPEAKER_MAPPING = 'SPEAKER_MAPPING',
  SUMMARY = 'SUMMARY',
  TASKS = 'TASKS',
  CRM = 'CRM',
  EXPORT_DOWNLOAD = 'EXPORT_DOWNLOAD',
  SHARING = 'SHARING',
  ARIA = 'ARIA',
}

/**
 * MeetingAccessGrant — `CORE-C1640`: **"Meeting invitation or admin role
 * never grants all derivatives"** — access to each resource kind above is
 * its own explicit grant row, never inferred from meeting membership or
 * a platform role. `CORE-C1641`: "Cross-tenant sharing requires explicit
 * grant and purpose" — `crossTenant`/`purpose` make that explicit rather
 * than implicit in a broader grant.
 */
@Entity('meeting_access_grants')
export class MeetingAccessGrant {
  @PrimaryGeneratedColumn('uuid', { name: 'meeting_access_grant_id' })
  meetingAccessGrantId: string;

  @Column({ name: 'recording_session_id', type: 'uuid' })
  recordingSessionId: string;

  @Column({ name: 'grantee_ref', type: 'jsonb' })
  granteeRef: Record<string, unknown>;

  @Column({ name: 'resource_kind', type: 'enum', enum: MeetingAccessResourceKind })
  resourceKind: MeetingAccessResourceKind;

  @Column({ name: 'is_cross_tenant', default: false })
  isCrossTenant: boolean;

  @Column({ nullable: true })
  purpose?: string;

  @Column({ name: 'granted_at', type: 'timestamptz', default: () => 'now()' })
  grantedAt: Date;

  @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true })
  revokedAt?: Date;
}
