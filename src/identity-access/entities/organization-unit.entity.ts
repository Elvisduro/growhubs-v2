import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** PF-012 §2.1 (PF-C0531) — a unit's own status (independent of hierarchy
 * position). Not given an exact enum-value list in the approved text
 * (only "status | enum |" with no values), so this is an engineering
 * synthesis, flagged here as with other under-specified enums in this
 * codebase. */
export enum OrganizationUnitStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}

/**
 * PF-011 §2.5 — OrganizationUnit: real internal hierarchy within an
 * Organization (PF-C0478) — division, department, faculty, programme,
 * cohort, team, etc. A Workspace may bind to one OrganizationUnit
 * (PF-C0485). Self-referential for real hierarchy.
 *
 * Extended per PF-012 §2.1 (PF-C0529-C0531): different organization types
 * need genuinely different tree shapes — `unitKind` (PF-011's original
 * column, kept as-is) IS PF-012's `unit_type`, tenant-defined rather than a
 * closed enum. Hierarchies are versioned and acyclic (PF-C0530) — a unit
 * can never become its own ancestor, and every structural change (§2.2,
 * PF-C0532-C0533: governed move/merge/split/archive, never a destructive
 * parent-edit) produces a new `hierarchyVersion` rather than mutating
 * history; `lineage` carries the ancestry path that makes the acyclic
 * guarantee checkable. A unit's position is time-scoped via
 * effectiveFrom/effectiveTo, not a single permanent parent pointer
 * (PF-C0531).
 */
@Entity('organization_units')
export class OrganizationUnit {
  @PrimaryGeneratedColumn('uuid', { name: 'unit_id' })
  unitId: string;

  @Column({ name: 'organization_id', type: 'uuid' })
  organizationId: string;

  @Column({ name: 'parent_unit_id', type: 'uuid', nullable: true })
  parentUnitId?: string;

  /** free-typed per PF-011's examples, not a closed enum — this IS
   * PF-012's `unit_type` (PF-C0529). */
  @Column({ name: 'unit_kind' })
  unitKind: string;

  @Column()
  name: string;

  @Column({ name: 'hierarchy_version', default: 1 })
  hierarchyVersion: number;

  @Column({ name: 'effective_from', type: 'timestamptz', default: () => 'now()' })
  effectiveFrom: Date;

  @Column({ name: 'effective_to', type: 'timestamptz', nullable: true })
  effectiveTo?: Date;

  @Column({
    type: 'enum',
    enum: OrganizationUnitStatus,
    default: OrganizationUnitStatus.ACTIVE,
  })
  status: OrganizationUnitStatus;

  /** ancestry path, for the acyclic guarantee (PF-C0530) */
  @Column({ type: 'jsonb', default: [] })
  lineage: string[];
}
