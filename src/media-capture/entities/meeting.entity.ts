import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Meeting — MI-001's parent context object (`CORE-C1609` names it first
 * and distinct from `RecordingSession`: a Meeting can occur, and be
 * organised/declared per `CORE-C1611`, independent of whether any
 * recording is ever started for it — a refused/non-recorded meeting per
 * `CORE-C1626` still exists as a Meeting row with zero RecordingSessions).
 *
 * ENGINEERING SYNTHESIS FLAG: the decision register (`CORE-C1608`–
 * `CORE-C1671`) discusses Meeting only as a named distinct object and
 * folds its pre-capture declaration content into `CORE-C1611`'s
 * description of what the organizer declares "before capture" — this
 * codebase's `RecordingSession` entity already carries that declared
 * content (purpose, context type, jurisdiction, participants, sensitive/
 * minor/workplace context, requested outputs, retention, notice/
 * permission basis) since a RecordingSession cannot exist without it.
 * This Meeting entity therefore holds only the calendar-level identity a
 * RecordingSession needs to reference (organizer, scheduled window,
 * tenant) — kept deliberately minimal rather than duplicating
 * RecordingSession's declared-content columns without decision-text
 * backing for a separate copy.
 */
@Entity('meetings')
export class Meeting {
  @PrimaryGeneratedColumn('uuid', { name: 'meeting_id' })
  meetingId: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ name: 'organizer_ref', type: 'jsonb' })
  organizerRef: Record<string, unknown>;

  @Column({ name: 'scheduled_start_at', type: 'timestamptz', nullable: true })
  scheduledStartAt?: Date;

  @Column({ name: 'scheduled_end_at', type: 'timestamptz', nullable: true })
  scheduledEndAt?: Date;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;
}
