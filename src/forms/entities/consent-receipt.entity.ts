import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * FRM-001 §2.6/§4 (CORE-C1558, CORE-C1571-C1575) — ConsentReceipt: a legal
 * record, not a UI checkbox. Independent of every other Form object
 * (CORE-C1558) — this is its own auditable row that a Submission may
 * reference (see Submission.consentReceiptIds), never the reverse.
 *
 * FIELD LIST NOTE: unlike FRM-001's other entities, §2.6 gives no literal
 * field table for ConsentReceipt — only the prose rules in §4. The columns
 * below are an engineering synthesis of those rules (affirmative,
 * unbundled, purpose/controller/channel/data/recipient/text/version/age/
 * guardian/time/source/expiry/withdrawal-specific — CORE-C1571), flagged
 * here explicitly rather than presented as a literal schema the approved
 * document spelled out.
 *
 * Withdrawal is modeled as an added `withdrawnAt` timestamp, never as a
 * mutable status flip on this row, precisely because withdrawal must never
 * rewrite lawful history (CORE-C1575) — "consent was given" and "consent
 * was later withdrawn" must both remain permanently, simultaneously true,
 * which an immutable given_at + nullable withdrawn_at pair preserves and a
 * single overwritten status column would not.
 */
@Entity('consent_receipts')
export class ConsentReceipt {
  @PrimaryGeneratedColumn('uuid', { name: 'consent_id' })
  consentId: string;

  /** nullable: a receipt may be captured under a pseudonymous/anonymous
   * identity mode (FRM-001 §2.7) before any Person record exists. */
  @Column({ name: 'subject_person_id', type: 'uuid', nullable: true })
  subjectPersonId?: string;

  @Column()
  purpose: string;

  /** the data controller this consent was given to/for */
  @Column()
  controller: string;

  @Column()
  channel: string;

  @Column({ name: 'data_categories', type: 'jsonb', default: [] })
  dataCategories: string[];

  @Column({ nullable: true })
  recipient?: string;

  /** the EXACT text shown at the moment of consent — never a reference to
   * "current" policy text, since policy text can change later. */
  @Column({ name: 'consent_text' })
  consentText: string;

  @Column({ name: 'consent_text_version' })
  consentTextVersion: string;

  /** age/guardian context, when relevant — kept as JSON rather than
   * separate columns since it applies only to a subset of receipts. */
  @Column({ name: 'age_guardian_context', type: 'jsonb', nullable: true })
  ageGuardianContext?: Record<string, unknown>;

  @Column({ name: 'guardian_person_id', type: 'uuid', nullable: true })
  guardianPersonId?: string;

  @Column({ name: 'given_at', type: 'timestamptz', default: () => 'now()' })
  givenAt: Date;

  @Column({ name: 'source_context', type: 'jsonb', default: {} })
  sourceContext: Record<string, unknown>;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt?: Date;

  /** see class doc comment: withdrawal is appended, never overwritten. */
  @Column({ name: 'withdrawn_at', type: 'timestamptz', nullable: true })
  withdrawnAt?: Date;
}
