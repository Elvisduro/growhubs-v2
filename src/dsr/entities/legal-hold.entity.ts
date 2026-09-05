import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * PLT-001 (line 828) — LegalHold: a versioned, authorized restriction
 * blocking deletion/anonymisation of a scoped set of objects/classes.
 * Requirements given verbatim in the approved text: authority, scoped
 * objects/classes, reason/basis, date, review/expiry date, access
 * restriction while held, secondary-use prohibition, and a release
 * workflow — "never an indefinite convenience hold." Attachment/release
 * is itself a versioned, authorized action, never a silent side effect of
 * an unrelated write (§Idempotency & concurrency notes).
 *
 * A hold matching CM-011's own ChildSafetyCase preservation rule is
 * surfaced through this same object (see cross-domain touchpoints in
 * `21_DataSubjectRequest.md`) rather than a separate hold mechanism —
 * one canonical hold shape reused by whichever domain needs it.
 */
@Entity('legal_holds')
export class LegalHold {
  @PrimaryGeneratedColumn('uuid', { name: 'hold_id' })
  holdId: string;

  /** who placed/authorized the hold — Superadmin, a named authority, or a
   * cross-referenced domain rule (e.g. CM-011 preservation). */
  @Column({ name: 'authority_ref', type: 'jsonb' })
  authorityRef: Record<string, unknown>;

  /** the scoped objects/classes this hold covers — polymorphic, since a
   * hold can scope to specific object ids, a RetentionClass, or a whole
   * DataSubjectRequest's affected set. */
  @Column({ type: 'jsonb' })
  scope: Record<string, unknown>;

  /** reason/basis for the hold — full detail may not always be
   * appropriate to disclose to the requester (per the DSR machine's own
   * "reason category, not full legal detail where inappropriate" rule),
   * so this stores the full basis; what's disclosed is an
   * application-layer projection of this field, not a separate column. */
  @Column({ name: 'reason_basis', type: 'jsonb' })
  reasonBasis: Record<string, unknown>;

  @Column({ name: 'placed_at', type: 'timestamptz', default: () => 'now()' })
  placedAt: Date;

  /** required review/expiry date — a hold is never an indefinite
   * convenience hold, so this column is NOT nullable. */
  @Column({ name: 'review_or_expiry_at', type: 'timestamptz' })
  reviewOrExpiryAt: Date;

  @Column({ name: 'released_at', type: 'timestamptz', nullable: true })
  releasedAt?: Date;

  @Column({ name: 'release_authority_ref', type: 'jsonb', nullable: true })
  releaseAuthorityRef?: Record<string, unknown>;

  @Column({ default: 1 })
  version: number;
}
