import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * ChildSafetyCase — per `20_ModerationCase.md`'s ChildSafetyCase branch,
 * grounded in CM-011 and PLT-005 lines 1132-1153. This is a SEPARATE table
 * from `moderation_cases` (see moderation-case.entity.ts), never a
 * status/category value on that shared table, because CM-011 requires a
 * hard segregation of access, not a role-based visibility filter on shared
 * rows: ordinary tenant admins, instructors, moderators, guardians,
 * support staff, developers, general Superadmin, and general analytics
 * are ALL categorically excluded from this table's content. Only a
 * "Restricted Child Safety Specialist" function, or a competent legal
 * authority acting through the reporting/preservation path, may access a
 * row here — case-bound, least-privilege, time-boxed, audited, no local
 * copy, and (per the doc) possibly requiring two-person control for the
 * most sensitive actions.
 *
 * SCOPE NOTE — first-cut mechanism, not a complete implementation:
 * this migration pairs this table with `ENABLE ROW LEVEL SECURITY` +
 * `FORCE ROW LEVEL SECURITY` + a default-deny policy keyed on a new
 * session variable, `app.is_restricted_child_safety_specialist` (see the
 * companion migration `EnableRlsChildSafetySpecialistAccess`), mirroring
 * the tenant-isolation RLS pattern from ADR-002 but for role segregation
 * instead of tenant isolation. THIS ALONE DOES NOT SATISFY CM-011:
 * case-bound/time-boxed grants, two-person control for the most sensitive
 * transitions, a durable access-audit trail, and enforcement against
 * local copies/exports are all still open application-layer work, not
 * covered by a database RLS policy. Treat this table's existence as
 * "the data now has a locked door," not as "the full access-governance
 * requirement is met."
 *
 * `detectionSignalType` is deliberately a plain string reference, NOT an
 * enumerated closed list of the actual CM-011 detection/taxonomy
 * categories — inventing and naming that taxonomy here would mean
 * fabricating sensitive classification substance that was never given as
 * a literal enum in the approved text, which this engagement's
 * citation-verification discipline forbids. The actual taxonomy, if it
 * exists, belongs in a specialist-only reference table/service outside
 * this codebase's current scope.
 *
 * The 14 named states below are the ChildSafetyCase branch's exact states
 * from `20_ModerationCase.md`'s state table.
 */
export enum ChildSafetyCaseState {
  REPORTED_OR_DETECTED = 'REPORTED_OR_DETECTED',
  AUTO_CONTAINED = 'AUTO_CONTAINED',
  SPECIALIST_TRIAGE = 'SPECIALIST_TRIAGE',
  JURISDICTION_ROUTING = 'JURISDICTION_ROUTING',
  ACTION_AND_REPORTING = 'ACTION_AND_REPORTING',
  ONGOING_PRESERVATION = 'ONGOING_PRESERVATION',
  RESOLVED = 'RESOLVED',
  IMMINENT_DANGER = 'IMMINENT_DANGER',
  LIKELY_FALSE_POSITIVE_REVIEW = 'LIKELY_FALSE_POSITIVE_REVIEW',
  INSUFFICIENT_EVIDENCE = 'INSUFFICIENT_EVIDENCE',
  AUTHORITY_PENDING = 'AUTHORITY_PENDING',
  DUPLICATE = 'DUPLICATE',
  SPECIALIST_TRANSFER = 'SPECIALIST_TRANSFER',
  RESTRICTED_HOLD = 'RESTRICTED_HOLD',
}

@Entity('child_safety_cases')
export class ChildSafetyCase {
  @PrimaryGeneratedColumn('uuid', { name: 'case_id' })
  caseId: string;

  /** polymorphic pointer to the reported subject — deliberately a
   * reference only, never the sensitive content itself. */
  @Column({ name: 'subject_ref', type: 'jsonb' })
  subjectRef: Record<string, unknown>;

  @Column({
    type: 'enum',
    enum: ChildSafetyCaseState,
    default: ChildSafetyCaseState.REPORTED_OR_DETECTED,
  })
  state: ChildSafetyCaseState;

  /** domain-owned state-version column, same pattern as ModerationCase /
   * FRM-001's Submission / CL-012's Enrollment / TV-012's
   * TorvetProjection. */
  @Column({ name: 'state_version', default: 0 })
  stateVersion: number;

  /** plain reference to which detection signal/source flagged this case
   * — deliberately NOT a closed enum of the actual taxonomy (see class
   * doc comment). */
  @Column({ name: 'detection_signal_type' })
  detectionSignalType: string;

  @Column({ name: 'containment_at', type: 'timestamptz', nullable: true })
  containmentAt?: Date;

  /** append-only audit record of who was granted specialist access, when,
   * why, and for how long — a first-cut in-row log; a dedicated
   * audit-trail store is follow-up work (see class doc comment). */
  @Column({ name: 'specialist_access_grants', type: 'jsonb', default: [] })
  specialistAccessGrants: Record<string, unknown>[];

  /** which version of the jurisdictional routing registry (reporting
   * obligations by region/authority) was used to route this case —
   * engineering synthesis, flagged, since no literal field/table is given
   * for this in the source text. */
  @Column({ name: 'jurisdictional_registry_version', nullable: true })
  jurisdictionalRegistryVersion?: string;

  /** evidence that a legally-required report to a competent authority was
   * filed — engineering synthesis, flagged. */
  @Column({ name: 'reporting_obligation_evidence', type: 'jsonb', nullable: true })
  reportingObligationEvidence?: Record<string, unknown>;

  /** legal basis under which evidence is being retained during
   * ONGOING_PRESERVATION — engineering synthesis, flagged. */
  @Column({ name: 'preservation_retention_basis', nullable: true })
  preservationRetentionBasis?: string;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;
}
