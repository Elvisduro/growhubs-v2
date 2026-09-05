import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** `CORE-C1675` (TR-001, GOV-002 EXECUTED, `MASTER_SPEC.md:1438`) — the
 * named states given verbatim: "RightsClaim... support submitted→
 * validation→triage→temporary/no-temporary action→review→upheld/
 * rejected/partial→counter-notice/appeal→restored/restricted/removed→
 * closed/reopened." TEMPORARY_ACTION/NO_TEMPORARY_ACTION are a branch
 * pair at the same lifecycle point (whether a temporary restriction was
 * applied pending review — `CORE-C1678`/`CORE-C1679`: temporary controls
 * never declare guilt or delete review evidence); UPHELD/REJECTED/PARTIAL
 * are the three named review outcomes; RESTORED/RESTRICTED/REMOVED are
 * the three named post-decision asset outcomes. Initial: SUBMITTED.
 * Terminal: CLOSED (REOPENED loops back into the machine, per the doc's
 * own "closed/reopened" pairing — same treatment as this codebase's other
 * families where a named terminal state can be reopened by an authorised
 * repair path). */
export enum RightsClaimState {
  SUBMITTED = 'SUBMITTED',
  VALIDATION = 'VALIDATION',
  TRIAGE = 'TRIAGE',
  TEMPORARY_ACTION = 'TEMPORARY_ACTION',
  NO_TEMPORARY_ACTION = 'NO_TEMPORARY_ACTION',
  REVIEW = 'REVIEW',
  UPHELD = 'UPHELD',
  REJECTED = 'REJECTED',
  PARTIAL = 'PARTIAL',
  COUNTER_NOTICE = 'COUNTER_NOTICE',
  APPEAL = 'APPEAL',
  RESTORED = 'RESTORED',
  RESTRICTED = 'RESTRICTED',
  REMOVED = 'REMOVED',
  CLOSED = 'CLOSED',
  REOPENED = 'REOPENED',
}

/**
 * RightsClaim — TR-001's central lifecycle object. No dedicated
 * `TR-001_*_SCHEMA_v1.md` document exists yet; grounded directly in
 * `gov002_repaired/CORE_repaired.md` rows `CORE-C1662`–`CORE-C1701`, same
 * discipline as this codebase's PLT-006/TEN-001/MI-001 entities and
 * `15_Publication.md`. `CORE-C1675` names 10 distinct TR-001 objects
 * (RightsClaim, ClaimedWork/Match, Claimant/AuthorityEvidence,
 * AffectedAsset, RequestedAction, ClaimDecision, CounterNotice, Appeal,
 * RestorationAction, RepeatInfringementCase) — this entity models
 * RightsClaim as the anchor row; the other 9 are now each their own
 * dedicated table (`ClaimedWorkMatch`, `ClaimantAuthority`,
 * `AffectedAsset`, `RequestedAction`, `ClaimDecision`, `CounterNotice`,
 * `Appeal`, `RestorationAction`, `RepeatInfringementCase`), referenced
 * here by FK-id columns rather than embedded as jsonb sub-records — this
 * corrects the first pass, which held them inline pending a dedicated
 * schema doc that turned out unnecessary since `CORE-C1675` already
 * names them as distinct objects.
 *
 * Binding invariants directly enforced by this shape: `CORE-C1680`
 * **"Automated matching is a signal, never a final finding"** —
 * `claimedWorkMatchId`'s automated-match evidence is kept on that table,
 * separate from `claimDecisionId`, which only a human REVIEW can
 * populate (nullable until then); `CORE-C1665` rights-unknown status on
 * the affected asset cannot enter high-risk distribution — checked
 * against the asset's own TR-001 rights metadata, not this row;
 * `CORE-C1687` a REJECTED or reversed claim never counts toward
 * repeat-infringement scoring — `repeatInfringementCaseId` is populated
 * only on UPHELD, never speculatively.
 */
@Entity('rights_claims')
export class RightsClaim {
  @PrimaryGeneratedColumn('uuid', { name: 'rights_claim_id' })
  rightsClaimId: string;

  /** ClaimedWork/Match — what the claimant asserts is theirs, and the
   * (possibly automated) match against the affected asset
   * (`CORE-C1680`: a signal, never a final finding on its own). */
  @Column({ name: 'claimed_work_match_id', type: 'uuid' })
  claimedWorkMatchId: string;

  /** Claimant/AuthorityEvidence — who is claiming and their evidence of
   * authority to do so. */
  @Column({ name: 'claimant_authority_id', type: 'uuid' })
  claimantAuthorityId: string;

  /** AffectedAsset — the GrowHubs content item this claim targets. */
  @Column({ name: 'affected_asset_id', type: 'uuid' })
  affectedAssetId: string;

  /** RequestedAction — what the claimant is asking for (takedown,
   * monetisation hold, attribution, etc.). */
  @Column({ name: 'requested_action_id', type: 'uuid' })
  requestedActionId: string;

  /** ClaimDecision — populated only by human REVIEW (`CORE-C1681`'s
   * review factors: authority/ownership evidence, licence/territory/
   * duration/scope, lawful-use context, transformation/amount, abuse
   * risk, provider contracts, effect on both rights holder and uploader). */
  @Column({ name: 'claim_decision_id', type: 'uuid', nullable: true })
  claimDecisionId?: string;

  /** CounterNotice — the uploader's response, when filed. */
  @Column({ name: 'counter_notice_id', type: 'uuid', nullable: true })
  counterNoticeId?: string;

  /** Appeal — either party's appeal of the decision. */
  @Column({ name: 'appeal_id', type: 'uuid', nullable: true })
  appealId?: string;

  /** RestorationAction — recorded when a RESTRICTED/REMOVED asset is
   * restored. */
  @Column({ name: 'restoration_action_id', type: 'uuid', nullable: true })
  restorationActionId?: string;

  /** RepeatInfringementCase link — populated only on UPHELD, per
   * `CORE-C1684`/`CORE-C1687` (counts substantiated outcomes, reversals,
   * severity, knowledge, recurrence, identity confidence, prior
   * education, jurisdiction, proportionality; never raw claim volume
   * alone, never a rejected/reversed claim). */
  @Column({ name: 'repeat_infringement_case_id', type: 'uuid', nullable: true })
  repeatInfringementCaseId?: string;

  @Column({
    type: 'enum',
    enum: RightsClaimState,
    default: RightsClaimState.SUBMITTED,
  })
  state: RightsClaimState;

  @Column({ name: 'state_version', default: 0 })
  stateVersion: number;

  @Column({ name: 'submitted_at', type: 'timestamptz', default: () => 'now()' })
  submittedAt: Date;

  @Column({ name: 'closed_at', type: 'timestamptz', nullable: true })
  closedAt?: Date;
}
