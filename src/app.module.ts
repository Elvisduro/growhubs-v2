import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppDataSource } from './data-source';
import { StateMachineModule } from './platform/state-machine/state-machine.module';
import { BuilderModule } from './builder/builder.module';
import { EdgeModule } from './edge/edge.module';

@Module({
  imports: [
    // Registers the same DataSource used by the TypeORM CLI (data-source.ts)
    // as the app-wide connection, so any service can @InjectDataSource() it —
    // this is what StateMachineEngine relies on. Previously absent: the app
    // had a StateMachineModule but no actual DB connection wired into Nest's
    // DI, left over from before the Prisma -> TypeORM pivot.
    TypeOrmModule.forRoot(AppDataSource.options),
    StateMachineModule,
    // Builder/Blueprint Engine — application-layer, ENGINEERING SYNTHESIS
    // per planning/GROWHUBS_V2_ARCHITECTURE_AND_AGENT_ORG_PLAN_v2.md §2/§7.
    BuilderModule,
    // Edge/Domain-onboarding layer — application-layer, ENGINEERING
    // SYNTHESIS per planning/GROWHUBS_V2_ARCHITECTURE_AND_AGENT_ORG_PLAN_v2.md §4/§7.
    EdgeModule,
  ],
})
export class AppModule {}
