import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** TV-012 §3 (TV-C0744) — the exact 11 named independent surfaces. */
export enum TorvetSurfaceName {
  KNOWLEDGE_AND_SHORT_MEDIA_FEEDS = 'KNOWLEDGE_AND_SHORT_MEDIA_FEEDS',
  PRODUCTS_SERVICES = 'PRODUCTS_SERVICES',
  PEOPLE_ORGANIZATIONS = 'PEOPLE_ORGANIZATIONS',
  EVENTS = 'EVENTS',
  COMMUNITIES = 'COMMUNITIES',
  COURSES = 'COURSES',
  PODCAST_MEDIA = 'PODCAST_MEDIA',
  APPS = 'APPS',
  TORVET_WORK = 'TORVET_WORK',
  GLOSSARY_KNOWLEDGE_INDEX = 'GLOSSARY_KNOWLEDGE_INDEX',
  SPONSORED_FEATURED_INVENTORY = 'SPONSORED_FEATURED_INVENTORY',
}

/** TV-012 §3 (TV-C0745) — the exact 6 named activation states. */
export enum TorvetActivationState {
  INTERNAL_ONLY = 'INTERNAL_ONLY',
  SEEDING = 'SEEDING',
  PRIVATE_BETA = 'PRIVATE_BETA',
  PUBLIC_DISCOVERY = 'PUBLIC_DISCOVERY',
  TRANSACTION_ENABLED = 'TRANSACTION_ENABLED',
  SCALED = 'SCALED',
}

/** TV-012 §3 (TV-C0746) — the exact 6 named protection states. Multiple
 * can apply simultaneously to the same surface/cell (it's an independent
 * axis from activation state), so this is stored as an array, not a
 * single value. */
export enum TorvetProtectionState {
  DENSITY_GATED = 'DENSITY_GATED',
  STALE_RESTRICTED = 'STALE_RESTRICTED',
  SAFETY_RESTRICTED = 'SAFETY_RESTRICTED',
  TRANSACTION_PAUSED = 'TRANSACTION_PAUSED',
  REGION_DISABLED = 'REGION_DISABLED',
  SUNSET = 'SUNSET',
}

/**
 * TV-012 §3 (TV-C0744-C0746) — TorvetSurface: one of the 11 independent
 * discovery surfaces. Activation state and protection state are two
 * SEPARATE axes (TV-C0746) — a surface can be TRANSACTION_ENABLED in
 * general while individually STALE_RESTRICTED, hence two independent
 * columns rather than one combined status.
 *
 * `TorvetWork` specifically is staged as PRIVATE_BETA/DENSITY_GATED until
 * it also satisfies employment and PLT-004 controls (TV-C0753) — this
 * reflects the still-open EMP-001 external-evidence item flagged elsewhere
 * in this engagement; this schema stages rather than removes that already-
 * approved scope (TV-C0754).
 */
@Entity('torvet_surfaces')
export class TorvetSurface {
  @PrimaryGeneratedColumn('uuid', { name: 'surface_id' })
  surfaceId: string;

  @Column({ name: 'surface_name', type: 'enum', enum: TorvetSurfaceName, unique: true })
  surfaceName: TorvetSurfaceName;

  @Column({
    name: 'activation_state',
    type: 'enum',
    enum: TorvetActivationState,
    default: TorvetActivationState.INTERNAL_ONLY,
  })
  activationState: TorvetActivationState;

  @Column({
    name: 'protection_states',
    type: 'enum',
    enum: TorvetProtectionState,
    array: true,
    default: [],
  })
  protectionStates: TorvetProtectionState[];
}

/**
 * TV-012 §2.2 (TV-C0747-C0748) — TorvetMarketCell: readiness is measured
 * per-cell, not globally — Surface x product/category/industry x
 * country/region x language x audience context. Market Cell readiness must
 * NEVER be hidden by global totals (TV-C0748) — application code must
 * always resolve and show THIS cell's own state, never substitute a
 * platform-wide aggregate.
 *
 * Carries its own activationState/protectionStates (same enums as
 * TorvetSurface) because readiness is explicitly measured at cell
 * granularity, not just inherited from the parent surface (TV-C0747).
 */
@Entity('torvet_market_cells')
export class TorvetMarketCell {
  @PrimaryGeneratedColumn('uuid', { name: 'market_cell_id' })
  marketCellId: string;

  @Column({ name: 'surface_id', type: 'uuid' })
  surfaceId: string;

  @Column({ name: 'product_category_ref' })
  productCategoryRef: string;

  @Column({ name: 'country_region' })
  countryRegion: string;

  @Column()
  language: string;

  @Column({ name: 'audience_context', type: 'jsonb', default: {} })
  audienceContext: Record<string, unknown>;

  @Column({
    name: 'activation_state',
    type: 'enum',
    enum: TorvetActivationState,
    default: TorvetActivationState.INTERNAL_ONLY,
  })
  activationState: TorvetActivationState;

  @Column({
    name: 'protection_states',
    type: 'enum',
    enum: TorvetProtectionState,
    array: true,
    default: [],
  })
  protectionStates: TorvetProtectionState[];
}

/**
 * TV-012 §2.3 (TV-C0749) — LiquidityGate: a versioned evaluation of
 * eligible/active/verified supply, independent-provider diversity/
 * concentration, price/format/category coverage, demand/search, useful
 * results, response/conversion/outcomes, freshness, Trust & Safety,
 * support, and report/fraud rates — required before a cell may open
 * publicly.
 *
 * FIELD LIST NOTE: no literal per-field table is given for this entity —
 * `evaluationSnapshot` holds the prose-listed metrics as JSON, flagged as
 * an engineering synthesis (same discipline used throughout this
 * codebase).
 */
@Entity('liquidity_gates')
export class LiquidityGate {
  @PrimaryGeneratedColumn('uuid', { name: 'gate_id' })
  gateId: string;

  @Column({ name: 'market_cell_id', type: 'uuid' })
  marketCellId: string;

  @Column({ default: 1 })
  version: number;

  @Column({ name: 'evaluation_snapshot', type: 'jsonb' })
  evaluationSnapshot: Record<string, unknown>;

  @Column()
  passed: boolean;

  @Column({ name: 'evaluated_at', type: 'timestamptz', default: () => 'now()' })
  evaluatedAt: Date;
}

/**
 * TV-012 §2.3 (TV-C0750) — LiquidityPlan: a named plan, required per public
 * cell, covering customer/supply/demand, acquisition/founding participants,
 * owner/budget, verification, readiness, timeframe, and expand/stop
 * criteria.
 *
 * FIELD LIST NOTE: same as LiquidityGate above — synthesized, flagged.
 */
@Entity('liquidity_plans')
export class LiquidityPlan {
  @PrimaryGeneratedColumn('uuid', { name: 'plan_id' })
  planId: string;

  @Column({ name: 'market_cell_id', type: 'uuid' })
  marketCellId: string;

  @Column()
  name: string;

  @Column({ type: 'jsonb' })
  plan: Record<string, unknown>;
}
