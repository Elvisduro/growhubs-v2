import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

/**
 * BlueprintVersion — ENGINEERING SYNTHESIS, mirroring `FormVersion`
 * (`CORE-C1554`) exactly per the architecture plan's own directive: an
 * IMMUTABLE snapshot of the renderable schema at the moment it is
 * published. `renderContract` is kept as its own column, separate from
 * `schemaSnapshot`, because the plan describes the Blueprint Engine as
 * producing both "blueprint CRUD" AND "render contracts" (§2) — the data
 * shape and how a renderer (web/mobile/desktop) is meant to interpret it
 * are two different concerns even when they version together. Once a
 * version has any dependent render/usage record, this codebase never
 * issues an UPDATE against `schemaSnapshot`/`renderContract` on that row —
 * a correction is always a new version, same discipline as FormVersion.
 */
@Entity('blueprint_versions')
@Index(['blueprintId', 'versionNumber'], { unique: true })
export class BlueprintVersion {
  @PrimaryGeneratedColumn('uuid', { name: 'blueprint_version_id' })
  blueprintVersionId: string;

  @Column({ name: 'blueprint_id', type: 'uuid' })
  blueprintId: string;

  @Column({ name: 'version_number' })
  versionNumber: number;

  /** the versioned, renderable definition itself — component tree /
   * field list / branching, in whatever DSL the Builder/Blueprint Engine
   * defines (an engineering choice, not a governance one, same posture
   * FRM-001 §13 takes toward FormVersion.schemaSnapshot). */
  @Column({ name: 'schema_snapshot', type: 'jsonb' })
  schemaSnapshot: Record<string, unknown>;

  /** how each client renderer (web/mobile/desktop) is meant to interpret
   * schemaSnapshot — e.g. component-mapping/theme/breakpoint hints. */
  @Column({ name: 'render_contract', type: 'jsonb' })
  renderContract: Record<string, unknown>;

  @Column({ name: 'effective_from', type: 'timestamptz' })
  effectiveFrom: Date;

  /** null while in DRAFT/REVIEW */
  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt?: Date;
}
