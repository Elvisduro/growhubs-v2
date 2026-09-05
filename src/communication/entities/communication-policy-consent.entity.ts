import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * CM-012 §2.4 — CommunicationPolicy: governs a Conversation's cross-tenant
 * (§3) and minors (§6) behavior. §6 note applies here too: `minorsRules`
 * is an opaque container for this schema's own stated consequences
 * (CM-C1173-C1176) — it never redefines CM-011's own child-safety policy.
 *
 * FIELD LIST NOTE: no literal field table given for this entity —
 * synthesized from the prose (§3, §6), flagged explicitly. Nullable
 * `conversationId`: a policy may be a tenant-wide default rather than
 * bound to one specific conversation.
 */
@Entity('communication_policies')
export class CommunicationPolicy {
  @PrimaryGeneratedColumn('uuid', { name: 'policy_id' })
  policyId: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ name: 'conversation_id', type: 'uuid', nullable: true })
  conversationId?: string;

  @Column({ name: 'cross_tenant_rules', type: 'jsonb', default: {} })
  crossTenantRules: Record<string, unknown>;

  @Column({ name: 'minors_rules', type: 'jsonb', default: {} })
  minorsRules: Record<string, unknown>;
}

/**
 * CM-012 §2.4 — CommunicationConsent: consent governing a Conversation's
 * cross-tenant/minors behavior. Withdrawal modeled as an appended
 * `withdrawnAt` timestamp, never a mutable status flip — same discipline
 * as FRM-001's ConsentReceipt (CORE-C1575: withdrawal must never rewrite
 * lawful history).
 *
 * FIELD LIST NOTE: no literal field table given — synthesized, flagged.
 */
@Entity('communication_consents')
export class CommunicationConsent {
  @PrimaryGeneratedColumn('uuid', { name: 'consent_id' })
  consentId: string;

  @Column({ name: 'conversation_id', type: 'uuid' })
  conversationId: string;

  @Column({ name: 'person_id', type: 'uuid' })
  personId: string;

  @Column({ name: 'consent_type' })
  consentType: string;

  @Column({ name: 'given_at', type: 'timestamptz', default: () => 'now()' })
  givenAt: Date;

  @Column({ name: 'withdrawn_at', type: 'timestamptz', nullable: true })
  withdrawnAt?: Date;
}
