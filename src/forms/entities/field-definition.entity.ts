import { Column, Entity, PrimaryColumn } from 'typeorm';

/**
 * FRM-001 §2.3 (CORE-C1555) — FieldDefinition: a stable, typed field
 * carrying sensitivity/purpose/retention/mapping metadata.
 *
 * SCHEMA NOTE: the approved doc's field table lists `field_id` as "PK...
 * stable across versions" alongside `form_version_id` as "this instance's
 * version" — read literally as two separate statements this is
 * inconsistent (a single-column PK cannot repeat across version rows).
 * The coherent reading, consistent with FormVersion's own immutability
 * (CORE-C1562, every published version is a frozen snapshot including its
 * field definitions) and with §2.3.1's semantic_mapping_key existing
 * precisely to link field identity ACROSS versions, is: `field_id` is
 * stable/reused across a form's versions as a logical identifier, while
 * the actual row identity (what a DB row's real primary key must be, since
 * one field can have a differently-configured row in each version) is the
 * pair (field_id, form_version_id). This is an engineering resolution of
 * an apparent drafting ambiguity, not a reinterpretation of any governance
 * decision — flagged here rather than silently picking one reading.
 */
@Entity('field_definitions')
export class FieldDefinition {
  @PrimaryColumn({ name: 'field_id', type: 'uuid' })
  fieldId: string;

  @PrimaryColumn({ name: 'form_version_id', type: 'uuid' })
  formVersionId: string;

  /** text/number/date/file/choice/scored/etc. — the doc's own list ends in
   * "etc.", i.e. explicitly open-ended, so stored as a string rather than
   * an invented closed enum. */
  @Column({ name: 'field_type' })
  fieldType: string;

  /** e.g. SENSITIVE, MINOR_RELATED, STANDARD — "e.g." in the source text
   * means this is a non-exhaustive, extensible taxonomy, so stored as a
   * string rather than a closed enum that would need amending for every
   * new tag a tenant or domain introduces. */
  @Column({ name: 'sensitivity_tag' })
  sensitivityTag: string;

  /** enables cross-version analytics (§2.3.1, CORE-C1563) — without an
   * explicit mapping, two versions' fields are never silently assumed
   * equivalent. */
  @Column({ name: 'semantic_mapping_key', nullable: true })
  semanticMappingKey?: string;
}
