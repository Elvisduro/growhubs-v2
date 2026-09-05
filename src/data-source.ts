import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Account } from './identity-access/entities/account.entity';
import { Person } from './identity-access/entities/person.entity';
import { Organization } from './identity-access/entities/organization.entity';
import { Tenant } from './identity-access/entities/tenant.entity';
import { OrganizationUnit } from './identity-access/entities/organization-unit.entity';
import { Workspace } from './identity-access/entities/workspace.entity';
import { TenantMembership, WorkspaceMembership } from './identity-access/entities/membership.entity';
import { RoleAssignment } from './identity-access/entities/role-assignment.entity';
import { BillingAccount } from './identity-access/entities/billing-account.entity';
import { BrandBinding } from './identity-access/entities/brand-binding.entity';
import { FederatedReference } from './identity-access/entities/federated-reference.entity';
import { Delegation } from './identity-access/entities/delegation.entity';
import { OwnershipRecord, OwnershipTransfer } from './identity-access/entities/ownership-record.entity';
import { SuccessionPlan } from './identity-access/entities/succession-plan.entity';
import { OrganizationRecoveryCase } from './identity-access/entities/organization-recovery-case.entity';
import { StateMachineDefinition } from './platform/state-machine/entities/state-machine-definition.entity';
import { TransitionDefinition } from './platform/state-machine/entities/transition-definition.entity';
import { TransitionAttempt } from './platform/state-machine/entities/transition-attempt.entity';
import { Approval } from './platform/state-machine/entities/approval.entity';
import { TransitionRepairQueue } from './platform/state-machine/entities/transition-repair-queue.entity';
import { StateMachineObjectState } from './platform/state-machine/entities/state-machine-object-state.entity';
import { ActionCapability } from './authority-access/entities/action-capability.entity';
import { ApprovalPolicy } from './authority-access/entities/approval-policy.entity';
import { AuthorityGrant } from './authority-access/entities/authority-grant.entity';
import { ARIAActionRequest } from './authority-access/entities/aria-action-request.entity';
import { AccessPolicy } from './authority-access/entities/access-policy.entity';
import { AccessGrant } from './authority-access/entities/access-grant.entity';
import { AccessRestriction } from './authority-access/entities/access-restriction.entity';
import { AccessDecision } from './authority-access/entities/access-decision.entity';
import { FormDefinition } from './forms/entities/form-definition.entity';
import { FormVersion } from './forms/entities/form-version.entity';
import { FieldDefinition } from './forms/entities/field-definition.entity';
import { Submission } from './forms/entities/submission.entity';
import { ResponseValue } from './forms/entities/response-value.entity';
import { ConsentReceipt } from './forms/entities/consent-receipt.entity';
import {
  LearningCommercialPolicySnapshot,
  CommercialLearningCase,
} from './commercial-learning/entities/cl011-commercial-learning-boundary.entities';
import {
  LearningAssignment,
  Enrollment,
  ProgrammeRegistration,
  LearningProgress,
  ComplianceEvaluation,
  CompliancePolicySnapshot,
} from './commercial-learning/entities/cl012-assignment-compliance.entities';
import {
  LearnerRecord,
  ProjectedLearningFact,
  Transcript,
  Portfolio,
  LearningPassport,
  LearnerProfile,
} from './commercial-learning/entities/cl013-learner-record.entities';
import { Conversation } from './communication/entities/conversation.entity';
import {
  Message,
  MessageVersion,
  MessageAttachment,
  DeliveryReceipt,
  ReadReceipt,
} from './communication/entities/message.entity';
import {
  CommunicationPolicy,
  CommunicationConsent,
} from './communication/entities/communication-policy-consent.entity';
import {
  ModerationEnvelope,
  ConversationCase,
} from './communication/entities/moderation-envelope.entity';
import {
  TorvetSurface,
  TorvetMarketCell,
  LiquidityGate,
  LiquidityPlan,
} from './torvet/entities/torvet-surface.entity';
import { TorvetProjection } from './torvet/entities/torvet-projection.entity';
import { ModerationCase } from './moderation/entities/moderation-case.entity';
import { ChildSafetyCase } from './moderation/entities/child-safety-case.entity';
import { KillSwitchDefinition } from './kill-switch/entities/kill-switch-definition.entity';
import { KillSwitchActivation } from './kill-switch/entities/kill-switch-activation.entity';
import { DataSubjectRequest } from './dsr/entities/data-subject-request.entity';
import { LegalHold } from './dsr/entities/legal-hold.entity';
import {
  DeletionPropagationPlan,
  PropagationTarget,
} from './dsr/entities/deletion-propagation-plan.entity';
import { Notification } from './notification/entities/notification.entity';
import { SupportCase } from './support/entities/support-case.entity';
import { Credential } from './credential/entities/credential.entity';
import { ServiceAgreement } from './consulting-service/entities/service-agreement.entity';
import { Milestone } from './consulting-service/entities/milestone.entity';
import { EventRegistration } from './events/entities/event-registration.entity';
import {
  AdmissionCredential,
  AdmissionScanEvent,
} from './events/entities/admission-credential.entity';
import { JourneyAutomationRun } from './journey-automation/entities/journey-automation-run.entity';
import { Order } from './commerce/entities/order.entity';
import { Payment } from './commerce/entities/payment.entity';
import { RefundCase } from './commerce/entities/refund-case.entity';
import { ChargebackCase } from './commerce/entities/chargeback-case.entity';
import { Subscription } from './commerce/entities/subscription.entity';
import { Payout } from './commerce/entities/payout.entity';
import { Entitlement } from './commerce/entities/entitlement.entity';
import { PublicationVersion } from './publication/entities/publication-version.entity';
import { MeterDefinition } from './metering/entities/meter-definition.entity';
import { UsageEvent } from './metering/entities/usage-event.entity';
import { Allowance } from './metering/entities/allowance.entity';
import { FinancialCredit } from './metering/entities/financial-credit.entity';
import { TenantExitCase } from './tenancy/entities/tenant-exit-case.entity';
import { CapturePolicySnapshot } from './media-capture/entities/capture-policy-snapshot.entity';
import { RecordingSession } from './media-capture/entities/recording-session.entity';
import { ConsentEvidence } from './media-capture/entities/consent-evidence.entity';
import { Meeting } from './media-capture/entities/meeting.entity';
import { Participant } from './media-capture/entities/participant.entity';
import { ParticipantNotice } from './media-capture/entities/participant-notice.entity';
import { RecordingPermission } from './media-capture/entities/recording-permission.entity';
import { RecordingSegment } from './media-capture/entities/recording-segment.entity';
import { RawRecording } from './media-capture/entities/raw-recording.entity';
import { MeetingTranscript } from './media-capture/entities/transcript.entity';
import { SpeakerLabel } from './media-capture/entities/speaker-label.entity';
import { DerivedArtifact } from './media-capture/entities/derived-artifact.entity';
import { MeetingAccessGrant } from './media-capture/entities/meeting-access-grant.entity';
import { RecordingCase } from './media-capture/entities/recording-case.entity';
import { DeletionPropagationJob } from './media-capture/entities/deletion-propagation-job.entity';
import { RightsClaim } from './rights/entities/rights-claim.entity';
import { ClaimedWorkMatch } from './rights/entities/claimed-work-match.entity';
import { ClaimantAuthority } from './rights/entities/claimant-authority.entity';
import { AffectedAsset } from './rights/entities/affected-asset.entity';
import { RequestedAction } from './rights/entities/requested-action.entity';
import { ClaimDecision } from './rights/entities/claim-decision.entity';
import { CounterNotice } from './rights/entities/counter-notice.entity';
import { Appeal } from './rights/entities/appeal.entity';
import { RestorationAction } from './rights/entities/restoration-action.entity';
import { RepeatInfringementCase } from './rights/entities/repeat-infringement-case.entity';
import { BlueprintDefinition } from './builder/entities/blueprint-definition.entity';
import { BlueprintVersion } from './builder/entities/blueprint-version.entity';
import { DomainVerification } from './edge/entities/domain-verification.entity';

/**
 * Single source of truth for entities + migrations, shared by:
 *  - the NestJS app (via @nestjs/typeorm's TypeOrmModule.forRoot, app.module.ts)
 *  - the TypeORM CLI (migration:generate / migration:run, via this file directly)
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [
    // PF-011 minimal foundation
    Account,
    Person,
    Organization,
    Tenant,
    OrganizationUnit,
    Workspace,
    TenantMembership,
    WorkspaceMembership,
    RoleAssignment,
    BillingAccount,
    BrandBinding,
    FederatedReference,
    // PF-012 org hierarchy/ownership/succession/continuity
    Delegation,
    OwnershipRecord,
    OwnershipTransfer,
    SuccessionPlan,
    OrganizationRecoveryCase,
    // PLT-005 shared state-machine substrate
    StateMachineDefinition,
    TransitionDefinition,
    TransitionAttempt,
    Approval,
    TransitionRepairQueue,
    StateMachineObjectState,
    // XD-007 ARIA authority
    ActionCapability,
    ApprovalPolicy,
    AuthorityGrant,
    ARIAActionRequest,
    // XD-008 access resolution
    AccessPolicy,
    AccessGrant,
    AccessRestriction,
    AccessDecision,
    // FRM-001 forms/submission/consent
    FormDefinition,
    FormVersion,
    FieldDefinition,
    Submission,
    ResponseValue,
    ConsentReceipt,
    // CL-011 commercial <-> learning boundary
    LearningCommercialPolicySnapshot,
    CommercialLearningCase,
    // CL-012 assignment/enrollment/compliance
    LearningAssignment,
    Enrollment,
    ProgrammeRegistration,
    LearningProgress,
    ComplianceEvaluation,
    CompliancePolicySnapshot,
    // CL-013 learner record/transcript/portfolio/passport
    LearnerRecord,
    ProjectedLearningFact,
    Transcript,
    Portfolio,
    LearningPassport,
    LearnerProfile,
    // CM-012 communication domain
    Conversation,
    Message,
    MessageVersion,
    MessageAttachment,
    DeliveryReceipt,
    ReadReceipt,
    CommunicationPolicy,
    CommunicationConsent,
    ModerationEnvelope,
    ConversationCase,
    // TV-012 torvet projection freshness
    TorvetSurface,
    TorvetMarketCell,
    LiquidityGate,
    LiquidityPlan,
    TorvetProjection,
    // Moderation domain — CM-011 / 20_ModerationCase.md
    ModerationCase,
    ChildSafetyCase,
    // Kill Switch registry — PLT-003 / 22_KillSwitch.md
    KillSwitchDefinition,
    KillSwitchActivation,
    // Data Subject Request / retention / legal hold — PLT-001 / 21_DataSubjectRequest.md
    DataSubjectRequest,
    LegalHold,
    DeletionPropagationPlan,
    PropagationTarget,
    // Notification lifecycle — PLT-005 / 18_Notification.md
    Notification,
    // Support Case lifecycle — PLT-005 / 19_SupportCase.md
    SupportCase,
    // Credential lifecycle — PLT-005 / CL-011 / CL-013 / 09_Credential.md
    Credential,
    // Consulting & Service — CS-002/003/005 / 11_ServiceAgreement.md / 12_Milestone.md
    ServiceAgreement,
    Milestone,
    // Events — EV-004 / EV-005 / 13_EventRegistration.md / 14_AdmissionCredential.md
    EventRegistration,
    AdmissionCredential,
    AdmissionScanEvent,
    // Journey/Automation Run — PLT-005 / 17_JourneyAutomationRun.md
    JourneyAutomationRun,
    // Commerce family — FIN-001/CL-011/MS-011/XD-008 / 01-07_*.md
    Order,
    Payment,
    RefundCase,
    ChargebackCase,
    Subscription,
    Payout,
    Entitlement,
    // Publication lifecycle — PLT-005 / XD-001 / 15_Publication.md
    PublicationVersion,
    // Metered resources — PLT-006 (GOV-002 CORE-C1952-1993, no dedicated
    // schema doc yet) — all 4 named objects (CORE-C1952)
    MeterDefinition,
    UsageEvent,
    Allowance,
    FinancialCredit,
    // Tenant exit — TEN-001 (GOV-002 CORE-C2158-2197, no dedicated schema
    // doc yet)
    TenantExitCase,
    // Meeting/recording capture — MI-001 (GOV-002 CORE-C1608-1661, no
    // dedicated schema doc yet) — all 15 named objects (CORE-C1608-1645)
    CapturePolicySnapshot,
    RecordingSession,
    ConsentEvidence,
    Meeting,
    Participant,
    ParticipantNotice,
    RecordingPermission,
    RecordingSegment,
    RawRecording,
    MeetingTranscript,
    SpeakerLabel,
    DerivedArtifact,
    MeetingAccessGrant,
    RecordingCase,
    DeletionPropagationJob,
    // Rights/copyright — TR-001 (GOV-002 CORE-C1662-1701, no dedicated
    // schema doc yet) — all 10 named objects (CORE-C1675)
    RightsClaim,
    ClaimedWorkMatch,
    ClaimantAuthority,
    AffectedAsset,
    RequestedAction,
    ClaimDecision,
    CounterNotice,
    Appeal,
    RestorationAction,
    RepeatInfringementCase,
    // Builder/Blueprint Engine — application-layer, ENGINEERING SYNTHESIS,
    // mirrors FRM-001's FormDefinition/FormVersion split per
    // planning/GROWHUBS_V2_ARCHITECTURE_AND_AGENT_ORG_PLAN_v2.md §2/§13
    BlueprintDefinition,
    BlueprintVersion,
    // Edge/Domain-onboarding layer — application-layer, ENGINEERING
    // SYNTHESIS, per planning/GROWHUBS_V2_ARCHITECTURE_AND_AGENT_ORG_PLAN_v2.md §4
    DomainVerification,
  ],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  synchronize: false, // NEVER true — every schema change goes through a reviewed migration
  logging: process.env.TYPEORM_LOGGING === 'true',
});
