import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { DerivativeLineageBase } from './derivative-lineage';

/** `CORE-C1636` names the remaining derivative kinds beyond Transcript/
 * SpeakerLabel verbatim: "Summary/notes, Tasks, CRM entries, Search/
 * vector indexes, Knowledge items, clips/thumbnails, exports/integrations
 * and ARIA memory/caches." All modeled as one `DerivedArtifact` table
 * (rather than eight more separate tables) since the register gives them
 * as one grouped list sharing identical lineage fields and no
 * kind-specific fields of their own — `artifactKind` distinguishes them;
 * splitting further would add table boundaries the decision doesn't
 * itself draw. */
export enum DerivedArtifactKind {
  SUMMARY_NOTES = 'SUMMARY_NOTES',
  TASKS = 'TASKS',
  CRM_ENTRIES = 'CRM_ENTRIES',
  SEARCH_VECTOR_INDEXES = 'SEARCH_VECTOR_INDEXES',
  KNOWLEDGE_ITEMS = 'KNOWLEDGE_ITEMS',
  CLIPS_THUMBNAILS = 'CLIPS_THUMBNAILS',
  EXPORTS_INTEGRATIONS = 'EXPORTS_INTEGRATIONS',
  ARIA_MEMORY_CACHE = 'ARIA_MEMORY_CACHE',
}

/** DerivedArtifact — see `derivative-lineage.ts` for the shared field
 * shape (`CORE-C1637`). `CORE-C1661` (Invariant): insufficiently
 * permitted material never enters Torvet, marketing or model training —
 * enforced by `accessPolicy` (inherited), never by this row existing at
 * all being treated as implicit permission. */
@Entity('derived_artifacts')
export class DerivedArtifact extends DerivativeLineageBase {
  @PrimaryGeneratedColumn('uuid', { name: 'derived_artifact_id' })
  derivedArtifactId: string;

  @Column({ name: 'artifact_kind', type: 'enum', enum: DerivedArtifactKind })
  artifactKind: DerivedArtifactKind;

  @Column({ type: 'jsonb' })
  content: Record<string, unknown>;
}
