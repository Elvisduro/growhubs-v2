import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * `19_SupportCase.md` — the 13 named states exactly as given in the doc's
 * state table. Initial: SUBMITTED. Terminal: RESOLVED_CLOSED,
 * CLOSED_NO_RESPONSE, WITHDRAWN_BY_REQUESTER, MERGED_INTO_OTHER_CASE,
 * ESCALATED_TO_INCIDENT (case-level terminal only — the underlying work
 * continues under a separate Incident lifecycle, out of this codebase's
 * current scope). REOPENED is explicitly non-terminal — it re-enters
 * TRIAGE or WITH_HUMAN_AGENT per the doc's own state-table note.
 *
 * Binding constraint (PLT-005): **ARIA answer does not close Support.**
 * An ARIA-generated answer/diagnostic/fix may be attached at any point,
 * but it can never by itself transition the case to a closed/resolved
 * terminal state — closure requires a distinct human action or an
 * explicit, separately-authorized automated-closure policy. Per the
 * doc's own idempotency note, this is a STRUCTURAL guarantee: the
 * AI_ASSISTED -> AWAITING_REQUESTER_CONFIRMATION transition and any
 * subsequent closure transition must be enforced as separate commands
 * with separate authorization checks at the application layer — no
 * single "AI-answer-and-close" command may exist. Nothing at the entity/
 * column level can enforce this by itself; it is an application-layer
 * invariant every command handler must honor, same category of rule as
 * TV-012's "never fall back to a cached transaction."
 */
export enum SupportCaseState {
  SUBMITTED = 'SUBMITTED',
  TRIAGE = 'TRIAGE',
  AI_ASSISTED = 'AI_ASSISTED',
  AWAITING_REQUESTER_CONFIRMATION = 'AWAITING_REQUESTER_CONFIRMATION',
  QUEUED_FOR_HUMAN = 'QUEUED_FOR_HUMAN',
  WITH_HUMAN_AGENT = 'WITH_HUMAN_AGENT',
  PENDING_REQUESTER_INFO = 'PENDING_REQUESTER_INFO',
  PENDING_INTERNAL_DEPENDENCY = 'PENDING_INTERNAL_DEPENDENCY',
  RESOLVED_PENDING_CLOSE = 'RESOLVED_PENDING_CLOSE',
  RESOLVED_CLOSED = 'RESOLVED_CLOSED',
  CLOSED_NO_RESPONSE = 'CLOSED_NO_RESPONSE',
  WITHDRAWN_BY_REQUESTER = 'WITHDRAWN_BY_REQUESTER',
  MERGED_INTO_OTHER_CASE = 'MERGED_INTO_OTHER_CASE',
  ESCALATED_TO_INCIDENT = 'ESCALATED_TO_INCIDENT',
  REOPENED = 'REOPENED',
}

/** §Audit evidence requirements — closure must name exactly one of these
 * three authorizing sources; "a closure record that cannot name one of
 * these three is a defect, not a valid transition." Given verbatim in
 * the source text, not invented. */
export enum ResolutionClosureAuthority {
  REQUESTER_CONFIRMATION = 'REQUESTER_CONFIRMATION',
  HUMAN_AGENT_ACTION = 'HUMAN_AGENT_ACTION',
  AUTHORIZED_AUTOMATED_CLOSURE_POLICY = 'AUTHORIZED_AUTOMATED_CLOSURE_POLICY',
}

/**
 * SupportCase: one tenant end-user/tenant-admin/GrowHubs-customer help
 * request, routed through Help Center/diagnostics/ARIA assistance and,
 * where needed, human agent escalation. GrowHubs-Superadmin-facing
 * support and tenant-branded business-customer support remain distinct
 * assistants per approved scope but share this canonical case shape —
 * distinguished here by `supportSurface`, not by a separate table.
 * Registered as a PLT-005 canonical lifecycle family; uses this
 * codebase's established domain-owned state/version-column pattern.
 */
@Entity('support_cases')
export class SupportCase {
  @PrimaryGeneratedColumn('uuid', { name: 'case_id' })
  caseId: string;

  /** GROWHUBS_SUPERADMIN (platform issues) vs TENANT_BUSINESS_CUSTOMER
   * (tenant-branded assistant) — the two distinct assistants named in
   * §Purpose & scope, sharing this one case shape. */
  @Column({ name: 'support_surface' })
  supportSurface: string;

  @Column({ name: 'requester_ref', type: 'jsonb' })
  requesterRef: Record<string, unknown>;

  /** account/session context the case was opened from — needed for
   * ARIA's permission-bounded diagnostic scope. */
  @Column({ name: 'account_context_ref', type: 'jsonb' })
  accountContextRef: Record<string, unknown>;

  @Column({
    type: 'enum',
    enum: SupportCaseState,
    default: SupportCaseState.SUBMITTED,
  })
  state: SupportCaseState;

  @Column({ name: 'state_version', default: 0 })
  stateVersion: number;

  /** category/priority resolved at TRIAGE — engineering synthesis for the
   * storage shape (no literal field table given), but the always-escalate
   * category list (security/finance/incident/child-safety/safety) is
   * transcribed from the doc, not invented. */
  @Column({ name: 'category', nullable: true })
  category?: string;

  @Column({ name: 'priority', nullable: true })
  priority?: string;

  /** ARIA/agent answers and fixes attached over the case's life — an
   * append-only log, since an ARIA answer never itself closes the case
   * (see class doc comment); closure is a separate, later action. */
  @Column({ name: 'attached_answers', type: 'jsonb', default: [] })
  attachedAnswers: Record<string, unknown>[];

  /** which of the three authorized sources produced the RESOLVED_CLOSED
   * transition — see ResolutionClosureAuthority doc comment. NOT NULL
   * would be wrong here since it only applies once closed; enforced as
   * required-when-closed at the application layer, not by a DB
   * constraint this migration adds. */
  @Column({
    name: 'closure_authority',
    type: 'enum',
    enum: ResolutionClosureAuthority,
    nullable: true,
  })
  closureAuthority?: ResolutionClosureAuthority;

  @Column({ name: 'closure_policy_version', nullable: true })
  closurePolicyVersion?: string;

  /** durable link to another SupportCase (MERGED_INTO_OTHER_CASE) or to
   * an Incident (ESCALATED_TO_INCIDENT) or to a dependency case/ticket
   * (PENDING_INTERNAL_DEPENDENCY) — one polymorphic link column rather
   * than three separate foreign keys, since only one applies at a time
   * per the state the case is in. */
  @Column({ name: 'linked_ref', type: 'jsonb', nullable: true })
  linkedRef?: Record<string, unknown>;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;

  @Column({ name: 'closed_at', type: 'timestamptz', nullable: true })
  closedAt?: Date;
}
