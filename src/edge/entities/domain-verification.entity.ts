import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * ENGINEERING SYNTHESIS — no GOV-002/CORE decision names a
 * "DomainVerification" object. Grounded in
 * `planning/GROWHUBS_V2_ARCHITECTURE_AND_AGENT_ORG_PLAN_v2.md` §4: "DNS
 * verification flow (the 'add a CNAME/TXT record' step every white-label
 * platform has) is a `PF-012`-adjacent workflow: it's an
 * ownership-verification process analogous to the ownership-transfer
 * evidence model already specified there (`PF-C0542`), applied to domain
 * ownership instead of business ownership." This entity is that analogue
 * — deliberately shaped like `OwnershipTransfer` (verified-evidence,
 * immutable audit trail, explicit status) rather than invented from
 * scratch, same as `OwnershipTransferStatus`'s own doc comment discloses
 * for ITS enum: no literal value list is given anywhere for a domain-
 * verification status either, so the values below are an engineering
 * synthesis of the named process steps (propose a domain, prove control
 * via DNS, provision TLS, go live), flagged explicitly, not a governance
 * decision.
 *
 * Deliberately kept SEPARATE from `BrandBinding` (`PF-011` §2.9,
 * `PF-C0508`): `BrandBinding` is "presentation routing ONLY... MUST NEVER
 * appear in any authorization check," a narrow, already-approved shape
 * this codebase must not widen. The onboarding workflow — proving control
 * of a domain before it's allowed to route anywhere — is its own object;
 * only once a `DomainVerification` reaches ACTIVE does anything create
 * the corresponding `BrandBinding` row (see `DomainOnboardingService`).
 */
export enum DomainVerificationMethod {
  DNS_TXT_RECORD = 'DNS_TXT_RECORD',
  DNS_CNAME_RECORD = 'DNS_CNAME_RECORD',
}

export enum DomainVerificationStatus {
  PROPOSED = 'PROPOSED',
  DNS_CHECK_PENDING = 'DNS_CHECK_PENDING',
  VERIFIED = 'VERIFIED',
  TLS_PROVISIONING = 'TLS_PROVISIONING',
  ACTIVE = 'ACTIVE',
  FAILED = 'FAILED',
  REVOKED = 'REVOKED',
}

@Entity('domain_verifications')
export class DomainVerification {
  @PrimaryGeneratedColumn('uuid', { name: 'domain_verification_id' })
  domainVerificationId: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ name: 'requested_domain' })
  requestedDomain: string;

  @Column({
    name: 'verification_method',
    type: 'enum',
    enum: DomainVerificationMethod,
  })
  verificationMethod: DomainVerificationMethod;

  /** the random value the tenant must publish (as a TXT record, or as the
   * CNAME target) to prove control of requestedDomain — generated once,
   * at PROPOSED, never regenerated for the same row (a new attempt is a
   * new row, same "never a standing yes" discipline used elsewhere in
   * this codebase for approvals). */
  @Column({ name: 'verification_token' })
  verificationToken: string;

  /** what the DNS check actually observed, each time it ran — an
   * append-only-in-spirit log (last check result), analogous to
   * OwnershipTransfer.authorityEvidence. */
  @Column({ name: 'dns_evidence', type: 'jsonb', nullable: true })
  dnsEvidence?: Record<string, unknown>;

  @Column({ name: 'tls_evidence', type: 'jsonb', nullable: true })
  tlsEvidence?: Record<string, unknown>;

  @Column({
    type: 'enum',
    enum: DomainVerificationStatus,
    default: DomainVerificationStatus.PROPOSED,
  })
  status: DomainVerificationStatus;

  @Column({ name: 'requested_at', type: 'timestamptz', default: () => 'now()' })
  requestedAt: Date;

  @Column({ name: 'verified_at', type: 'timestamptz', nullable: true })
  verifiedAt?: Date;

  @Column({ name: 'activated_at', type: 'timestamptz', nullable: true })
  activatedAt?: Date;
}
