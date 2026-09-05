import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * AffectedAsset — TR-001's object naming the GrowHubs content item a
 * `RightsClaim` targets (`CORE-C1675`). `CORE-C1665`: rights-unknown
 * status cannot enter high-risk public/commercial distribution —
 * `rightsStatusAtClaimTime` freezes what the asset's own TR-001 rights
 * status (`CORE-C1664`'s 8 named values) was AT THE MOMENT the claim was
 * filed, since that status can change independently afterward.
 */
@Entity('affected_assets')
export class AffectedAsset {
  @PrimaryGeneratedColumn('uuid', { name: 'affected_asset_id' })
  affectedAssetId: string;

  @Column({ name: 'rights_claim_id', type: 'uuid' })
  rightsClaimId: string;

  @Column({ name: 'asset_ref', type: 'jsonb' })
  assetRef: Record<string, unknown>;

  /** one of the 8 named TR-001 rights-status values (CORE-C1664:
   * original-owned, licensed, Creative Commons, claimed public domain,
   * permission obtained, lawful-exception claim, restricted third-party,
   * rights-unknown) as it stood at claim time — engineering synthesis
   * for the storage shape (string, not a new enum here) since this field
   * belongs to the asset's own TR-001 rights metadata, not to the claim. */
  @Column({ name: 'rights_status_at_claim_time', nullable: true })
  rightsStatusAtClaimTime?: string;
}
