import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

/**
 * PLT-006 (`CORE-C1952`, GOV-002 EXECUTED, `MASTER_SPEC.md:978`) — no
 * dedicated `PLT-006_*_SCHEMA_v1.md` document exists yet (unlike PF-011/
 * PLT-005/FRM-001/etc.), so this family is grounded directly in the
 * `gov002_repaired/CORE_repaired.md` atomic decision register rows
 * `CORE-C1952`–`CORE-C1993`, the same discipline already used for
 * `15_Publication.md` (formalized from a decision's contract shape rather
 * than a literal field table). Every field below is traceable to a named
 * clause; nothing here is invented beyond that.
 *
 * `CORE-C1954`: "Variable AI, media/storage/egress/transcode/live, Email/
 * SMS/push, connector/API/maps/storage and platform seat/contact/product/
 * submission/Automation/domain/app/analytics/support resources use
 * versioned MeterDefinition contracts for unit/event/source/aggregation/
 * rounding, allowance/threshold/limit/overage/reservation/cancellation/
 * failure/late usage, provider cost and customer price." The resource
 * groupings below are this codebase's own named enum for that verbatim
 * list (ENGINEERING SYNTHESIS: the doc lists categories in prose, not as
 * a formal enum — grouped here 1:1 with the doc's own groupings, nothing
 * added or removed).
 */
export enum MeterResourceFamily {
  AI = 'AI',
  MEDIA_STORAGE_EGRESS_TRANSCODE_LIVE = 'MEDIA_STORAGE_EGRESS_TRANSCODE_LIVE',
  EMAIL_SMS_PUSH = 'EMAIL_SMS_PUSH',
  CONNECTOR_API_MAPS_STORAGE = 'CONNECTOR_API_MAPS_STORAGE',
  /** PostgreSQL enum labels are capped at 63 bytes — the doc's own
   * phrasing ("platform seat/contact/product/submission/Automation/
   * domain/app/analytics/support resources") does not fit, so this label
   * is shortened to its two lead terms; the full verbatim list from
   * `CORE-C1954` is preserved here in this comment rather than lost. */
  PLATFORM_SEAT_CONTACT_RESOURCES = 'PLATFORM_SEAT_CONTACT_RESOURCES',
}

/**
 * MeterDefinition — the versioned contract governing how one metered
 * resource family is measured, allowed, and priced. Every UsageEvent
 * (see usage-event.entity.ts) pins the exact MeterDefinition version it
 * was measured against — never "whatever the definition currently is"
 * (same pinned-version discipline as this codebase's KillSwitchActivation/
 * KillSwitchDefinition pairing).
 *
 * `CORE-C1992`/`CORE-C1993` (Launch requirement): every variable-cost
 * capability requires a MeterDefinition, authoritative measurement,
 * provider contract/limit, allowance/notifications/degradation/overage,
 * mid-operation and dispute/correction rule, customer explanation/
 * dashboard, cost model and three-tenant-size simulation before Launch —
 * otherwise the capability remains beta/capped/approval-only. This entity
 * is the anchor object that requirement is checked against; the checklist
 * itself is a launch-gate process, not a column.
 */
@Entity('meter_definitions')
@Index(['resourceFamily', 'version'])
export class MeterDefinition {
  @PrimaryGeneratedColumn('uuid', { name: 'meter_definition_id' })
  meterDefinitionId: string;

  @Column()
  name: string;

  @Column({ name: 'resource_family', type: 'enum', enum: MeterResourceFamily })
  resourceFamily: MeterResourceFamily;

  @Column({ default: 1 })
  version: number;

  /** unit/event/source/aggregation/rounding (CORE-C1954) — engineering
   * synthesis for the storage shape, the concepts named are verbatim. */
  @Column({ name: 'measurement_contract', type: 'jsonb' })
  measurementContract: Record<string, unknown>;

  /** allowance/threshold/limit/overage/reservation/cancellation/failure/
   * late-usage policy (CORE-C1954), plus CORE-C1958's reservation/
   * disclosure rule (unused reservations release; default 50/75/90/100%
   * thresholds, specialisable per meter/plan) and CORE-C1962's overage
   * model options (no-overage hard cap, pay-as-you-go, prepaid add-on,
   * explicit-consent auto-top-up with cap, period invoice, approval,
   * enterprise commitment, fair-use review, sponsored allowance). */
  @Column({ name: 'policy_contract', type: 'jsonb' })
  policyContract: Record<string, unknown>;

  /** provider raw cost, infrastructure/internal cost, customer price/
   * markup/tax, promotional funding, partner allocation — all distinct
   * per CORE-C1982. */
  @Column({ name: 'cost_price_contract', type: 'jsonb' })
  costPriceContract: Record<string, unknown>;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;
}
