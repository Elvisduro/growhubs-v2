import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * XD-008 §2.1 (XD-C0585) — AccessPolicy: the canonical, versioned rule set —
 * the first noun in the four-object model (AccessPolicy / AccessGrant /
 * AccessRestriction / AccessDecision). The concrete rule_body DSL/engine is
 * an engineering choice, not a governance decision — XD-008 fixes the
 * precedence and semantics (§4), not the query language (XD-008 §12).
 */
@Entity('access_policies')
export class AccessPolicy {
  @PrimaryGeneratedColumn('uuid', { name: 'policy_id' })
  policyId: string;

  @Column({ default: 1 })
  version: number;

  /** tenant/object-type/capability this policy governs */
  @Column({ type: 'jsonb' })
  scope: Record<string, unknown>;

  @Column({ name: 'rule_body', type: 'jsonb' })
  ruleBody: Record<string, unknown>;
}
