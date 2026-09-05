import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { DerivativeLineageBase } from './derivative-lineage';

/** SpeakerLabel — one of MI-001's named lineage-bearing derivatives
 * (`CORE-C1636`). See `derivative-lineage.ts` for the shared field
 * shape (`CORE-C1637`). `CORE-C1634`/`CORE-C1635`: **anonymous
 * diarisation ("Speaker 1") is distinct from declared participant
 * mapping and voice-biometric identification — voiceprint/biometric
 * identification is disabled at Launch.** `labelKind` records which of
 * the two permitted kinds this row is; a third, biometric kind is
 * deliberately not modeled since `CORE-C1635`/`CORE-C1652` prohibit it
 * at Launch. */
export enum SpeakerLabelKind {
  ANONYMOUS_DIARISATION = 'ANONYMOUS_DIARISATION',
  DECLARED_PARTICIPANT_MAPPING = 'DECLARED_PARTICIPANT_MAPPING',
}

@Entity('speaker_labels')
export class SpeakerLabel extends DerivativeLineageBase {
  @PrimaryGeneratedColumn('uuid', { name: 'speaker_label_id' })
  speakerLabelId: string;

  @Column({ name: 'label_kind', type: 'enum', enum: SpeakerLabelKind })
  labelKind: SpeakerLabelKind;

  /** the declared participant this label maps to — only set when
   * `labelKind` is DECLARED_PARTICIPANT_MAPPING. */
  @Column({ name: 'participant_id', type: 'uuid', nullable: true })
  participantId?: string;

  @Column({ type: 'jsonb' })
  segments: Record<string, unknown>[];
}
