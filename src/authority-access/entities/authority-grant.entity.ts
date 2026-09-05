import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { RiskCeiling } from './action-capability.entity';

/**
 * XD-007 §2.2 (XD-C0524) — the row that actually authorizes ARIA to use a
 * capability for a specific principal.
 *
 * Authority precedence (XD-C0525): platform/jurisdiction ceiling -> tenant
 * -> role -> user/object/workflow -> individual approval. A lower level may
 * only RESTRICT what a higher level grants, never expand it (XD-C0526).
 *
 * Critical constraint (XD-C0527): ARIA must never automatically inherit
 * all of a human principal's permissions — every grant here is scoped
 * explicitly; there is no "ARIA acts as user X, full stop" mode.
 *
 * `revocationState`'s concrete enum values are an ENGINEERING CHOICE, not
 * a cited clause — XD-007 §2.2 says only "revocation_state | enum |" with
 * no enumerated value list. ACTIVE/REVOKED/EXPIRED/SUSPENDED is a
 * reasonable minimal set; revisit if a later domain schema needs more.
 */
export enum AuthorityGrantRevocationState {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  REVOKED = 'REVOKED',
  EXPIRED = 'EXPIRED',
}

@Entity('authority_grants')
export class AuthorityGrant {
  @PrimaryGeneratedColumn('uuid', { name: 'grant_id' })
  grantId: string;

  /** the human ARIA acts on behalf of — FK to PF-011's Person */
  @Column({ name: 'principal_person_id', type: 'uuid' })
  principalPersonId: string;

  /** which ARIA agent/persona (per XD-005's four agent types) */
  @Column({ name: 'delegated_agent' })
  delegatedAgent: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ name: 'workspace_id', type: 'uuid', nullable: true })
  workspaceId?: string;

  @Column({ name: 'role_id', type: 'uuid', nullable: true })
  roleId?: string;

  @Column({ type: 'jsonb', default: {} })
  context: Record<string, unknown>;

  @Column({ name: 'capability_id', type: 'uuid' })
  capabilityId: string;

  @Column({ name: 'capability_version' })
  capabilityVersion: number;

  /** target/data/audience/channel/purpose */
  @Column({ name: 'target_scope', type: 'jsonb' })
  targetScope: Record<string, unknown>;

  @Column({ name: 'permitted_actions', type: 'jsonb', default: {} })
  permittedActions: Record<string, unknown>;

  @Column({ name: 'prohibited_actions', type: 'jsonb', default: {} })
  prohibitedActions: Record<string, unknown>;

  /** must not exceed the capability's own ceiling (XD-007 §2.2) */
  @Column({ name: 'risk_ceiling', type: 'enum', enum: RiskCeiling })
  riskCeiling: RiskCeiling;

  /** monetary/usage/frequency/time/geography limits */
  @Column({ type: 'jsonb', default: {} })
  limits: Record<string, unknown>;

  @Column({ name: 'evidence_confidence_floor', type: 'float', nullable: true })
  evidenceConfidenceFloor?: number;

  @Column({ name: 'approval_policy_id', type: 'uuid', nullable: true })
  approvalPolicyId?: string;

  @Column({ type: 'interval', nullable: true })
  duration?: string;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt?: Date;

  @Column({
    name: 'revocation_state',
    type: 'enum',
    enum: AuthorityGrantRevocationState,
    default: AuthorityGrantRevocationState.ACTIVE,
  })
  revocationState: AuthorityGrantRevocationState;

  /** what happens if the grant lapses mid-task */
  @Column({ name: 'fallback_behavior' })
  fallbackBehavior: string;

  /** who can approve actions under this grant */
  @Column({ type: 'jsonb', default: {} })
  approvers: Record<string, unknown>;
}
