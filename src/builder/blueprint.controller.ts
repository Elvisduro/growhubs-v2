import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { BlueprintEngineService } from './blueprint-engine.service';

/**
 * BlueprintController — the one HTTP surface this codebase exposes so
 * far for the client renderers §6 describes (Next.js web, React Native
 * mobile, Tauri desktop all "ship a renderer for that definition" — they
 * need something to fetch the definition FROM). Deliberately minimal:
 * read-only, published-version-only. Publishing/authoring stays a
 * service-level call (`BlueprintEngineService.publishVersion`) until a
 * concrete builder-type UI needs its own authenticated write endpoint —
 * not fabricated here ahead of that need.
 */
@Controller('blueprints')
export class BlueprintController {
  constructor(private readonly blueprintEngine: BlueprintEngineService) {}

  @Get(':blueprintId/latest')
  async getLatest(@Param('blueprintId') blueprintId: string) {
    const definition = await this.blueprintEngine.getDefinition(blueprintId);
    if (!definition) {
      throw new NotFoundException(`no BlueprintDefinition ${blueprintId}`);
    }
    const version = await this.blueprintEngine.getLatestPublishedVersion(blueprintId);
    if (!version) {
      throw new NotFoundException(`BlueprintDefinition ${blueprintId} has no published version yet`);
    }
    return {
      blueprintId: definition.blueprintId,
      name: definition.name,
      blueprintType: definition.blueprintType,
      lifecycleState: definition.lifecycleState,
      versionNumber: version.versionNumber,
      schemaSnapshot: version.schemaSnapshot,
      renderContract: version.renderContract,
      publishedAt: version.publishedAt,
    };
  }
}
