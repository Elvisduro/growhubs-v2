import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * `17_JourneyAutomationRun.md` — IMPORTANT SCOPE NOTE, read before
 * extending this entity: the source document itself states this is "the
 * full extent of what any approved decision specifies about Journey/
 * Automation mechanics" and explicitly marks almost every mechanic below
 * TBD — not yet an approved decision, only a "minimal skeleton implied by
 * the generic PLT-005 contract." This codebase follows that document's
 * own instruction NOT to invent Step-level sub-machine detail, retry
 * policy, pause/cancel semantics beyond the bare state names, or
 * compensation/rollback behavior. Do not add columns for any of the
 * explicitly-TBD items listed in the source doc's "TBD — not specified
 * in approved decisions" block without a genuine approved decision to
 * cite; this entity intentionally stays thin.
 *
 * The 6 named states given verbatim. Initial: created. Terminal:
 * completed, cancelled, failed.
 */
export enum JourneyAutomationRunState {
  CREATED = 'created',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
}

/**
 * JourneyAutomationRun — the execution instance of a Journey/Automation
 * Definition (a marketer/ops-authored sequence of steps/actions/
 * conditions/delays) against one subject (Person/Lead/Order/other
 * triggering object). Registered as one of PLT-005's 22 canonical
 * lifecycle families. Uses this codebase's established domain-owned
 * state/version-column pattern.
 *
 * THE ONE BINDING INVARIANT THIS MACHINE MUST NEVER VIOLATE (PLT-005,
 * Master Spec L1144): **"Journey Definition changes do not mutate active
 * Runs."** `definitionVersionPinned` is captured once at creation and
 * MUST NEVER be updated by a later edit to the Definition — a Run always
 * continues executing against the exact Definition version it started
 * with. Any application code that re-reads "the current Definition" for
 * an in-flight Run rather than this pinned reference is a bug against
 * this invariant, not a style choice.
 *
 * Step-level execution detail (whether Step is a first-class sub-machine,
 * retry policy, pause-vs-waiting-on-delay distinction, compensation/
 * rollback) is deliberately NOT modeled as separate columns/tables here —
 * see class doc comment above. `stepPosition`/`stepLog` below are the
 * minimal position-pointer-plus-append-log the doc allows ("modeled only
 * as a position pointer within `running`" is explicitly named as one
 * still-open option), not a claim that a Step sub-machine has been
 * decided.
 */
@Entity('journey_automation_runs')
export class JourneyAutomationRun {
  @PrimaryGeneratedColumn('uuid', { name: 'run_id' })
  runId: string;

  /** the Journey/Automation Definition this Run was created from —
   * referenced by id, version pinned separately below since the
   * Definition itself is out of this codebase's current scope (no
   * DefinitionEntity exists yet; this is a plain reference). */
  @Column({ name: 'definition_ref', type: 'jsonb' })
  definitionRef: Record<string, unknown>;

  /** pinned at creation, NEVER updated afterward — see class doc comment
   * on the binding invariant. */
  @Column({ name: 'definition_version_pinned' })
  definitionVersionPinned: number;

  /** the subject this Run executes against (Person/Lead/Order/other
   * triggering object). */
  @Column({ name: 'subject_ref', type: 'jsonb' })
  subjectRef: Record<string, unknown>;

  @Column({
    type: 'enum',
    enum: JourneyAutomationRunState,
    default: JourneyAutomationRunState.CREATED,
  })
  state: JourneyAutomationRunState;

  @Column({ name: 'state_version', default: 0 })
  stateVersion: number;

  /** minimal position pointer within the pinned Definition's step
   * sequence — deliberately not a first-class Step sub-machine, per the
   * doc's own unresolved-TBD note. */
  @Column({ name: 'step_position', type: 'jsonb', nullable: true })
  stepPosition?: Record<string, unknown>;

  /** append-only log of step-execution attempts and their outcomes —
   * exact per-step audit granularity is TBD per the source doc; this is
   * an engineering-synthesis storage shape only, not a claim of decided
   * per-step state machinery. */
  @Column({ name: 'step_log', type: 'jsonb', default: [] })
  stepLog: Record<string, unknown>[];

  /** why a FAILED run terminated — required context for the Transition
   * Repair Queue, per the doc's own "failed -> repair" row. */
  @Column({ name: 'failure_reason', type: 'jsonb', nullable: true })
  failureReason?: Record<string, unknown>;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;

  @Column({ name: 'ended_at', type: 'timestamptz', nullable: true })
  endedAt?: Date;
}
