import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** CM-012 §4.2 (CM-C1158) — the 4 named linear states plus the 3 named
 * outcomes (FAILED, BLOCKED, QUARANTINED — explicitly named, unlike vaguer
 * "branches" language elsewhere). */
export enum MessageState {
  CREATED = 'CREATED',
  ACCEPTED = 'ACCEPTED',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED',
  BLOCKED = 'BLOCKED',
  QUARANTINED = 'QUARANTINED',
}

/**
 * CM-012 §2.2 (CM-C1159-C1161) — Message: the stable identity; editable
 * content lives in MessageVersion, never here. Destructive-outcome
 * separation (CM-C1161): user deletion, moderation redaction, legal
 * restriction, and retention expiry remain four distinct, policy-bound
 * outcomes — never the same generic "removed" state. This is modeled as
 * an application-layer discipline over `state`/`currentVersionId` (each
 * outcome writes its own policy trail elsewhere, e.g. a
 * ModerationEnvelope reference for a redaction) rather than as four
 * separate enum values on this table, since the doc gives MessageState
 * its own explicit 7-value list (above) that does not include these four.
 */
@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid', { name: 'message_id' })
  messageId: string;

  @Column({ name: 'conversation_id', type: 'uuid' })
  conversationId: string;

  @Column({ type: 'enum', enum: MessageState, default: MessageState.CREATED })
  state: MessageState;

  @Column({ name: 'current_version_id', type: 'uuid' })
  currentVersionId: string;
}

/**
 * CM-012 §2.2 (CM-C1159-C1160) — MessageVersion: editing a message creates
 * a NEW version; it never overwrites history. Nothing in this codebase
 * issues an UPDATE against a MessageVersion row's content.
 *
 * FIELD LIST NOTE: no literal field table is given for this entity in the
 * approved text — synthesized from the prose, flagged here explicitly
 * (same discipline used throughout this codebase for under-specified
 * entities).
 */
@Entity('message_versions')
export class MessageVersion {
  @PrimaryGeneratedColumn('uuid', { name: 'message_version_id' })
  messageVersionId: string;

  @Column({ name: 'message_id', type: 'uuid' })
  messageId: string;

  @Column({ name: 'version_number' })
  versionNumber: number;

  @Column({ type: 'jsonb' })
  content: Record<string, unknown>;

  @Column({ name: 'edited_by_person_id', type: 'uuid' })
  editedByPersonId: string;

  @Column({ name: 'edited_at', type: 'timestamptz', default: () => 'now()' })
  editedAt: Date;
}

/** CM-012 §2.2 (CM-C1171) — no exact enum-value list is given for scan
 * status; engineering synthesis, flagged. */
export enum MalwareScanStatus {
  PENDING = 'PENDING',
  CLEAN = 'CLEAN',
  INFECTED = 'INFECTED',
  QUARANTINED = 'QUARANTINED',
}

/**
 * CM-012 §2.2 (CM-C1171) — MessageAttachment: governed storage references,
 * malware/policy checks, and signed access rather than uncontrolled
 * duplication.
 *
 * FIELD LIST NOTE: like MessageVersion above, no literal field table is
 * given — synthesized from the prose, flagged explicitly.
 */
@Entity('message_attachments')
export class MessageAttachment {
  @PrimaryGeneratedColumn('uuid', { name: 'attachment_id' })
  attachmentId: string;

  @Column({ name: 'message_id', type: 'uuid' })
  messageId: string;

  @Column({ name: 'storage_ref' })
  storageRef: string;

  @Column({
    name: 'malware_scan_status',
    type: 'enum',
    enum: MalwareScanStatus,
    default: MalwareScanStatus.PENDING,
  })
  malwareScanStatus: MalwareScanStatus;

  @Column({ name: 'signed_access_policy', type: 'jsonb', default: {} })
  signedAccessPolicy: Record<string, unknown>;
}

/**
 * CM-012 §2.3 — DeliveryReceipt: a tracking object for the delivery
 * event, distinct from Message.state itself.
 *
 * FIELD LIST NOTE: no literal field table given — synthesized, flagged.
 */
@Entity('delivery_receipts')
export class DeliveryReceipt {
  @PrimaryGeneratedColumn('uuid', { name: 'receipt_id' })
  receiptId: string;

  @Column({ name: 'message_id', type: 'uuid' })
  messageId: string;

  @Column({ name: 'participant_person_id', type: 'uuid' })
  participantPersonId: string;

  @Column({ name: 'delivered_at', type: 'timestamptz', default: () => 'now()' })
  deliveredAt: Date;
}

/**
 * CM-012 §2.3 — ReadReceipt: a tracking object for the read-confirmation
 * event, distinct from Message.state itself.
 *
 * FIELD LIST NOTE: no literal field table given — synthesized, flagged.
 */
@Entity('read_receipts')
export class ReadReceipt {
  @PrimaryGeneratedColumn('uuid', { name: 'receipt_id' })
  receiptId: string;

  @Column({ name: 'message_id', type: 'uuid' })
  messageId: string;

  @Column({ name: 'participant_person_id', type: 'uuid' })
  participantPersonId: string;

  @Column({ name: 'read_at', type: 'timestamptz', default: () => 'now()' })
  readAt: Date;
}
