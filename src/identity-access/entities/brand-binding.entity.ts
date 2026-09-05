import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum BrandBindingType {
  ORGANIZATION = 'ORGANIZATION',
  TENANT = 'TENANT',
  SCOPED_PRODUCT = 'SCOPED_PRODUCT',
}

/**
 * PF-011 §2.9 — Brand/domain/app binding: presentation routing ONLY. Never
 * changes tenant_id, controller status, security boundary, or MoR status
 * (PF-C0508). MUST NEVER appear in any authorization check — enforced by
 * convention: no access-resolution code (XD-008) may join against this
 * table.
 */
@Entity('brand_bindings')
export class BrandBinding {
  @PrimaryGeneratedColumn('uuid', { name: 'binding_id' })
  bindingId: string;

  @Column({ name: 'bound_type', type: 'enum', enum: BrandBindingType })
  boundType: BrandBindingType;

  @Column({ name: 'bound_id', type: 'uuid' })
  boundId: string;

  @Column({ unique: true })
  domain: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;
}
