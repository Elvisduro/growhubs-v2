import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * CM-012 §2.5 (CM-C1148) — ModerationEnvelope and ConversationCase: the
 * moderation wrapper and case object FOR a Conversation, feeding into the
 * "Moderation Case" PLT-005 family (CORE-C2021), with ChildSafetyCase
 * remaining its own distinct, separately-governed sub-family (CORE-C2043).
 *
 * ================================================================
 * DELIBERATE SCOPE BOUNDARY — READ BEFORE ADDING ANYTHING HERE
 * ================================================================
 * This file intentionally implements ONLY a thin pointer from a
 * Conversation to "there is a moderation case, here is its family and
 * reference" — it does NOT implement the ModerationCase/ChildSafetyCase
 * state machine itself. That machine is fully specified in this
 * engagement's own `20_ModerationCase.md` (grounded in PLT-005 + CM-011,
 * approved 2026-09-03) and is a large, security-critical piece of work in
 * its own right: it requires a SEGREGATED ACCESS-CONTROL PLANE (not
 * role-based visibility filtering on a shared table), a case-bound
 * least-privilege specialist-grant mechanism, the full
 * REPORTED_OR_DETECTED -> AUTO_CONTAINED -> SPECIALIST_TRIAGE ->
 * JURISDICTION_ROUTING -> ACTION_AND_REPORTING -> ONGOING_PRESERVATION ->
 * RESOLVED lifecycle (plus IMMINENT_DANGER / LIKELY_FALSE_POSITIVE_REVIEW /
 * INSUFFICIENT_EVIDENCE / AUTHORITY_PENDING / DUPLICATE /
 * SPECIALIST_TRANSFER / RESTRICTED_HOLD branches), and the
 * JurisdictionalReportingRegistry integration.
 *
 * Given this engagement's standing instruction to treat CM-011/child-
 * safety material with maximum precision, that machine deserves its own
 * dedicated implementation pass — built and reviewed as its own task,
 * never bundled quickly as a side effect of CM-012's Communication-domain
 * schema. Building it carelessly here (e.g. adding a "safety_category"
 * enum column to a table general Trust & Safety staff or tenant admins can
 * query) would itself violate CM-011's hard segregation requirement.
 *
 * So: `caseFamily`/`caseRef` below are generic, opaque pointers. No
 * safety-taxonomy field, no specialist-identity field, no containment-
 * state field lives on this table. When the ModerationCase/ChildSafetyCase
 * family is actually implemented, it gets its own segregated tables/access
 * layer, and `caseRef` here will point into that — this table itself never
 * grows child-safety-specific columns.
 */
@Entity('moderation_envelopes')
export class ModerationEnvelope {
  @PrimaryGeneratedColumn('uuid', { name: 'envelope_id' })
  envelopeId: string;

  @Column({ name: 'conversation_id', type: 'uuid' })
  conversationId: string;

  /** e.g. "ORDINARY_MODERATION_CASE" | "CHILD_SAFETY_CASE" — a bare label,
   * never a field that itself carries case content. */
  @Column({ name: 'case_family' })
  caseFamily: string;

  /** opaque pointer into the (not-yet-implemented) ModerationCase family's
   * own segregated storage — nullable until that family exists. */
  @Column({ name: 'case_ref', nullable: true })
  caseRef?: string;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;
}

/**
 * CM-012 §2.5 — ConversationCase: the case-side counterpart to
 * ModerationEnvelope. Same scope boundary applies — see the doc comment on
 * ModerationEnvelope above. This table holds nothing about case content;
 * it only records that a case is open against a conversation and a
 * minimal, non-sensitive status for Communication-domain UI purposes
 * (e.g. showing a participant "this conversation is under review" without
 * exposing anything about why).
 */
export enum ConversationCaseStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

@Entity('conversation_cases')
export class ConversationCase {
  @PrimaryGeneratedColumn('uuid', { name: 'case_id' })
  caseId: string;

  @Column({ name: 'conversation_id', type: 'uuid' })
  conversationId: string;

  /** opaque pointer, same discipline as ModerationEnvelope.caseRef. */
  @Column({ name: 'moderation_case_ref', nullable: true })
  moderationCaseRef?: string;

  @Column({
    type: 'enum',
    enum: ConversationCaseStatus,
    default: ConversationCaseStatus.OPEN,
  })
  status: ConversationCaseStatus;

  @Column({ name: 'opened_at', type: 'timestamptz', default: () => 'now()' })
  openedAt: Date;
}
