import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * PF-011 §2.8 — BillingAccount: deliberately separate from Tenant/
 * Organization data ownership (PF-C0502) — funding a scope never implies
 * owning its data. Personal purchases remain personal (PF-C0505).
 */
@Entity('billing_accounts')
export class BillingAccount {
  @PrimaryGeneratedColumn('uuid', { name: 'billing_account_id' })
  billingAccountId: string;

  /** polymorphic ref — a Person or an Organization can be a payer. */
  @Column({ name: 'payer_person_or_org_id', type: 'uuid' })
  payerPersonOrOrgId: string;

  /** may fund entitlements across scopes without becoming the data owner
   * of any of them (PF-C0504) — e.g. an enterprise sponsor. */
  @Column({ name: 'funds_tenant_ids', type: 'uuid', array: true, default: '{}' })
  fundsTenantIds: string[];
}
