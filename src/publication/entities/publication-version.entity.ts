import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** `15_Publication.md` (PLT-005/XD-001) — the 10 named states verbatim.
 * Initial: draft. Terminal: superseded, archived, tombstoned.
 *
 * Per PLT-005 L1136: a terminal state here is never silent deletion of
 * the underlying snapshot — `tombstoned` specifically means the CONTENT
 * is removed/restricted while a minimal audit tombstone remains;
 * `superseded`/`archived` retain full snapshot content. */
export enum PublicationVersionState {
  DRAFT = 'draft',
  PUBLISHING = 'publishing',
  LIVE = 'live',
  PAUSED = 'paused',
  UNPUBLISHED = 'unpublished',
  RESTRICTED = 'restricted',
  SUPERSEDED = 'superseded',
  ARCHIVED = 'archived',
  FAILED = 'failed',
  TOMBSTONED = 'tombstoned',
}

/**
 * PublicationVersion — the generic mechanism by which any eligible source
 * object under the XD-001 Universal Experience Composition Graph (Course,
 * Community, Podcast/Media episode, Service, Event, Project, MyStore
 * Product/Offer, Page/Site, or a Composition Edge itself) becomes an
 * **immutable, versioned snapshot** at the moment it is published.
 * Formalizes the PLT-005 invariant: **"published snapshots version"** —
 * editing the live source object never silently changes an already-
 * published snapshot; a new publish action always creates a new
 * PublicationVersion row, never an in-place rewrite (PLT-005, Master Spec
 * L1144).
 *
 * States apply PER PublicationVersion record, not to the source object
 * itself (15_Publication.md "States" section header note). Publication is
 * NOT the source object: the source domain (Course, Community, Podcast,
 * Commerce, Page Builder, etc.) remains the canonical owner of the live/
 * editable object; Publication owns only the frozen snapshot record, its
 * version lineage, and its own serving/retention state. Publication never
 * mutates a source object's own fields — command/event only, never a
 * shared-table write.
 *
 * At most one PublicationVersion is `live` at a time per serving context
 * (tenant/locale/audience variant) for a given source object; prior
 * versions are retained, not deleted, for audit/rollback/history. A
 * rollback creates a NEW PublicationVersion copying an old snapshot's
 * content — it never reactivates an `archived`/`superseded` row in place
 * (15_Publication.md, `superseded` → `archived` transition note).
 *
 * SCOPE NOTE (engineering synthesis flag, per 15_Publication.md's own
 * "Scope note on grounding depth"): unlike Order/Payment, no equivalently
 * detailed enumerated-field proposal for Publication was found in the
 * approved decision set — the 10 states and their meanings ARE given
 * verbatim in the source doc's States table, but the concrete column
 * shape below (sourceObjectRef, servingContext, frozenSnapshot,
 * versionLineage) is this codebase's engineering synthesis of the
 * "snapshot / version lineage / serving context" concepts the doc
 * describes in prose (Purpose & scope; Idempotency & concurrency
 * sections), not a literal field table — flagged here per this
 * engagement's citation discipline. Registered as a PLT-005 canonical
 * lifecycle family; uses this codebase's established domain-owned
 * state/version-column pattern.
 */
@Entity('publication_versions')
export class PublicationVersion {
  @PrimaryGeneratedColumn('uuid', { name: 'publication_version_id' })
  publicationVersionId: string;

  /** polymorphic reference to the XD-001 source object (Course, Community,
   * Podcast episode, Service, Event, Project, MyStore Product/Offer,
   * Page/Site, or a Composition Edge) — type + id + the source object's
   * own version at publish time (the "expected source version" the
   * publish command carries, per Idempotency & concurrency). */
  @Column({ name: 'source_object_ref', type: 'jsonb' })
  sourceObjectRef: Record<string, unknown>;

  /** tenant/locale/audience-variant serving context — at most one `live`
   * PublicationVersion per (sourceObjectRef, servingContext) pair. */
  @Column({ name: 'serving_context', type: 'jsonb' })
  servingContext: Record<string, unknown>;

  @Column({
    type: 'enum',
    enum: PublicationVersionState,
    default: PublicationVersionState.DRAFT,
  })
  state: PublicationVersionState;

  @Column({ name: 'state_version', default: 0 })
  stateVersion: number;

  /** the frozen snapshot itself — source fields, composition/attribution
   * facts, and policy-relevant data as of the instant `publishing` ->
   * `live` succeeded. Null while still `draft`/`publishing`/`failed`
   * (no snapshot has been frozen yet). Retained unmodified for the life
   * of the record regardless of later source edits (Audit evidence
   * section) — this column is never overwritten after `live` is reached,
   * only the state/servingContext-adjacent columns change thereafter. */
  @Column({ name: 'frozen_snapshot', type: 'jsonb', nullable: true })
  frozenSnapshot?: Record<string, unknown>;

  /** version lineage: the PublicationVersion this row supersedes (self-
   * reference), and — for an explicit rollback — the older version whose
   * frozenSnapshot content this row was copied from (may be the same row
   * as supersedesVersionId, or an older ancestor for a multi-step
   * rollback). Never a mutation target — only ever read. */
  @Column({ name: 'supersedes_version_id', type: 'uuid', nullable: true })
  supersedesVersionId?: string;

  @Column({ name: 'rollback_of_version_id', type: 'uuid', nullable: true })
  rollbackOfVersionId?: string;

  /** guard/evidence/approval references gating `draft` -> `publishing` ->
   * `live` (source-domain-specific readiness checks — Course readiness,
   * Commerce Offer pricing/tax checks, etc. — are each owning domain's
   * own machine's concern; this column holds only the references/result,
   * per the doc's own TBD note on source-type-specific guards). */
  @Column({ name: 'publish_guard_evidence', type: 'jsonb', nullable: true })
  publishGuardEvidence?: Record<string, unknown>;

  /** failure detail when `publishing` -> `failed` (validation/evidence/
   * provider/timeout/dependency failure classes). */
  @Column({ name: 'failure_evidence', type: 'jsonb', nullable: true })
  failureEvidence?: Record<string, unknown>;

  /** pause/restriction/tombstone authority + evidence — Kill-Switch,
   * Trust & Safety, legal takedown, or retention-timer trigger. */
  @Column({ name: 'hold_evidence', type: 'jsonb', nullable: true })
  holdEvidence?: Record<string, unknown>;

  /** idempotency key for the `publish` command that created this row. */
  @Column({ name: 'idempotency_key', unique: true })
  idempotencyKey: string;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;

  @Column({ name: 'live_at', type: 'timestamptz', nullable: true })
  liveAt?: Date;

  @Column({ name: 'closed_at', type: 'timestamptz', nullable: true })
  closedAt?: Date;
}
