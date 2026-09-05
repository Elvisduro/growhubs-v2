import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum ApprovalDecision {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DENIED = 'DENIED',
  EXPIRED = 'EXPIRED',
}

/**
 * PLT-005 §2.4 — Approval: a payload/version/evidence/role/deadline/
 * decision object in its own right (CORE-C2045) — never a bare boolean
 * flag on the object being approved.
 */
@Entity('approvals')
export class Approval {
  @PrimaryGeneratedColumn('uuid', { name: 'approval_id' })
  approvalId: string;

  /** exact target/payload this approval covers. */
  @Column({ name: 'bound_payload_version' })
  boundPayloadVersion: string;

  @Column({ name: 'required_role' })
  requiredRole: string;

  @Column({ type: 'timestamptz' })
  deadline: Date;

  @Column({ type: 'enum', enum: ApprovalDecision, default: ApprovalDecision.PENDING })
  decision: ApprovalDecision;
}
