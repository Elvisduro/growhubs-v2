import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * CL-013 §1 (CL-C1431-C1434) — the foundational structure: each Person has
 * exactly ONE canonical, private, longitudinal LearnerRecord. Source
 * domains continue to own their objects (CL-C1432) — this table indexes
 * identities/references/provenance and governed PROJECTIONS over that
 * data; it must never become a competing copy of truth (CL-C1434). This is
 * why Grade/Rubric/RubricVersion/CriterionResult/InstructorFeedback (§7,
 * CL-C1460 — the Gradebook) are deliberately NOT modeled as tables in this
 * file, or anywhere in this scaffold yet: CL-013 explicitly does not take
 * ownership of them, and no approved document so far has given the
 * Gradebook its own field-level schema. Building Gradebook tables here
 * would be scope creep beyond what CL-011/CL-012/CL-013 actually define.
 */
@Entity('learner_records')
export class LearnerRecord {
  @PrimaryGeneratedColumn('uuid', { name: 'learner_record_id' })
  learnerRecordId: string;

  /** exactly one per Person (CL-C1483, invariant 1) */
  @Column({ name: 'person_id', type: 'uuid', unique: true })
  personId: string;

  /** pointers into source-domain objects, never copies */
  @Column({ name: 'indexed_refs', type: 'jsonb', default: {} })
  indexedRefs: Record<string, unknown>;
}

/** CL-013 §5 (CL-C1458) — the exact 7 named verification-classification
 * values. A learner cannot present unverified self-declared content with
 * the same visual weight as an issuer-verified Credential; this
 * classification travels with the item (reused by Portfolio items via
 * ProjectedLearningFact references). */
export enum VerificationStatus {
  SELF_DECLARED = 'SELF_DECLARED',
  ISSUER_VERIFIED = 'ISSUER_VERIFIED',
  PLATFORM_VERIFIED = 'PLATFORM_VERIFIED',
  EXTERNALLY_VERIFIED = 'EXTERNALLY_VERIFIED',
  DISPUTED = 'DISPUTED',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED',
}

/** CL-013 §4 (CL-C1451-C1453) — facts are append/version corrected, never
 * silently overwritten; revocation preserves the historical issuance and
 * its governed status/reason. No exact enum-value list is given in the
 * approved text for this specific field (unlike verification_status
 * above), so this 3-value set is an engineering synthesis of that prose,
 * flagged here explicitly. */
export enum CorrectionRevocationStatus {
  ACTIVE = 'ACTIVE',
  CORRECTED = 'CORRECTED',
  REVOKED = 'REVOKED',
}

/**
 * CL-013 §2.2 (CL-C1450) — ProjectedLearningFact: the atomic unit every
 * projection (Transcript, Portfolio, Passport) is built from. Per
 * CL-C1450, every field is MANDATORY on every projected fact — none of the
 * columns below is nullable; a fact missing its evidence reference or
 * verification status is not a valid ProjectedLearningFact. (A
 * self-declared fact still populates issuer_authority_ref — with a value
 * identifying the declarant themselves — rather than leaving it empty, so
 * the mandatory-field invariant holds uniformly across all seven
 * verification statuses.)
 */
@Entity('projected_learning_facts')
export class ProjectedLearningFact {
  @PrimaryGeneratedColumn('uuid', { name: 'fact_id' })
  factId: string;

  @Column({ name: 'subject_person_id', type: 'uuid' })
  subjectPersonId: string;

  /** Grade/Credential/Completion/Attendance/etc. — the doc's own list ends
   * in "etc.", explicitly open-ended, so stored as a string rather than an
   * invented closed enum (same convention as FRM-001's FieldDefinition
   * field_type). */
  @Column({ name: 'fact_type' })
  factType: string;

  /** the owning domain's actual row — e.g. a Gradebook Grade row once that
   * table exists; polymorphic, so JSON rather than a DB FK. */
  @Column({ name: 'source_object_ref', type: 'jsonb' })
  sourceObjectRef: Record<string, unknown>;

  @Column({ name: 'issuer_authority_ref' })
  issuerAuthorityRef: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ name: 'programme_course_delivery_ref', type: 'jsonb' })
  programmeCourseDeliveryRef: Record<string, unknown>;

  @Column({ name: 'occurred_at', type: 'timestamptz' })
  occurredAt: Date;

  @Column({ name: 'effective_at', type: 'timestamptz' })
  effectiveAt: Date;

  @Column({ default: 1 })
  version: number;

  @Column({ name: 'evidence_refs', type: 'jsonb' })
  evidenceRefs: Record<string, unknown>;

  @Column({ name: 'verification_status', type: 'enum', enum: VerificationStatus })
  verificationStatus: VerificationStatus;

  @Column({ name: 'visibility_policy', type: 'jsonb' })
  visibilityPolicy: Record<string, unknown>;

  @Column({ name: 'retention_class' })
  retentionClass: string;

  @Column({
    name: 'correction_revocation_status',
    type: 'enum',
    enum: CorrectionRevocationStatus,
    default: CorrectionRevocationStatus.ACTIVE,
  })
  correctionRevocationStatus: CorrectionRevocationStatus;
}

/** CL-013 §2.3 (CL-C1436) — the exact 4 named states. */
export enum TranscriptState {
  OFFICIAL = 'OFFICIAL',
  PROVISIONAL = 'PROVISIONAL',
  CORRECTED = 'CORRECTED',
  REVOKED = 'REVOKED',
}

/**
 * CL-013 §2.3 (CL-C1436) — Transcript: a FORMAL, versioned, issuer-
 * authorised projection — never learner-editable. An issued Transcript's
 * history does not change merely because underlying course content or
 * grading policy later changes (CL-C1456) — nothing in this codebase
 * issues an UPDATE against `content` on an OFFICIAL row; a correction
 * produces a new version.
 */
@Entity('transcripts')
export class Transcript {
  @PrimaryGeneratedColumn('uuid', { name: 'transcript_id' })
  transcriptId: string;

  @Column({ name: 'person_id', type: 'uuid' })
  personId: string;

  @Column({ name: 'issuer_ref' })
  issuerRef: string;

  /** programme/course, credits/hours, Grade+scale, completion date,
   * competency outcomes, delivery/institution, Credential identifiers,
   * transfer/equivalence (CL-C1454) */
  @Column({ type: 'jsonb' })
  content: Record<string, unknown>;

  @Column({ type: 'enum', enum: TranscriptState })
  state: TranscriptState;

  @Column({ default: 1 })
  version: number;

  /** for external verifiability (CL-C1455) */
  @Column({ name: 'digital_signature', nullable: true })
  digitalSignature?: string;
}

/**
 * CL-013 §2.4 (CL-C1437) — Portfolio: a LEARNER-CURATED presentation — the
 * opposite pole from Transcript. The learner controls visibility (§6,
 * CL-C1464) but never the verification classification of an item
 * (CL-C1466, CL-C1465) — that classification lives on the referenced
 * ProjectedLearningFact, not here.
 */
@Entity('portfolios')
export class Portfolio {
  @PrimaryGeneratedColumn('uuid', { name: 'portfolio_id' })
  portfolioId: string;

  @Column({ name: 'person_id', type: 'uuid' })
  personId: string;

  /** each item references a ProjectedLearningFact or free-standing
   * learner content */
  @Column({ type: 'jsonb', default: [] })
  items: Record<string, unknown>[];

  /** per-item public/private (§6) */
  @Column({ name: 'disclosure_settings', type: 'jsonb', default: {} })
  disclosureSettings: Record<string, unknown>;
}

/**
 * CL-013 §2.5 (CL-C1438) — LearningPassport: the PORTABLE, multi-source
 * experience over verified facts — aggregates verified
 * ProjectedLearningFact rows across every tenant/issuer a Person has
 * learned with. Distinct from both Transcript (single-issuer, formal) and
 * Portfolio (learner-curated, presentational).
 *
 * FIELD LIST NOTE: no literal field table is given for this entity in the
 * approved text (unlike Transcript/Portfolio above) — the single
 * `aggregated_fact_refs` column below is an engineering synthesis, flagged
 * here explicitly.
 */
@Entity('learning_passports')
export class LearningPassport {
  @PrimaryGeneratedColumn('uuid', { name: 'passport_id' })
  passportId: string;

  @Column({ name: 'person_id', type: 'uuid', unique: true })
  personId: string;

  @Column({ name: 'aggregated_fact_refs', type: 'jsonb', default: [] })
  aggregatedFactRefs: string[];
}

/**
 * CL-013 §2.6 (CL-C1439) — Profile: exposes only an authorised or
 * learner-selected subset — the public-facing surface, narrower than
 * either Transcript or Passport by design. Named `LearnerProfile` (not
 * bare `Profile`) in this codebase to avoid colliding with any future
 * general-purpose Profile entity elsewhere in the platform.
 *
 * FIELD LIST NOTE: no literal field table is given for this entity either
 * — synthesized, flagged as with LearningPassport above.
 *
 * NOTE on CL-013 §2.7 (sponsor/compliance projections, CL-C1440): these
 * are explicitly a VIEW over ProjectedLearningFact + CL-012's
 * ComplianceEvaluation under CL-012's own scoping rules, not a distinct
 * persisted entity — no table is created for them here, consistent with
 * the approved text giving them no field list of their own.
 */
@Entity('learner_profiles')
export class LearnerProfile {
  @PrimaryGeneratedColumn('uuid', { name: 'profile_id' })
  profileId: string;

  @Column({ name: 'person_id', type: 'uuid', unique: true })
  personId: string;

  @Column({ name: 'visible_fact_refs', type: 'jsonb', default: [] })
  visibleFactRefs: string[];
}
