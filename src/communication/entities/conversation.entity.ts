import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** CM-012 §2.1 (CM-C1156) — the exact 5 named conversation types. */
export enum ConversationType {
  DIRECT = 'DIRECT',
  GROUP = 'GROUP',
  CLIENT_PROVIDER = 'CLIENT_PROVIDER',
  SERVICE = 'SERVICE',
  SUPPORT = 'SUPPORT',
}

/** CM-012 §4.1 (CM-C1157) — the 5 named linear states, plus QUARANTINED
 * (explicitly named in the source text as "with quarantine where
 * required", unlike the vaguer unnamed "branches" language used elsewhere
 * in this codebase — so included here as a real enum value rather than
 * left out). */
export enum ConversationState {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  RESTRICTED = 'RESTRICTED',
  CLOSED = 'CLOSED',
  ARCHIVED = 'ARCHIVED',
  QUARANTINED = 'QUARANTINED',
}

/**
 * CM-012 §2.1 (CM-C1156) — Conversation: declares tenant/owner, type,
 * participant roles, source context, access/privacy/retention policy,
 * cross-tenant permission, minors policy, moderation state, and effective
 * dates.
 *
 * §1 (CM-C1149-C1152): Community/Interaction separately owns Posts/
 * Comments/Replies and contextual discussion — a comment thread under a
 * lesson is NOT a Conversation row. `sourceContextRef` links to a source
 * object (Course/Lesson/Assessment/etc.) without owning it or copying it
 * (mirrors XD-008's Composition rule, XD-C0612) — this table never
 * duplicates another domain's object.
 *
 * §5 (CM-C1168): tenant administrators do NOT automatically read private
 * conversations merely by holding that title — enforced at the access-
 * resolution layer (XD-008), not by a column on this table.
 */
@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn('uuid', { name: 'conversation_id' })
  conversationId: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ name: 'owner_ref' })
  ownerRef: string;

  @Column({ name: 'conversation_type', type: 'enum', enum: ConversationType })
  conversationType: ConversationType;

  @Column({ name: 'participant_roles', type: 'jsonb', default: {} })
  participantRoles: Record<string, unknown>;

  /** links to the source object without owning it (CM-C1151-C1152) */
  @Column({ name: 'source_context_ref', type: 'jsonb', nullable: true })
  sourceContextRef?: Record<string, unknown>;

  @Column({ name: 'access_privacy_retention_policy', type: 'jsonb' })
  accessPrivacyRetentionPolicy: Record<string, unknown>;

  /** see §3 (CM-C1162-C1167) — nullable: most conversations are single-
   * tenant and this only applies when cross-tenant messaging is in play. */
  @Column({ name: 'cross_tenant_permission', type: 'jsonb', nullable: true })
  crossTenantPermission?: Record<string, unknown>;

  /** see §6 — this column is an opaque policy container per CM-012's own
   * field table; it holds ONLY this schema's own stated consequences
   * (CM-C1173-C1176), never a redefinition of CM-011's own child-safety
   * substance. No child-safety-specific field is modeled directly on this
   * table — see moderation-envelope.entity.ts's doc comment for why the
   * full ChildSafetyCase family is deliberately not implemented here. */
  @Column({ name: 'minors_policy', type: 'jsonb', default: {} })
  minorsPolicy: Record<string, unknown>;

  @Column({ name: 'moderation_state', type: 'jsonb', default: {} })
  moderationState: Record<string, unknown>;

  @Column({ type: 'enum', enum: ConversationState, default: ConversationState.DRAFT })
  state: ConversationState;
}
