import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * ENGINEERING SYNTHESIS — no GOV-002/CORE decision names a "Blueprint"
 * object; this is the application-layer Builder/Blueprint Engine from
 * `planning/GROWHUBS_V2_ARCHITECTURE_AND_AGENT_ORG_PLAN_v2.md` §2/§13:
 * "a generic, blueprint-agnostic CRUD+versioning system (mirroring
 * `FormVersion`'s pattern) that every builder type reuses." The lifecycle
 * states are therefore copied verbatim from `FormLifecycleState`
 * (`FRM-001` §3.1, `CORE-C1559`) rather than invented fresh, per the plan's
 * own instruction to generalize that exact pattern — not a new governance
 * decision, a deliberate reuse of an already-approved shape.
 */
export enum BlueprintLifecycleState {
  DRAFT = 'DRAFT',
  REVIEW = 'REVIEW',
  PUBLISHED = 'PUBLISHED',
  PAUSED = 'PAUSED',
  RETIRED = 'RETIRED',
  ARCHIVED = 'ARCHIVED',
}

/**
 * BlueprintDefinition — ENGINEERING SYNTHESIS, the long-lived container
 * a builder (page/funnel/agent-capability/course/etc. — the plan gives
 * these as examples, not a closed list, so `blueprintType` is a plain
 * string rather than a fabricated enum) creates once and versions many
 * times, exactly mirroring `FormDefinition`/`FormVersion`'s split
 * (`CORE-C1553`/`CORE-C1554`): identity/ownership/lifecycle state lives
 * here and persists across versions; the actual renderable schema lives
 * only in `BlueprintVersion`, immutable once published.
 */
@Entity('blueprint_definitions')
export class BlueprintDefinition {
  @PrimaryGeneratedColumn('uuid', { name: 'blueprint_id' })
  blueprintId: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  /** which builder produced this (e.g. "PAGE", "FUNNEL",
   * "AGENT_CAPABILITY", "COURSE") — plain string since the architecture
   * plan gives these only as illustrative examples, never a closed,
   * governance-approved list (fabricating a fixed enum here would assert
   * a decision that hasn't been made). */
  @Column({ name: 'blueprint_type' })
  blueprintType: string;

  @Column()
  name: string;

  @Column({ name: 'owner_ref', type: 'jsonb' })
  ownerRef: Record<string, unknown>;

  @Column({
    name: 'lifecycle_state',
    type: 'enum',
    enum: BlueprintLifecycleState,
    default: BlueprintLifecycleState.DRAFT,
  })
  lifecycleState: BlueprintLifecycleState;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;
}
