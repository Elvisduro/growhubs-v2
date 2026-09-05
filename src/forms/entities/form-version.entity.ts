import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

/**
 * FRM-001 §2.2 (CORE-C1554) — FormVersion: an IMMUTABLE snapshot of schema/
 * layout/branching/validation/consent/actions/translations/theme/access/
 * effective/publication state at the moment it is published. Once a
 * version has received submissions, it never mutates (CORE-C1562) — a
 * correction is always a NEW version, never an edit of a published one.
 * Nothing in this codebase issues an UPDATE against schema_snapshot on a
 * row that has any Submission referencing it.
 */
@Entity('form_versions')
@Index(['formId', 'versionNumber'], { unique: true })
export class FormVersion {
  @PrimaryGeneratedColumn('uuid', { name: 'form_version_id' })
  formVersionId: string;

  @Column({ name: 'form_id', type: 'uuid' })
  formId: string;

  @Column({ name: 'version_number' })
  versionNumber: number;

  /** full field/branch/validation/consent/action/translation/theme
   * definition. The concrete DSL is an engineering choice, not a
   * governance decision (FRM-001 §13). */
  @Column({ name: 'schema_snapshot', type: 'jsonb' })
  schemaSnapshot: Record<string, unknown>;

  @Column({ name: 'effective_from', type: 'timestamptz' })
  effectiveFrom: Date;

  /** null while in DRAFT/REVIEW */
  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt?: Date;
}
