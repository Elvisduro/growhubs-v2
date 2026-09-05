import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** FRM-001 §1 (CORE-C1551) — the exact 19 named use-scope values. Learning
 * Assessments are explicitly OUT of scope (CORE-C1552) — never a value here. */
export enum FormPurpose {
  LEAD = 'LEAD',
  NEWSLETTER = 'NEWSLETTER',
  CONTACT = 'CONTACT',
  SERVICE = 'SERVICE',
  BOOKING = 'BOOKING',
  COURSE = 'COURSE',
  COMMUNITY = 'COMMUNITY',
  EVENT = 'EVENT',
  WAITLIST = 'WAITLIST',
  JOB = 'JOB',
  PARTNER = 'PARTNER',
  CO_SELL = 'CO_SELL',
  SUPPORT = 'SUPPORT',
  ONBOARDING = 'ONBOARDING',
  FEEDBACK = 'FEEDBACK',
  TESTIMONIAL = 'TESTIMONIAL',
  EVIDENCE = 'EVIDENCE',
  INTERNAL = 'INTERNAL',
  ORGANIZATION_INTAKE = 'ORGANIZATION_INTAKE',
}

/** FRM-001 §3.1 (CORE-C1559) — the 6 named linear states. The doc mentions
 * "change/publication/hold/migration branch states" without naming them
 * individually, so only the 6 named states are modeled as enum values here
 * — inventing specific branch-state names would be fabrication beyond what
 * the approved schema actually fixes. */
export enum FormLifecycleState {
  DRAFT = 'DRAFT',
  REVIEW = 'REVIEW',
  PUBLISHED = 'PUBLISHED',
  PAUSED = 'PAUSED',
  RETIRED = 'RETIRED',
  ARCHIVED = 'ARCHIVED',
}

/**
 * FRM-001 §2.1 (CORE-C1553) — FormDefinition: the long-lived container
 * holding tenant/purpose/type/domain/identity/submission/retention/action
 * state — exists before any FormVersion is published and persists across
 * all versions. One of five deliberately separate objects (Form/
 * FormVersion/Submission/Contact-Lead/Consent) — never merged into one
 * "form data" blob (CORE-C1550).
 */
@Entity('form_definitions')
export class FormDefinition {
  @PrimaryGeneratedColumn('uuid', { name: 'form_id' })
  formId: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ type: 'enum', enum: FormPurpose })
  purpose: FormPurpose;

  /** which domain object this form serves — not enumerated in the approved
   * text (domain-specific processing-policy mapping is left open per §13),
   * so stored as a plain string rather than an invented closed enum. */
  @Column({ name: 'domain_type' })
  domainType: string;

  /** which identity modes (see Submission.identityMode) are permitted for
   * this form — FRM-001 §2.7 */
  @Column({ name: 'identity_mode_policy', type: 'jsonb', default: {} })
  identityModePolicy: Record<string, unknown>;

  /** ref -> PLT-001 retention rule; PLT-001 itself is not yet implemented
   * in this scaffold, so stored as a plain nullable ref, not a DB FK. */
  @Column({ name: 'retention_policy_ref', nullable: true })
  retentionPolicyRef?: string;

  @Column({
    name: 'lifecycle_state',
    type: 'enum',
    enum: FormLifecycleState,
    default: FormLifecycleState.DRAFT,
  })
  lifecycleState: FormLifecycleState;
}
