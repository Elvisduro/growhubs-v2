import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** XD-007 §4 (XD-C0531) — exact 5 reversibility classes; a correction must
 * never be mislabeled as a rollback (XD-C0532). Shared by ActionCapability
 * and ARIAActionRequest. */
export enum ReversibilityClass {
  REVERSIBLE = 'REVERSIBLE',
  COMPENSATABLE = 'COMPENSATABLE',
  PARTIALLY_REVERSIBLE = 'PARTIALLY_REVERSIBLE',
  EXTERNALLY_IRREVERSIBLE = 'EXTERNALLY_IRREVERSIBLE',
  LEGALLY_OR_FINANCIALLY_BINDING = 'LEGALLY_OR_FINANCIALLY_BINDING',
}

/** PLT-004's A0-A4 AI-use risk scale, referenced (not redefined) by
 * XD-007 §1/§7 as the ceiling every ActionCapability/AuthorityGrant must
 * respect. Owned by PLT-004 — reproduced here only as the enum values
 * needed to store the ceiling on this table. */
export enum RiskCeiling {
  A0 = 'A0',
  A1 = 'A1',
  A2 = 'A2',
  A3 = 'A3',
  A4 = 'A4',
}

/**
 * XD-007 §2.1 — ActionCapability: every executable domain command ARIA can
 * ever invoke is a versioned, declared capability — never an implicit
 * function call (XD-C0522). Drafting/sending, proposing/publishing,
 * recommending/executing are each separate capabilities (XD-C0523), never
 * one combined action.
 */
@Entity('action_capabilities')
export class ActionCapability {
  @PrimaryGeneratedColumn('uuid', { name: 'capability_id' })
  capabilityId: string;

  @Column({ name: 'capability_version', default: 1 })
  capabilityVersion: number;

  /** which domain module owns this action (Course, Commerce, Communication, ...) */
  @Column({ name: 'owner_domain' })
  ownerDomain: string;

  /** e.g. draft_email, send_email, propose_publish, publish, recommend_refund,
   * execute_refund (XD-C0523) */
  @Column({ name: 'action_name' })
  actionName: string;

  @Column({ name: 'allowed_targets', type: 'jsonb' })
  allowedTargets: Record<string, unknown>;

  @Column({ name: 'permissions_required', type: 'jsonb', default: {} })
  permissionsRequired: Record<string, unknown>;

  @Column({ name: 'risk_ceiling', type: 'enum', enum: RiskCeiling })
  riskCeiling: RiskCeiling;

  @Column({ name: 'reversibility_class', type: 'enum', enum: ReversibilityClass })
  reversibilityClass: ReversibilityClass;

  /** declared, not inferred (XD-007 §2.1) */
  @Column({ name: 'side_effects', type: 'jsonb', default: {} })
  sideEffects: Record<string, unknown>;

  /** ties to XD-004's I0-I7 evidence scale — referenced, not redefined here
   * (XD-007 §15) — stored as a plain string ref rather than a redefined enum. */
  @Column({ name: 'evidence_requirement', nullable: true })
  evidenceRequirement?: string;

  @Column({ name: 'approval_requirement', type: 'uuid', nullable: true })
  approvalRequirement?: string;

  /** monetary/usage caps */
  @Column({ name: 'budget_ceiling', type: 'jsonb', default: {} })
  budgetCeiling: Record<string, unknown>;

  @Column({ name: 'idempotency_contract' })
  idempotencyContract: string;

  /** how to undo/compensate if reversible */
  @Column({ name: 'compensation_contract', nullable: true })
  compensationContract?: string;

  @Column({ name: 'prohibited_contexts', type: 'jsonb', default: {} })
  prohibitedContexts: Record<string, unknown>;

  @Column({ name: 'provider_or_tool', nullable: true })
  providerOrTool?: string;
}
