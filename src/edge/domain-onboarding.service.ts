import { Injectable, Inject } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { randomBytes } from 'crypto';
import {
  DomainVerification,
  DomainVerificationMethod,
  DomainVerificationStatus,
} from './entities/domain-verification.entity';
import { BrandBinding, BrandBindingType } from '../identity-access/entities/brand-binding.entity';
import { observedRecordsProveControl } from './dns-verification';
import { DnsResolver } from './dns-resolver';

export const DNS_RESOLVER = 'EDGE_DNS_RESOLVER';

/**
 * DomainOnboardingService — the DNS-verification workflow from
 * `planning/GROWHUBS_V2_ARCHITECTURE_AND_AGENT_ORG_PLAN_v2.md` §4. See
 * `entities/domain-verification.entity.ts`'s docstring for why this is a
 * separate object from `BrandBinding`, and `dns-resolver.ts` for why the
 * actual DNS I/O is injected rather than called directly.
 */
@Injectable()
export class DomainOnboardingService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @Inject(DNS_RESOLVER) private readonly dnsResolver: DnsResolver,
  ) {}

  /** Step 1: a tenant proposes a custom domain. Generates the token they
   * must publish and records the row as PROPOSED. */
  async proposeDomain(params: {
    tenantId: string;
    requestedDomain: string;
    verificationMethod: DomainVerificationMethod;
  }): Promise<DomainVerification> {
    const repo = this.dataSource.getRepository(DomainVerification);
    const verification = repo.create({
      tenantId: params.tenantId,
      requestedDomain: params.requestedDomain,
      verificationMethod: params.verificationMethod,
      verificationToken: `growhubs-verify-${randomBytes(16).toString('hex')}`,
      status: DomainVerificationStatus.PROPOSED,
    });
    return repo.save(verification);
  }

  /** Step 2: actually check DNS for the published token. Only valid from
   * PROPOSED/DNS_CHECK_PENDING — VERIFIED/ACTIVE rows are never re-checked
   * by this method (a re-verification of an already-active domain would
   * be its own, separate operation, not modeled here). */
  async checkVerification(domainVerificationId: string): Promise<DomainVerification> {
    const repo = this.dataSource.getRepository(DomainVerification);
    const verification = await repo.findOneByOrFail({ domainVerificationId });

    if (
      verification.status !== DomainVerificationStatus.PROPOSED &&
      verification.status !== DomainVerificationStatus.DNS_CHECK_PENDING
    ) {
      throw new Error(
        `checkVerification only runs from PROPOSED/DNS_CHECK_PENDING, row is ${verification.status}`,
      );
    }

    let observedRecords: string[];
    try {
      observedRecords =
        verification.verificationMethod === DomainVerificationMethod.DNS_TXT_RECORD
          ? (await this.dnsResolver.resolveTxt(verification.requestedDomain)).map((chunks) => chunks.join(''))
          : await this.dnsResolver.resolveCname(verification.requestedDomain);
    } catch (err) {
      verification.status = DomainVerificationStatus.DNS_CHECK_PENDING;
      verification.dnsEvidence = { error: (err as Error).message, checkedAt: new Date().toISOString() };
      return repo.save(verification);
    }

    const proven = observedRecordsProveControl(observedRecords, verification.verificationToken);
    verification.dnsEvidence = { observedRecords, checkedAt: new Date().toISOString(), proven };

    if (proven) {
      verification.status = DomainVerificationStatus.VERIFIED;
      verification.verifiedAt = new Date();
    } else {
      verification.status = DomainVerificationStatus.DNS_CHECK_PENDING;
    }
    return repo.save(verification);
  }

  /** Step 3: once VERIFIED (and, in a real deployment, once TLS is
   * actually provisioned — `tlsEvidence` is left for that follow-up
   * integration, not fabricated here), flips to ACTIVE and creates the
   * routing row. This is the ONLY place in this codebase that creates a
   * BrandBinding from a DomainVerification — BrandBinding itself never
   * gains verification columns, keeping PF-011 §2.9's narrow shape
   * intact. */
  async activateDomain(domainVerificationId: string): Promise<BrandBinding> {
    return this.dataSource.transaction(async (manager) => {
      const verificationRepo = manager.getRepository(DomainVerification);
      const verification = await verificationRepo.findOneByOrFail({ domainVerificationId });

      if (verification.status !== DomainVerificationStatus.VERIFIED) {
        throw new Error(`activateDomain only runs from VERIFIED, row is ${verification.status}`);
      }

      verification.status = DomainVerificationStatus.ACTIVE;
      verification.activatedAt = new Date();
      await verificationRepo.save(verification);

      const bindingRepo = manager.getRepository(BrandBinding);
      const binding = bindingRepo.create({
        boundType: BrandBindingType.TENANT,
        boundId: verification.tenantId,
        domain: verification.requestedDomain,
        tenantId: verification.tenantId,
      });
      return bindingRepo.save(binding);
    });
  }
}
