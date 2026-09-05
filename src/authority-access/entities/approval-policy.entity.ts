import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** XD-007 §2.3 (XD-C0534) — the exact 9 approval triggers. */
export enum ApprovalTrigger {
  EVERY_ACTION = 'EVERY_ACTION',
  AMOUNT_THRESHOLD = 'AMOUNT_THRESHOLD',
  VOLUME_THRESHOLD = 'VOLUME_THRESHOLD',
  AUDIENCE_THRESHOLD = 'AUDIENCE_THRESHOLD',
  TEMPLATE_THRESHOLD = 'TEMPLATE_THRESHOLD',
  NAMED_ROLE = 'NAMED_ROLE',
  TWO_PERSON = 'TWO_PERSON',
  SAFEGUARDING = 'SAFEGUARDING',
  LEGAL_FINANCE_SECURITY = 'LEGAL_FINANCE_SECURITY',
}

/**
 * XD-007 §2.3 — ApprovalPolicy: an approval binds the EXACT target/payload/
 * version/amount/audience/impact of the specific action approved
 * (XD-C0535) — never a standing yes. A material change to an
 * already-approved action requires reapproval (XD-C0536); there is no
 * "close enough" execution. (Distinct from PLT-005's generic Approval
 * entity — this one is XD-007's authority-specific policy definition that
 * ActionCapability/AuthorityGrant/ARIAActionRequest reference.)
 */
@Entity('approval_policies')
export class ApprovalPolicy {
  @PrimaryGeneratedColumn('uuid', { name: 'policy_id' })
  policyId: string;

  @Column({ type: 'enum', enum: ApprovalTrigger })
  trigger: ApprovalTrigger;

  @Column({ name: 'threshold_value', type: 'jsonb', nullable: true })
  thresholdValue?: Record<string, unknown>;

  @Column({ name: 'required_approver_role', nullable: true })
  requiredApproverRole?: string;

  /** approvals themselves expire (XD-007 §2.3) */
  @Column({ type: 'interval' })
  expiry: string;
}
