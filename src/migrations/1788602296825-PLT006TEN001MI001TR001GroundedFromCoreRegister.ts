import { MigrationInterface, QueryRunner } from "typeorm";

export class PLT006TEN001MI001TR001GroundedFromCoreRegister1788602296825 implements MigrationInterface {
    name = 'PLT006TEN001MI001TR001GroundedFromCoreRegister1788602296825'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // NOTE: migration:generate's diff repeatedly proposes dropping the
        // hand-written raw-SQL CHECK constraint CHK_access_restrictions_precedence_1_or_2
        // (it isn't part of TypeORM entity metadata, so the generator always
        // sees it as a phantom removal) — a generator artifact, not a real
        // schema change. Spurious DROP/ADD pair removed here, same fix
        // applied to every migration since XD-007/008.
        await queryRunner.query(`CREATE TYPE "public"."meter_definitions_resource_family_enum" AS ENUM('AI', 'MEDIA_STORAGE_EGRESS_TRANSCODE_LIVE', 'EMAIL_SMS_PUSH', 'CONNECTOR_API_MAPS_STORAGE', 'PLATFORM_SEAT_CONTACT_RESOURCES')`);
        await queryRunner.query(`CREATE TABLE "meter_definitions" ("meter_definition_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "resource_family" "public"."meter_definitions_resource_family_enum" NOT NULL, "version" integer NOT NULL DEFAULT '1', "measurement_contract" jsonb NOT NULL, "policy_contract" jsonb NOT NULL, "cost_price_contract" jsonb NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_107547b6a9cc71d25adf162d7f5" PRIMARY KEY ("meter_definition_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_09729fe26f08e7bc77a6e2e9e2" ON "meter_definitions"  ("resource_family", "version") `);
        await queryRunner.query(`CREATE TYPE "public"."usage_events_state_enum" AS ENUM('ESTIMATED', 'RESERVED', 'STARTED', 'MEASURED', 'RECONCILED', 'FINAL', 'CANCELLED', 'RELEASED', 'PARTIAL', 'PROVIDER_PENDING', 'DISPUTED', 'REVERSAL_CORRECTED', 'NON_BILLABLE_FAILURE')`);
        await queryRunner.query(`CREATE TABLE "usage_events" ("usage_event_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenant_id" uuid NOT NULL, "meter_definition_id" uuid NOT NULL, "meter_definition_version" integer NOT NULL, "source_ref" jsonb NOT NULL, "actor_ref" jsonb NOT NULL, "provider_ref" jsonb, "timing" jsonb NOT NULL, "estimated_quantity" numeric, "reserved_quantity" numeric, "actual_quantity" numeric, "billable_quantity" numeric, "allowance_allocation" jsonb, "overage_allocation" jsonb, "cost_evidence" jsonb, "state" "public"."usage_events_state_enum" NOT NULL DEFAULT 'ESTIMATED', "state_version" integer NOT NULL DEFAULT '0', "correction_of_usage_event_id" uuid, "idempotency_key" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_fee8d428a8c09a7549ea9c7f9b7" UNIQUE ("idempotency_key"), CONSTRAINT "PK_fce9a39da653e55666ecc51973e" PRIMARY KEY ("usage_event_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_cc51deb3ff7de06aaaccd17bbe" ON "usage_events"  ("tenant_id", "meter_definition_id") `);
        await queryRunner.query(`CREATE TYPE "public"."tenant_exit_cases_exit_type_enum" AS ENUM('CANCEL_PLAN', 'DOWNGRADE', 'DORMANCY', 'TRANSFER', 'AGENCY_HANDOVER', 'MERGE', 'SPLIT', 'VOLUNTARY_CLOSURE', 'PLATFORM_ENFORCED_CLOSURE', 'INSOLVENCY_OR_SUCCESSION')`);
        await queryRunner.query(`CREATE TYPE "public"."tenant_exit_cases_state_enum" AS ENUM('REQUESTED', 'ELIGIBILITY_CHECK', 'EXPORT_PREPARING', 'FINANCIAL_RECONCILIATION', 'ACCESS_TRANSITION', 'GRACE_PERIOD', 'RESTRICTION', 'CLOSURE_EXECUTION', 'RETENTION_ONLY', 'COMPLETED', 'CANCELLED', 'DISPUTED', 'LEGAL_HOLD', 'SAFETY_HOLD', 'SUCCESSION')`);
        await queryRunner.query(`CREATE TABLE "tenant_exit_cases" ("exit_case_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenant_id" uuid NOT NULL, "exit_type" "public"."tenant_exit_cases_exit_type_enum" NOT NULL, "state" "public"."tenant_exit_cases_state_enum" NOT NULL DEFAULT 'REQUESTED', "state_version" integer NOT NULL DEFAULT '0', "eligibility_evidence" jsonb, "export_record" jsonb, "financial_reconciliation_record" jsonb, "access_transition_plan" jsonb, "grace_period_ends_at" TIMESTAMP WITH TIME ZONE, "hold_evidence" jsonb, "requested_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "closed_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_4a6e9ce7a71509673203add2cd3" PRIMARY KEY ("exit_case_id"))`);
        await queryRunner.query(`CREATE TABLE "capture_policy_snapshots" ("capture_policy_snapshot_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "version" integer NOT NULL DEFAULT '1', "relevant_jurisdictions" jsonb NOT NULL, "controller_ref" jsonb NOT NULL, "declared_lawful_purpose_basis" jsonb NOT NULL, "notice_consent_requirements" jsonb NOT NULL, "child_guardian_workplace_rules" jsonb NOT NULL, "permitted_derivatives" jsonb NOT NULL, "retention_policy" jsonb NOT NULL, "withdrawal_consequences" jsonb NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_1c8aaf1f55022593a5acf68fadc" PRIMARY KEY ("capture_policy_snapshot_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."recording_sessions_state_enum" AS ENUM('PREPARING', 'NOTICE_PENDING', 'READY', 'RECORDING_LOCAL', 'PAUSED', 'STOPPED', 'SYNC_PENDING', 'UPLOADING', 'VERIFIED', 'PROCESSING', 'AVAILABLE', 'ARCHIVED', 'DELETION_PENDING', 'DELETED')`);
        await queryRunner.query(`CREATE TABLE "recording_sessions" ("recording_session_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenant_id" uuid NOT NULL, "capture_policy_snapshot_id" uuid NOT NULL, "purpose" character varying NOT NULL, "meeting_context_type" character varying NOT NULL, "known_location_jurisdiction" jsonb, "participants_ref" jsonb NOT NULL, "sensitive_minor_workplace_context" jsonb NOT NULL DEFAULT '{}', "requested_outputs" jsonb NOT NULL, "retention_request" jsonb, "notice_permission_basis" jsonb NOT NULL, "state" "public"."recording_sessions_state_enum" NOT NULL DEFAULT 'PREPARING', "state_version" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "ended_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_59117cc86324dd64947a0dd44b7" PRIMARY KEY ("recording_session_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."consent_evidences_method_enum" AS ENUM('DEVICE_WEB_CONFIRMATION', 'SIGNED_MEETING_RECORD', 'MARKED_VERBAL_CONFIRMATION', 'GUARDIAN_REPRESENTATIVE_EVIDENCE')`);
        await queryRunner.query(`CREATE TABLE "consent_evidences" ("consent_evidence_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "recording_session_id" uuid NOT NULL, "person_role_ref" jsonb NOT NULL, "response" character varying NOT NULL, "notice_version" integer NOT NULL, "scope" jsonb NOT NULL, "method" "public"."consent_evidences_method_enum" NOT NULL, "source" jsonb NOT NULL, "responded_at" TIMESTAMP WITH TIME ZONE NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_198a940767c8afa9f0fd19eaa9b" PRIMARY KEY ("consent_evidence_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."rights_claims_state_enum" AS ENUM('SUBMITTED', 'VALIDATION', 'TRIAGE', 'TEMPORARY_ACTION', 'NO_TEMPORARY_ACTION', 'REVIEW', 'UPHELD', 'REJECTED', 'PARTIAL', 'COUNTER_NOTICE', 'APPEAL', 'RESTORED', 'RESTRICTED', 'REMOVED', 'CLOSED', 'REOPENED')`);
        await queryRunner.query(`CREATE TABLE "rights_claims" ("rights_claim_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "claimed_work_ref" jsonb NOT NULL, "claimant_ref" jsonb NOT NULL, "authority_evidence" jsonb NOT NULL, "affected_asset_ref" jsonb NOT NULL, "requested_action" jsonb NOT NULL, "automated_match_evidence" jsonb, "claim_decision" jsonb, "counter_notice" jsonb, "appeal" jsonb, "restoration_action" jsonb, "repeat_infringement_case_ref" jsonb, "state" "public"."rights_claims_state_enum" NOT NULL DEFAULT 'SUBMITTED', "state_version" integer NOT NULL DEFAULT '0', "submitted_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "closed_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_58d3cd662d53d824ccb504f1e45" PRIMARY KEY ("rights_claim_id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "rights_claims"`);
        await queryRunner.query(`DROP TYPE "public"."rights_claims_state_enum"`);
        await queryRunner.query(`DROP TABLE "consent_evidences"`);
        await queryRunner.query(`DROP TYPE "public"."consent_evidences_method_enum"`);
        await queryRunner.query(`DROP TABLE "recording_sessions"`);
        await queryRunner.query(`DROP TYPE "public"."recording_sessions_state_enum"`);
        await queryRunner.query(`DROP TABLE "capture_policy_snapshots"`);
        await queryRunner.query(`DROP TABLE "tenant_exit_cases"`);
        await queryRunner.query(`DROP TYPE "public"."tenant_exit_cases_state_enum"`);
        await queryRunner.query(`DROP TYPE "public"."tenant_exit_cases_exit_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cc51deb3ff7de06aaaccd17bbe"`);
        await queryRunner.query(`DROP TABLE "usage_events"`);
        await queryRunner.query(`DROP TYPE "public"."usage_events_state_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_09729fe26f08e7bc77a6e2e9e2"`);
        await queryRunner.query(`DROP TABLE "meter_definitions"`);
        await queryRunner.query(`DROP TYPE "public"."meter_definitions_resource_family_enum"`);
        // Spurious ADD CONSTRAINT removed here (see up() note) — the
        // CHK_access_restrictions_precedence_1_or_2 constraint was never
        // actually dropped, so it must not be re-added.
    }

}
