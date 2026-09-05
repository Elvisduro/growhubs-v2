import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { BlueprintDefinition, BlueprintLifecycleState } from './entities/blueprint-definition.entity';
import { BlueprintVersion } from './entities/blueprint-version.entity';

/**
 * BlueprintEngineService — ENGINEERING SYNTHESIS. The one shared
 * implementation of "publish a new immutable version" every builder type
 * (page/funnel/agent-capability/course/...) calls into, per
 * `planning/GROWHUBS_V2_ARCHITECTURE_AND_AGENT_ORG_PLAN_v2.md` §2: "a
 * generic, blueprint-agnostic CRUD+versioning system... separating it
 * forces the reuse rather than each builder team reinventing its own
 * version-snapshot logic." Deliberately minimal at this stage — only the
 * one invariant the plan actually calls out (never mutate a published
 * version; a correction is always a new version) is enforced here.
 * Render-contract validation, per-builder-type schema validation, and any
 * cross-domain wiring (ARIA capability blueprints, event-bus publication)
 * are left for the owning builder-type agent to add against this shared
 * base, per the plan's "published, versioned contract" parallelism model
 * (§7) — not fabricated here ahead of that work.
 */
@Injectable()
export class BlueprintEngineService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  /**
   * Publishes the next version of a blueprint. Reads the current highest
   * versionNumber for this blueprintId, inserts version+1 with
   * publishedAt=now(), and flips the parent BlueprintDefinition's
   * lifecycleState to PUBLISHED — all inside one transaction, since a
   * published definition with no published version (or vice versa) would
   * be an inconsistent state no reader should ever observe.
   */
  async publishVersion(params: {
    blueprintId: string;
    schemaSnapshot: Record<string, unknown>;
    renderContract: Record<string, unknown>;
    effectiveFrom?: Date;
  }): Promise<BlueprintVersion> {
    return this.dataSource.transaction(async (manager) => {
      const definition = await manager.findOneByOrFail(BlueprintDefinition, {
        blueprintId: params.blueprintId,
      });

      const latest = await manager
        .createQueryBuilder(BlueprintVersion, 'v')
        .where('v.blueprint_id = :blueprintId', { blueprintId: params.blueprintId })
        .orderBy('v.version_number', 'DESC')
        .getOne();

      const nextVersionNumber = (latest?.versionNumber ?? 0) + 1;

      const version = manager.create(BlueprintVersion, {
        blueprintId: params.blueprintId,
        versionNumber: nextVersionNumber,
        schemaSnapshot: params.schemaSnapshot,
        renderContract: params.renderContract,
        effectiveFrom: params.effectiveFrom ?? new Date(),
        publishedAt: new Date(),
      });
      const saved = await manager.save(version);

      definition.lifecycleState = BlueprintLifecycleState.PUBLISHED;
      await manager.save(definition);

      return saved;
    });
  }

  /**
   * Reads the highest-versionNumber published version for a blueprint —
   * what any renderer (web/mobile/desktop, per §6) actually fetches to
   * draw the current live UI. Returns null if the blueprint has no
   * published version yet (still DRAFT/REVIEW).
   */
  async getLatestPublishedVersion(blueprintId: string): Promise<BlueprintVersion | null> {
    const version = await this.dataSource
      .createQueryBuilder(BlueprintVersion, 'v')
      .where('v.blueprint_id = :blueprintId', { blueprintId })
      .andWhere('v.published_at IS NOT NULL')
      .orderBy('v.version_number', 'DESC')
      .getOne();
    return version ?? null;
  }

  async getDefinition(blueprintId: string): Promise<BlueprintDefinition | null> {
    return this.dataSource.getRepository(BlueprintDefinition).findOneBy({ blueprintId });
  }
}
