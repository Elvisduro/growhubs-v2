import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * FinancialCredit — PLT-006's "monetary Financial Credit" object
 * (`CORE-C1952`), kept separate from `Entitlement`/`Allowance`/
 * `UsageEvent`: **"ARIA/usage units are not automatically money, wallet
 * points or refunds"** (`CORE-C1953`) — a FinancialCredit row is the only
 * thing in this family that represents actual monetary value.
 *
 * Field shape grounded in `CORE-C1989` (Superadmin ResourceHealth):
 * "Every manual credit/adjustment records reason, authority, case,
 * expiry, ledger impact and audit." No other field-level content for
 * this object exists in the approved decision set — everything below
 * traces to that one clause; nothing further invented.
 */
@Entity('financial_credits')
export class FinancialCredit {
  @PrimaryGeneratedColumn('uuid', { name: 'financial_credit_id' })
  financialCreditId: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column()
  reason: string;

  /** the AuthorityGrant (XD-007) this credit/adjustment was issued
   * under. */
  @Column({ name: 'authority_ref', type: 'uuid', nullable: true })
  authorityRef?: string;

  /** the case (support/dispute/refund/etc.) this credit is tied to, if
   * any. */
  @Column({ name: 'case_ref', type: 'jsonb', nullable: true })
  caseRef?: Record<string, unknown>;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt?: Date;

  @Column({ name: 'ledger_impact', type: 'jsonb' })
  ledgerImpact: Record<string, unknown>;

  @Column({ name: 'audit_ref', type: 'jsonb' })
  auditRef: Record<string, unknown>;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;
}
