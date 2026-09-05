import { Module } from '@nestjs/common';
import { TenantContextService } from '../tenant-context.service';
import { StateMachineEngine } from './state-machine.service';

/**
 * PlatformModule's core export: every domain module (identity-access, forms,
 * commerce-learning, communication-torvet) imports this to get access to the
 * ONE shared StateMachineEngine, per PLT-005 §1 — never a per-domain
 * reimplementation of transition/version/audit logic.
 *
 * StateMachineEngine injects the app-wide DataSource directly (registered
 * globally by TypeOrmModule.forRoot() in AppModule), so it is not listed as
 * a provider here — only the pieces this module itself owns are.
 */
@Module({
  providers: [TenantContextService, StateMachineEngine],
  exports: [StateMachineEngine, TenantContextService],
})
export class StateMachineModule {}
