import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * PF-012 §5 (PF-C0544) — every asset-owning Organization must maintain
 * either at least two verified recovery-capable people with appropriately
 * separated authority, or an approved SuccessionPlan/OrganizationRecovery
 * arrangement — a single-person organization with no succession coverage
 * is exactly the failure mode this clause exists to prevent (the
 * "single-person silent takeover" proof scenario, §8).
 *
 * §5.1 (PF-C0545) — SuccessionPlan: records the nominated successor or
 * governing body, activation conditions, proof classes required,
 * protected assets, an interim operator, communication plan, and
 * jurisdictional rules.
 *
 * A SuccessionPlan never grants dormant access before valid activation
 * (PF-C0546) — the nominated successor holds NO standing access
 * whatsoever until activationConditions are actually met and verified;
 * this table only ever describes a future arrangement, it never itself
 * carries a live grant (that would be a RoleAssignment/AuthorityGrant row
 * created only once OrganizationRecoveryCase's REVIEW/APPROVED steps
 * actually verify activation — see organization-recovery-case.entity.ts).
 *
 * FIELD LIST NOTE: `communicationPlan` is named in the prose (PF-C0545)
 * but not broken out in the field table the approved text gives for this
 * entity — included here as its own jsonb column rather than dropped,
 * still flagged as a synthesis of the prose rather than the literal table.
 */
@Entity('succession_plans')
export class SuccessionPlan {
  @PrimaryGeneratedColumn('uuid', { name: 'succession_plan_id' })
  successionPlanId: string;

  @Column({ name: 'organization_id', type: 'uuid' })
  organizationId: string;

  /** person or governing body */
  @Column({ name: 'nominated_successor_ref' })
  nominatedSuccessorRef: string;

  @Column({ name: 'activation_conditions', type: 'jsonb' })
  activationConditions: Record<string, unknown>;

  @Column({ name: 'required_proof_classes', type: 'jsonb' })
  requiredProofClasses: Record<string, unknown>;

  @Column({ name: 'protected_assets', type: 'jsonb' })
  protectedAssets: Record<string, unknown>;

  @Column({ name: 'interim_operator_ref', nullable: true })
  interimOperatorRef?: string;

  @Column({ name: 'communication_plan', type: 'jsonb', default: {} })
  communicationPlan: Record<string, unknown>;

  @Column({ name: 'jurisdictional_rules', type: 'jsonb', default: {} })
  jurisdictionalRules: Record<string, unknown>;
}
