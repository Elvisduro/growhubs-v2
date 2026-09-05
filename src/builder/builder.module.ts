import { Module } from '@nestjs/common';
import { BlueprintEngineService } from './blueprint-engine.service';
import { BlueprintController } from './blueprint.controller';

/**
 * BuilderModule — the shared Blueprint Engine every builder-type module
 * (page/funnel/agent-capability/course/...) imports rather than
 * reimplementing its own version-snapshot logic, per
 * `planning/GROWHUBS_V2_ARCHITECTURE_AND_AGENT_ORG_PLAN_v2.md` §2/§7.
 */
@Module({
  controllers: [BlueprintController],
  providers: [BlueprintEngineService],
  exports: [BlueprintEngineService],
})
export class BuilderModule {}
