import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * `CORE-C1612` (MI-001, GOV-002 EXECUTED, `MASTER_SPEC.md:1406`) —
 * "A versioned CapturePolicySnapshot records relevant jurisdictions,
 * controller, declared lawful purpose/basis, notice/consent requirements,
 * child/guardian and workplace rules, permitted derivatives, retention
 * and withdrawal consequences." Same versioned-snapshot pattern already
 * used elsewhere in this codebase (`LearningCommercialPolicySnapshot`,
 * `CompliancePolicySnapshot`). `CORE-C1658` (Invariant): **"CapturePolicySnapshot
 * bounds all processing"** — every RecordingSession pins the exact
 * snapshot version in force at capture time (see recording-session.entity.ts),
 * never "whatever the policy currently is."
 *
 * No dedicated `MI-001_*_SCHEMA_v1.md` document exists yet; grounded
 * directly in `gov002_repaired/CORE_repaired.md` rows `CORE-C1608`–
 * `CORE-C1661`, same discipline as this codebase's PLT-006/TEN-001
 * entities and `15_Publication.md`.
 */
@Entity('capture_policy_snapshots')
export class CapturePolicySnapshot {
  @PrimaryGeneratedColumn('uuid', { name: 'capture_policy_snapshot_id' })
  capturePolicySnapshotId: string;

  @Column({ default: 1 })
  version: number;

  @Column({ name: 'relevant_jurisdictions', type: 'jsonb' })
  relevantJurisdictions: Record<string, unknown>;

  @Column({ name: 'controller_ref', type: 'jsonb' })
  controllerRef: Record<string, unknown>;

  @Column({ name: 'declared_lawful_purpose_basis', type: 'jsonb' })
  declaredLawfulPurposeBasis: Record<string, unknown>;

  @Column({ name: 'notice_consent_requirements', type: 'jsonb' })
  noticeConsentRequirements: Record<string, unknown>;

  /** `CORE-C1632`/`CORE-C1633`: children follow `CM-011`; guardian
   * authority never erases child-safety/objection safeguards. */
  @Column({ name: 'child_guardian_workplace_rules', type: 'jsonb' })
  childGuardianWorkplaceRules: Record<string, unknown>;

  /** `CORE-C1659` (Invariant): raw-recording permission does NOT
   * authorise every derivative — this column bounds which derivatives
   * (transcript, summary, clips, etc.) this snapshot actually permits. */
  @Column({ name: 'permitted_derivatives', type: 'jsonb' })
  permittedDerivatives: Record<string, unknown>;

  @Column({ name: 'retention_policy', type: 'jsonb' })
  retentionPolicy: Record<string, unknown>;

  @Column({ name: 'withdrawal_consequences', type: 'jsonb' })
  withdrawalConsequences: Record<string, unknown>;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;
}
