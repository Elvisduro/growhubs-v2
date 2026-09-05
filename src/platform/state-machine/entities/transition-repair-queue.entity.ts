import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum RepairIssueKind {
  STUCK = 'STUCK',
  UNKNOWN = 'UNKNOWN',
  MISSING = 'MISSING',
  DUPLICATE = 'DUPLICATE',
  SIDE_EFFECT = 'SIDE_EFFECT',
  VERSION = 'VERSION',
  COMPENSATION = 'COMPENSATION',
}

/**
 * PLT-005 §2.5 — TransitionRepairQueue: handles stuck/unknown/missing/
 * duplicate/side-effect/version/compensation issues through the SAME
 * authorized-command-plus-event-plus-audit discipline as any other
 * transition — NEVER a direct SQL status edit (CORE-C2048).
 */
@Entity('transition_repair_queue')
@Index(['objectType', 'objectId'])
export class TransitionRepairQueue {
  @PrimaryGeneratedColumn('uuid', { name: 'repair_id' })
  repairId: string;

  @Column({ name: 'object_type' })
  objectType: string;

  @Column({ name: 'object_id' })
  objectId: string;

  @Column({ name: 'issue_kind', type: 'enum', enum: RepairIssueKind })
  issueKind: RepairIssueKind;

  /** the repair command actually issued, itself audited like any command. */
  @Column({ name: 'authorized_command_ref' })
  authorizedCommandRef: string;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;

  @Column({ name: 'resolved_at', type: 'timestamptz', nullable: true })
  resolvedAt?: Date;
}
