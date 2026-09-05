import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * FRM-001 §2.5 (CORE-C1557) — ResponseValue: binds one answer to its field
 * AND its version — never just to the field in the abstract, since the
 * same field_id can carry different validation/options across versions.
 */
@Entity('response_values')
export class ResponseValue {
  @PrimaryGeneratedColumn('uuid', { name: 'response_id' })
  responseId: string;

  @Column({ name: 'submission_id', type: 'uuid' })
  submissionId: string;

  @Column({ name: 'field_id', type: 'uuid' })
  fieldId: string;

  /** redundant but required for correct historical interpretation
   * (CORE-C1557) */
  @Column({ name: 'form_version_id', type: 'uuid' })
  formVersionId: string;

  @Column({ type: 'jsonb' })
  value: unknown;
}
