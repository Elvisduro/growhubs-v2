import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BrandBinding } from '../identity-access/entities/brand-binding.entity';

/**
 * DomainResolutionService — `planning/GROWHUBS_V2_ARCHITECTURE_AND_AGENT_ORG_PLAN_v2.md`
 * §4: "Tenant resolution happens once, at the edge, and is passed down to
 * the core monolith as a resolved tenant_id — the API Gateway and domain
 * monolith never re-derive tenant identity from a domain string
 * themselves, keeping XD-008's access-resolution model... uncontaminated
 * by routing concerns."
 *
 * BINDING CONSTRAINT, restated from BrandBinding's own doc comment
 * (`PF-C0508`): this lookup is PRESENTATION ROUTING ONLY. The
 * `tenantId`/`boundType`/`boundId` this returns must never be treated as
 * an authorization decision, and no XD-008 access-resolution code may
 * call this service or join against `brand_bindings` — resolving which
 * tenant a Host header belongs to is a completely different question
 * from whether the caller is allowed to act as/within that tenant.
 */
@Injectable()
export class DomainResolutionService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async resolveHost(host: string): Promise<{ tenantId: string; boundType: string; boundId: string } | null> {
    const binding = await this.dataSource.getRepository(BrandBinding).findOneBy({ domain: host });
    if (!binding) return null;
    return { tenantId: binding.tenantId, boundType: binding.boundType, boundId: binding.boundId };
  }
}
