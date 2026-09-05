import { Module } from '@nestjs/common';
import { DomainOnboardingService, DNS_RESOLVER } from './domain-onboarding.service';
import { DomainResolutionService } from './domain-resolution.service';
import { NodeDnsResolver } from './dns-resolver';

/**
 * EdgeModule — the Edge/Domain-onboarding layer from
 * `planning/GROWHUBS_V2_ARCHITECTURE_AND_AGENT_ORG_PLAN_v2.md` §2/§4/§7.
 * The plan's actual edge routing (Cloudflare Workers or equivalent, TLS
 * automation) runs OUTSIDE this NestJS monolith, at the network edge —
 * this module is the monolith-side half: the domain-verification
 * workflow and the tenant-resolution lookup the edge layer would call
 * into (or that a future dedicated edge service would call over its own
 * API).
 */
@Module({
  providers: [
    DomainOnboardingService,
    DomainResolutionService,
    { provide: DNS_RESOLVER, useClass: NodeDnsResolver },
  ],
  exports: [DomainOnboardingService, DomainResolutionService],
})
export class EdgeModule {}
