import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

/** `CORE-C1962` (PLT-006, `MASTER_SPEC.md:984`) — the 9 named overage
 * models verbatim: "no-overage hard cap, pay-as-you-go, prepaid add-on,
 * explicit-consent auto-top-up with amount/frequency cap, period invoice,
 * approval, enterprise commitment, fair-use review or sponsored
 * allowance." */
export enum OverageModel {
  NO_OVERAGE_HARD_CAP = 'NO_OVERAGE_HARD_CAP',
  PAY_AS_YOU_GO = 'PAY_AS_YOU_GO',
  PREPAID_ADD_ON = 'PREPAID_ADD_ON',
  EXPLICIT_CONSENT_AUTO_TOP_UP = 'EXPLICIT_CONSENT_AUTO_TOP_UP',
  PERIOD_INVOICE = 'PERIOD_INVOICE',
  APPROVAL = 'APPROVAL',
  ENTERPRISE_COMMITMENT = 'ENTERPRISE_COMMITMENT',
  FAIR_USE_REVIEW = 'FAIR_USE_REVIEW',
  SPONSORED_ALLOWANCE = 'SPONSORED_ALLOWANCE',
}

/**
 * Allowance — PLT-006's "included Allowance" object (`CORE-C1952`), kept
 * separate from `Entitlement` (functional right), `UsageEvent` (measured
 * usage) and `Financial Credit` (monetary) per that same clause. Field
 * shape grounded in `CORE-C1958` (reservation/disclosure: remaining
 * allowance, expected/max authorised overage, default 50/75/90/100%
 * information/forecast/action/exhaustion thresholds, specialisable per
 * meter/plan) and `CORE-C1963` (tenant budgets scoped month/resource/
 * team/role/project/Product/model/campaign/day, approval threshold,
 * emergency reserve — `CORE-C1964`: ordinary members cannot exceed a
 * budget merely because a payment method exists).
 */
@Entity('allowances')
@Index(['tenantId', 'meterDefinitionId'])
export class Allowance {
  @PrimaryGeneratedColumn('uuid', { name: 'allowance_id' })
  allowanceId: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ name: 'meter_definition_id', type: 'uuid' })
  meterDefinitionId: string;

  @Column({ name: 'period_ref', type: 'jsonb' })
  periodRef: Record<string, unknown>;

  @Column({ name: 'included_quantity', type: 'numeric' })
  includedQuantity: string;

  @Column({ name: 'consumed_quantity', type: 'numeric', default: 0 })
  consumedQuantity: string;

  /** default 50/75/90/100 percent information/forecast/action/exhaustion
   * thresholds (CORE-C1958), specialisable per meter/plan. */
  @Column({
    name: 'thresholds_percent',
    type: 'jsonb',
    default: () => `'[50,75,90,100]'`,
  })
  thresholdsPercent: number[];

  @Column({ name: 'overage_model', type: 'enum', enum: OverageModel })
  overageModel: OverageModel;

  /** tenant budget scope (month/resource/team/role/project/Product/model/
   * campaign/day), approval threshold and emergency reserve (CORE-C1963). */
  @Column({ name: 'budget_scope', type: 'jsonb', nullable: true })
  budgetScope?: Record<string, unknown>;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;
}
