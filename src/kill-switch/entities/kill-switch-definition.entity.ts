import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * PLT-003 (Master Spec lines 864-891) — the exact canonical families a
 * KillSwitchDefinition scopes to (line 872). A definition is a named,
 * versioned control for ONE of these — never one global platform flag
 * (per `22_ModerationCase... ` — actually `22_KillSwitch.md` purpose/scope
 * section, first sentence).
 */
export enum KillSwitchFamily {
  AI = 'AI',
  PAYMENTS_CHECKOUT_REFUND_PAYOUT_SETTLEMENT_POINTS = 'PAYMENTS_CHECKOUT_REFUND_PAYOUT_SETTLEMENT_POINTS',
  ACCESS_GRANTS_INVITATIONS_MINORS_CREDENTIAL_ISSUANCE = 'ACCESS_GRANTS_INVITATIONS_MINORS_CREDENTIAL_ISSUANCE',
  MARKETING_AND_TRANSACTIONAL_COMMUNICATION_MESSAGING = 'MARKETING_AND_TRANSACTIONAL_COMMUNICATION_MESSAGING',
  TORVET_EXTERNAL_DSP_SEARCH_CTA_DISTRIBUTION = 'TORVET_EXTERNAL_DSP_SEARCH_CTA_DISTRIBUTION',
  UPLOAD_LIVE_RECORDING_TRANSCRIPTION_PLAYBACK = 'UPLOAD_LIVE_RECORDING_TRANSCRIPTION_PLAYBACK',
  CONNECTORS_WEBHOOKS_IMPORT_EXPORT_B2BUILD_FEDERATION = 'CONNECTORS_WEBHOOKS_IMPORT_EXPORT_B2BUILD_FEDERATION',
  TORVET_LISTING_RANKING_PLACEMENT_WORK = 'TORVET_LISTING_RANKING_PLACEMENT_WORK',
  GRANULAR_TENANT_CAPABILITIES = 'GRANULAR_TENANT_CAPABILITIES',
  WHITE_LABEL_DOMAIN_APP_RELEASE_DEPLOYMENT = 'WHITE_LABEL_DOMAIN_APP_RELEASE_DEPLOYMENT',
}

/** §"Risk tiers" — govern authority, not state shape (K3/K4 require
 * two-person/incident-commander-plus-review; ARIA may never autonomously
 * activate K3 or K4). */
export enum KillSwitchRiskTier {
  K1 = 'K1',
  K2 = 'K2',
  K3 = 'K3',
  K4 = 'K4',
}

/** the definition lifecycle's own 4 states — separate, longer-lived object
 * from the activation lifecycle. A definition cannot be activated in
 * production until it has passed TESTED with recorded recovery-plan and
 * test evidence. */
export enum KillSwitchDefinitionState {
  DEFINED = 'DEFINED',
  TESTED = 'TESTED',
  PRODUCTION_ELIGIBLE = 'PRODUCTION_ELIGIBLE',
  DEPRECATED = 'DEPRECATED',
}

/** the six named failure-mode options a definition configures (§ States —
 * Activation lifecycle, ACTIVE row). */
export enum KillSwitchFailureMode {
  FAIL_CLOSED = 'FAIL_CLOSED',
  FAIL_OPEN = 'FAIL_OPEN',
  DEGRADED_READ_ONLY = 'DEGRADED_READ_ONLY',
  QUEUE_FOR_REVIEW = 'QUEUE_FOR_REVIEW',
  FALLBACK_PROVIDER = 'FALLBACK_PROVIDER',
  MANUAL_OPERATION = 'MANUAL_OPERATION',
}

/**
 * PLT-003 — KillSwitchDefinition: a named, scoped control for a specific
 * capability/risk (never one global flag). Registered as PLT-005's
 * canonical "Kill Switch" lifecycle family and the mechanism every other
 * domain machine must integrate with for emergency containment (line
 * 1138's canonical failure-class list includes "Kill-Switch" so other
 * machines can fail specifically *because of* an active one).
 *
 * FIELD LIST NOTE: the doc names "recovery plan and test-evidence
 * requirement" (line 870) and "mandatory testing regime" (line 888) but
 * gives no literal field-by-field table — `recoveryPlan` and
 * `testEvidence` are engineering synthesis (jsonb), flagged.
 */
@Entity('kill_switch_definitions')
export class KillSwitchDefinition {
  @PrimaryGeneratedColumn('uuid', { name: 'definition_id' })
  definitionId: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: KillSwitchFamily })
  family: KillSwitchFamily;

  @Column({ name: 'risk_tier', type: 'enum', enum: KillSwitchRiskTier })
  riskTier: KillSwitchRiskTier;

  @Column({ name: 'failure_mode', type: 'enum', enum: KillSwitchFailureMode })
  failureMode: KillSwitchFailureMode;

  /** minimum-effective blast-radius scope shape (capability/tenant/
   * region/etc.) — polymorphic per family, engineering synthesis. */
  @Column({ name: 'scope_shape', type: 'jsonb', default: {} })
  scopeShape: Record<string, unknown>;

  @Column({ name: 'recovery_plan', type: 'jsonb', nullable: true })
  recoveryPlan?: Record<string, unknown>;

  @Column({ name: 'test_evidence', type: 'jsonb', nullable: true })
  testEvidence?: Record<string, unknown>;

  @Column({
    type: 'enum',
    enum: KillSwitchDefinitionState,
    default: KillSwitchDefinitionState.DEFINED,
  })
  state: KillSwitchDefinitionState;

  @Column({ default: 1 })
  version: number;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;
}
