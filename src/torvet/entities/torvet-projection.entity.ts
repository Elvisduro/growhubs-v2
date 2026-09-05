import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

/** TV-012 §5 (TV-C0758) — the exact 5 named freshness classes. Every field
 * on TorvetProjection must be assigned exactly one of these — that
 * per-field assignment lives INSIDE the publicFields/criticalFields JSON
 * structure (e.g. `{ price: { value: ..., freshnessClass: "F1" } }`), not
 * as a separate top-level column, since the classification is per-field,
 * not per-row. This enum exists so application code has one canonical set
 * of values to tag fields with, rather than each domain module inventing
 * its own freshness vocabulary. */
export enum TorvetFreshnessClass {
  F0_IMMUTABLE_VERSIONED = 'F0_IMMUTABLE_VERSIONED',
  F1_TRANSACTION_CRITICAL = 'F1_TRANSACTION_CRITICAL',
  F2_OPERATIONAL = 'F2_OPERATIONAL',
  F3_DESCRIPTIVE = 'F3_DESCRIPTIVE',
  F4_SOCIAL_ANALYTICAL = 'F4_SOCIAL_ANALYTICAL',
}

/** CORRECTION (this codebase, self-audit 2026-09-05): the canonical
 * `16_TorvetProjection.md` States table (Master Spec/TV-012 L962) lists 9
 * top-level named states, not 7 — `source_unavailable` and `archived` are
 * genuine top-level states in that table (`archived` explicitly marked
 * Terminal), not mere "branches." The branches that ARE folded into
 * transitions rather than modeled as top-level states (per the doc's own
 * explicit "Branches explicitly named... that this machine must also
 * raise as conditions on the transitions below rather than as separate
 * top-level states" line) are only: `version-conflict`, `out-of-order`,
 * `deleted`, `permission-revoked`, and `legal/safety hold` (the last folds
 * into `restricted`). The previous revision of this enum conflated those
 * two different lists and omitted `SOURCE_UNAVAILABLE`/`ARCHIVED` as a
 * result — fixed here, same class of gap as the Enrollment/Submission
 * corrections made earlier in this engagement (built from TV-012 Master
 * Spec clauses before this more detailed canonical doc was re-checked
 * clause-by-clause). Initial: DRAFT. Terminal: ARCHIVED only (§ "any state
 * -> archived" transition; `source_unavailable`, like `restricted`, is
 * explicitly recoverable — it returns to `syncing` once the source domain
 * is reachable again).
 *
 * This family is registered as, and must be wired into, PLT-005's shared
 * StateMachineEngine (CORE-C2017) exactly like FRM-001's Submission and
 * CL-012's Enrollment — see those entities' doc comments for the same
 * domain-owned state/version-column wiring pattern used here. */
export enum TorvetFreshnessState {
  DRAFT = 'DRAFT',
  SYNCING = 'SYNCING',
  FRESH = 'FRESH',
  AGING = 'AGING',
  STALE = 'STALE',
  REFRESHING = 'REFRESHING',
  RESTRICTED = 'RESTRICTED',
  SOURCE_UNAVAILABLE = 'SOURCE_UNAVAILABLE',
  ARCHIVED = 'ARCHIVED',
}

/** TV-012 §2.1 — no exact enum-value list is given for `publication_state`
 * specifically (distinct from TorvetSurface/TorvetMarketCell's own
 * activation-state axis, §3) — engineering synthesis, flagged. */
export enum TorvetPublicationState {
  PUBLISHED = 'PUBLISHED',
  UNPUBLISHED = 'UNPUBLISHED',
  RESTRICTED = 'RESTRICTED',
}

/**
 * TV-012 §1/§2.1 (TV-C0755-C0757) — TorvetProjection: stores source
 * domain/object/version, projection/market/public/critical fields,
 * interaction/CTA/ranking/placement policy, last confirmation, freshness/
 * publication state, and restrictions. SOURCE DOMAINS REMAIN THE CANONICAL
 * OWNERS of their data (TV-C0756) — Torvet owns only the projection,
 * ranking, and discovery state built over it (TV-C0757). Same discipline
 * already established for PF-011's FederatedReference and PLT-005's
 * domain-ownership rule (CORE-C2000), applied here to Torvet's read-model
 * layer: nothing in this codebase writes back into the source domain from
 * a TorvetProjection row.
 *
 * §6 (TV-C0759-C0761): a pre-transaction check (Buy/Book/Join/Enroll/
 * Apply/Reserve/Redeem/Claim) is a MANDATORY SYNCHRONOUS re-verification
 * against the actual source domain — never a read of this row's cached
 * `criticalFields` (F1) alone. This table's `criticalFields` column exists
 * for display/ranking purposes only; application code must never treat it
 * as authoritative at the moment of an actual transaction. A source-
 * unavailable critical CTA must never fall back to a cached transaction
 * (TV-C0761) — this is the single most important rule in the whole
 * document, and no column here can enforce it by itself; it is an
 * application-layer invariant every transaction-initiating code path must
 * honor.
 */
@Entity('torvet_projections')
@Index(['sourceDomain', 'sourceObjectRef'])
export class TorvetProjection {
  @PrimaryGeneratedColumn('uuid', { name: 'projection_id' })
  projectionId: string;

  @Column({ name: 'source_domain' })
  sourceDomain: string;

  @Column({ name: 'source_object_ref', type: 'jsonb' })
  sourceObjectRef: Record<string, unknown>;

  @Column({ name: 'source_version' })
  sourceVersion: number;

  /** which TorvetMarketCell(s) this projection appears in */
  @Column({ name: 'market_ref', type: 'jsonb' })
  marketRef: Record<string, unknown>;

  /** each field's value plus its TorvetFreshnessClass tag — see enum doc
   * comment above */
  @Column({ name: 'public_fields', type: 'jsonb' })
  publicFields: Record<string, unknown>;

  /** F1-classified fields specifically — display/ranking use only; NEVER
   * read at actual transaction time (see class doc comment, §6) */
  @Column({ name: 'critical_fields', type: 'jsonb' })
  criticalFields: Record<string, unknown>;

  @Column({ name: 'interaction_cta_ranking_placement_policy', type: 'jsonb', default: {} })
  interactionCtaRankingPlacementPolicy: Record<string, unknown>;

  @Column({ name: 'last_confirmed_at', type: 'timestamptz' })
  lastConfirmedAt: Date;

  @Column({
    name: 'freshness_state',
    type: 'enum',
    enum: TorvetFreshnessState,
    default: TorvetFreshnessState.DRAFT,
  })
  freshnessState: TorvetFreshnessState;

  /** domain-owned state-version column for this PLT-005 family, same
   * pattern as FRM-001's Submission / CL-012's Enrollment */
  @Column({ name: 'freshness_state_version', default: 0 })
  freshnessStateVersion: number;

  @Column({
    name: 'publication_state',
    type: 'enum',
    enum: TorvetPublicationState,
    default: TorvetPublicationState.UNPUBLISHED,
  })
  publicationState: TorvetPublicationState;

  /** §8 source-loss cascade / general restrictions */
  @Column({ type: 'jsonb', default: {} })
  restrictions: Record<string, unknown>;

  /** set only on the ARCHIVED terminal transition — PLT-001
   * tombstone/audit timestamp (source deleted/unpublished/tenant-exit/
   * permission-or-visibility-lost/explicit takedown, §"any state ->
   * archived"). Added with the ARCHIVED/SOURCE_UNAVAILABLE state
   * correction above, same closedAt/archivedAt pattern used on this
   * codebase's other terminal-state entities. */
  @Column({ name: 'archived_at', type: 'timestamptz', nullable: true })
  archivedAt?: Date;
}
