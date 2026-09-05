import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * PF-011 §2.10 — FederatedReference: the ONE sanctioned shape for cross-
 * tenant/cross-platform pointers (e.g. GrowHubs<->B2Build, per XD-011).
 * Never transfers ownership (PF-C0513) — always a pointer plus scope
 * (PF-C0512).
 */
@Entity('federated_references')
export class FederatedReference {
  @PrimaryGeneratedColumn('uuid', { name: 'federated_reference_id' })
  federatedReferenceId: string;

  @Column({ name: 'local_tenant_or_entity_id', type: 'uuid' })
  localTenantOrEntityId: string;

  /** e.g. "B2BUILD". */
  @Column({ name: 'external_platform' })
  externalPlatform: string;

  /** opaque to GrowHubs. */
  @Column({ name: 'external_entity_id' })
  externalEntityId: string;

  @Column({ name: 'relation_kind' })
  relationKind: string;

  /** exact authorized fields/actions. */
  @Column({ type: 'jsonb' })
  scope: Record<string, unknown>;

  /** the authorizing grant (organization link, consent). */
  @Column({ name: 'authority_ref' })
  authorityRef: string;

  @Column({ default: 1 })
  version: number;

  @Column({ name: 'sync_state' })
  syncState: string;

  @Column({ name: 'retention_until', type: 'timestamptz', nullable: true })
  retentionUntil?: Date;

  @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true })
  revokedAt?: Date;
}
