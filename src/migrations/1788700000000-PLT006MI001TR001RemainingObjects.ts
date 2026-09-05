import { MigrationInterface, QueryRunner } from "typeorm";

export class PLT006MI001TR001RemainingObjects1788700000000 implements MigrationInterface {
    name = 'PLT006MI001TR001RemainingObjects1788700000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // NOTE: migration:generate's diff repeatedly proposes dropping
        // "CHK_access_restrictions_precedence_1_or_2" and re-adding it
        // unchanged — a generator artifact (the hand-written raw-SQL CHECK
        // constraint isn't part of TypeORM entity metadata), not a real
        // schema change. Spurious DROP/ADD pair removed here, same fix
        // applied to every migration since XD-007/008.
        await queryRunner.query(`CREATE TYPE "public"."allowances_overage_model_enum" AS ENUM('NO_OVERAGE_HARD_CAP', 'PAY_AS_YOU_GO', 'PREPAID_ADD_ON', 'EXPLICIT_CONSENT_AUTO_TOP_UP', 'PERIOD_INVOICE', 'APPROVAL', 'ENTERPRISE_COMMITMENT', 'FAIR_USE_REVIEW', 'SPONSORED_ALLOWANCE')`);
        await queryRunner.query(`CREATE TABLE "allowances" ("allowance_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenant_id" uuid NOT NULL, "meter_definition_id" uuid NOT NULL, "period_ref" jsonb NOT NULL, "included_quantity" numeric NOT NULL, "consumed_quantity" numeric NOT NULL DEFAULT '0', "thresholds_percent" jsonb NOT NULL DEFAULT '[50,75,90,100]', "overage_model" "public"."allowances_overage_model_enum" NOT NULL, "budget_scope" jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_9c16a4c65f7a8cc606d3485f9fa" PRIMARY KEY ("allowance_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_d42ce4365d536533ace34d7c68" ON "allowances"  ("tenant_id", "meter_definition_id") `);
        await queryRunner.query(`CREATE TABLE "financial_credits" ("financial_credit_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenant_id" uuid NOT NULL, "reason" character varying NOT NULL, "authority_ref" uuid, "case_ref" jsonb, "expires_at" TIMESTAMP WITH TIME ZONE, "ledger_impact" jsonb NOT NULL, "audit_ref" jsonb NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_90b6cdd8825bcb0d04d35ab4fe0" PRIMARY KEY ("financial_credit_id"))`);
        await queryRunner.query(`CREATE TABLE "meetings" ("meeting_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenant_id" uuid NOT NULL, "organizer_ref" jsonb NOT NULL, "scheduled_start_at" TIMESTAMP WITH TIME ZONE, "scheduled_end_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_94c7573e25968fa197975366cee" PRIMARY KEY ("meeting_id"))`);
        await queryRunner.query(`CREATE TABLE "participants" ("participant_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "recording_session_id" uuid NOT NULL, "person_ref" jsonb NOT NULL, "role" character varying NOT NULL, "joined_at" TIMESTAMP WITH TIME ZONE NOT NULL, "left_at" TIMESTAMP WITH TIME ZONE, "is_late_arrival" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_21c0dc46f025572c6b99626b9eb" PRIMARY KEY ("participant_id"))`);
        await queryRunner.query(`CREATE TABLE "participant_notices" ("participant_notice_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "recording_session_id" uuid NOT NULL, "participant_id" uuid NOT NULL, "capture_policy_snapshot_id" uuid NOT NULL, "notice_content" jsonb NOT NULL, "delivered_at" TIMESTAMP WITH TIME ZONE NOT NULL, "repeated_for_late_arrival" boolean NOT NULL DEFAULT false, "repeated_for_purpose_change" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_f25eae2046f7d713759521d112d" PRIMARY KEY ("participant_notice_id"))`);
        await queryRunner.query(`CREATE TABLE "recording_permissions" ("recording_permission_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "recording_session_id" uuid NOT NULL, "participant_id" uuid NOT NULL, "consent_evidence_id" uuid, "granted_scope" jsonb NOT NULL, "granted_at" TIMESTAMP WITH TIME ZONE NOT NULL, "revoked_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_2fc4390167674cee35fdef7b2fd" PRIMARY KEY ("recording_permission_id"))`);
        await queryRunner.query(`CREATE TABLE "recording_segments" ("recording_segment_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "recording_session_id" uuid NOT NULL, "started_at" TIMESTAMP WITH TIME ZONE NOT NULL, "ended_at" TIMESTAMP WITH TIME ZONE, "notice_evidence_scope" jsonb NOT NULL, "participants_present" jsonb NOT NULL, CONSTRAINT "PK_06892edce699724677722d64728" PRIMARY KEY ("recording_segment_id"))`);
        await queryRunner.query(`CREATE TABLE "raw_recordings" ("raw_recording_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "recording_session_id" uuid NOT NULL, "storage_ref" jsonb NOT NULL, "checksum" character varying NOT NULL, "size_bytes" bigint NOT NULL, "captured_at" TIMESTAMP WITH TIME ZONE NOT NULL, "uploaded_at" TIMESTAMP WITH TIME ZONE, "integrity_verified_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_39a4e5561c012fc861d4584821c" PRIMARY KEY ("raw_recording_id"))`);
        await queryRunner.query(`CREATE TABLE "meeting_transcripts" ("recording_session_id" uuid NOT NULL, "recording_segment_id" uuid, "capture_policy_snapshot_id" uuid NOT NULL, "purpose" character varying NOT NULL, "participant_scope" jsonb NOT NULL, "provider_model_version_confidence" jsonb NOT NULL, "retention_policy" jsonb NOT NULL, "access_policy" jsonb NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "meeting_transcript_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" jsonb NOT NULL, CONSTRAINT "PK_5a5b5de83131b69a6cb122481fc" PRIMARY KEY ("meeting_transcript_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."speaker_labels_label_kind_enum" AS ENUM('ANONYMOUS_DIARISATION', 'DECLARED_PARTICIPANT_MAPPING')`);
        await queryRunner.query(`CREATE TABLE "speaker_labels" ("recording_session_id" uuid NOT NULL, "recording_segment_id" uuid, "capture_policy_snapshot_id" uuid NOT NULL, "purpose" character varying NOT NULL, "participant_scope" jsonb NOT NULL, "provider_model_version_confidence" jsonb NOT NULL, "retention_policy" jsonb NOT NULL, "access_policy" jsonb NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "speaker_label_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "label_kind" "public"."speaker_labels_label_kind_enum" NOT NULL, "participant_id" uuid, "segments" jsonb NOT NULL, CONSTRAINT "PK_23749cb9042a7eb5dade27d10b5" PRIMARY KEY ("speaker_label_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."derived_artifacts_artifact_kind_enum" AS ENUM('SUMMARY_NOTES', 'TASKS', 'CRM_ENTRIES', 'SEARCH_VECTOR_INDEXES', 'KNOWLEDGE_ITEMS', 'CLIPS_THUMBNAILS', 'EXPORTS_INTEGRATIONS', 'ARIA_MEMORY_CACHE')`);
        await queryRunner.query(`CREATE TABLE "derived_artifacts" ("recording_session_id" uuid NOT NULL, "recording_segment_id" uuid, "capture_policy_snapshot_id" uuid NOT NULL, "purpose" character varying NOT NULL, "participant_scope" jsonb NOT NULL, "provider_model_version_confidence" jsonb NOT NULL, "retention_policy" jsonb NOT NULL, "access_policy" jsonb NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "derived_artifact_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "artifact_kind" "public"."derived_artifacts_artifact_kind_enum" NOT NULL, "content" jsonb NOT NULL, CONSTRAINT "PK_4420f5395b5e518be9edcadad24" PRIMARY KEY ("derived_artifact_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."meeting_access_grants_resource_kind_enum" AS ENUM('RAW_MEDIA', 'TRANSCRIPT', 'SPEAKER_MAPPING', 'SUMMARY', 'TASKS', 'CRM', 'EXPORT_DOWNLOAD', 'SHARING', 'ARIA')`);
        await queryRunner.query(`CREATE TABLE "meeting_access_grants" ("meeting_access_grant_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "recording_session_id" uuid NOT NULL, "grantee_ref" jsonb NOT NULL, "resource_kind" "public"."meeting_access_grants_resource_kind_enum" NOT NULL, "is_cross_tenant" boolean NOT NULL DEFAULT false, "purpose" character varying, "granted_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "revoked_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_a77921411305dc7a68ced20b5dd" PRIMARY KEY ("meeting_access_grant_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."recording_cases_case_type_enum" AS ENUM('REFUSAL', 'WITHDRAWAL', 'PURPOSE_CHANGE_REQUEST', 'BYSTANDER_SENSITIVE_MEETING', 'LOST_COMPROMISED_DEVICE', 'CROSS_TENANT_SHARING_DENIAL')`);
        await queryRunner.query(`CREATE TABLE "recording_cases" ("recording_case_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "recording_session_id" uuid NOT NULL, "case_type" "public"."recording_cases_case_type_enum" NOT NULL, "evidence" jsonb NOT NULL, "resolution" jsonb, "opened_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "closed_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_0e86423af3e11a40a6a557b2e59" PRIMARY KEY ("recording_case_id"))`);
        await queryRunner.query(`CREATE TABLE "deletion_propagation_jobs" ("deletion_propagation_job_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "recording_session_id" uuid NOT NULL, "command_evidence" jsonb NOT NULL, "target_results" jsonb NOT NULL DEFAULT '[]', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "completed_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_9bd44566f42b2e93e09ea2168b8" PRIMARY KEY ("deletion_propagation_job_id"))`);
        await queryRunner.query(`CREATE TABLE "claimed_work_matches" ("claimed_work_match_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "rights_claim_id" uuid NOT NULL, "work_description" jsonb NOT NULL, "match_evidence" jsonb, "is_automated_match" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_a82cd6deb24a75b0509da2e9028" PRIMARY KEY ("claimed_work_match_id"))`);
        await queryRunner.query(`CREATE TABLE "claimant_authorities" ("claimant_authority_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "rights_claim_id" uuid NOT NULL, "claimant_ref" jsonb NOT NULL, "authority_evidence" jsonb NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_a0e37eae1752f3fcd26d2eeec1e" PRIMARY KEY ("claimant_authority_id"))`);
        await queryRunner.query(`CREATE TABLE "affected_assets" ("affected_asset_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "rights_claim_id" uuid NOT NULL, "asset_ref" jsonb NOT NULL, "rights_status_at_claim_time" character varying, CONSTRAINT "PK_57be894f8ddbdfd2520ffe0e22d" PRIMARY KEY ("affected_asset_id"))`);
        await queryRunner.query(`CREATE TABLE "requested_actions" ("requested_action_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "rights_claim_id" uuid NOT NULL, "action_kind" jsonb NOT NULL, "requested_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_6d7fc0b5246850f38d5a64ea5b7" PRIMARY KEY ("requested_action_id"))`);
        await queryRunner.query(`CREATE TABLE "claim_decisions" ("claim_decision_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "rights_claim_id" uuid NOT NULL, "review_factors" jsonb NOT NULL, "outcome" character varying NOT NULL, "reviewer_ref" jsonb NOT NULL, "decided_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_c0c8f07c0572de0413ad5a6f736" PRIMARY KEY ("claim_decision_id"))`);
        await queryRunner.query(`CREATE TABLE "counter_notices" ("counter_notice_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "rights_claim_id" uuid NOT NULL, "uploader_declaration" jsonb NOT NULL, "good_faith_declaration" jsonb NOT NULL, "clock_evidence" jsonb NOT NULL, "filed_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_34da6f9a4037025ee75216dae33" PRIMARY KEY ("counter_notice_id"))`);
        await queryRunner.query(`CREATE TABLE "appeals" ("appeal_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "rights_claim_id" uuid NOT NULL, "appellant_ref" jsonb NOT NULL, "grounds" jsonb NOT NULL, "filed_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "resolved_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_321a5ce4877cceb21240231ddf7" PRIMARY KEY ("appeal_id"))`);
        await queryRunner.query(`CREATE TABLE "restoration_actions" ("restoration_action_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "rights_claim_id" uuid NOT NULL, "evidence" jsonb NOT NULL, "financial_impact_note" jsonb, "restored_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_98701088ca2800fcaba27a8673b" PRIMARY KEY ("restoration_action_id"))`);
        await queryRunner.query(`CREATE TABLE "repeat_infringement_cases" ("repeat_infringement_case_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "uploader_ref" jsonb NOT NULL, "upheld_claim_refs" jsonb NOT NULL DEFAULT '[]', "scoring_factors" jsonb NOT NULL, "enforcement_response" jsonb, "opened_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "closed_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_509932b55d909ae2f7bc0d90832" PRIMARY KEY ("repeat_infringement_case_id"))`);
        await queryRunner.query(`ALTER TABLE "rights_claims" DROP COLUMN "automated_match_evidence"`);
        await queryRunner.query(`ALTER TABLE "rights_claims" DROP COLUMN "counter_notice"`);
        await queryRunner.query(`ALTER TABLE "rights_claims" DROP COLUMN "claimant_ref"`);
        await queryRunner.query(`ALTER TABLE "rights_claims" DROP COLUMN "authority_evidence"`);
        await queryRunner.query(`ALTER TABLE "rights_claims" DROP COLUMN "requested_action"`);
        await queryRunner.query(`ALTER TABLE "rights_claims" DROP COLUMN "claim_decision"`);
        await queryRunner.query(`ALTER TABLE "rights_claims" DROP COLUMN "affected_asset_ref"`);
        await queryRunner.query(`ALTER TABLE "rights_claims" DROP COLUMN "claimed_work_ref"`);
        await queryRunner.query(`ALTER TABLE "rights_claims" DROP COLUMN "appeal"`);
        await queryRunner.query(`ALTER TABLE "rights_claims" DROP COLUMN "repeat_infringement_case_ref"`);
        await queryRunner.query(`ALTER TABLE "rights_claims" DROP COLUMN "restoration_action"`);
        await queryRunner.query(`ALTER TABLE "recording_sessions" ADD "meeting_id" uuid`);
        await queryRunner.query(`ALTER TABLE "rights_claims" ADD "claimed_work_match_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "rights_claims" ADD "claimant_authority_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "rights_claims" ADD "affected_asset_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "rights_claims" ADD "requested_action_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "rights_claims" ADD "claim_decision_id" uuid`);
        await queryRunner.query(`ALTER TABLE "rights_claims" ADD "counter_notice_id" uuid`);
        await queryRunner.query(`ALTER TABLE "rights_claims" ADD "appeal_id" uuid`);
        await queryRunner.query(`ALTER TABLE "rights_claims" ADD "restoration_action_id" uuid`);
        await queryRunner.query(`ALTER TABLE "rights_claims" ADD "repeat_infringement_case_id" uuid`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "rights_claims" DROP COLUMN "repeat_infringement_case_id"`);
        await queryRunner.query(`ALTER TABLE "rights_claims" DROP COLUMN "restoration_action_id"`);
        await queryRunner.query(`ALTER TABLE "rights_claims" DROP COLUMN "appeal_id"`);
        await queryRunner.query(`ALTER TABLE "rights_claims" DROP COLUMN "counter_notice_id"`);
        await queryRunner.query(`ALTER TABLE "rights_claims" DROP COLUMN "claim_decision_id"`);
        await queryRunner.query(`ALTER TABLE "rights_claims" DROP COLUMN "requested_action_id"`);
        await queryRunner.query(`ALTER TABLE "rights_claims" DROP COLUMN "affected_asset_id"`);
        await queryRunner.query(`ALTER TABLE "rights_claims" DROP COLUMN "claimant_authority_id"`);
        await queryRunner.query(`ALTER TABLE "rights_claims" DROP COLUMN "claimed_work_match_id"`);
        await queryRunner.query(`ALTER TABLE "recording_sessions" DROP COLUMN "meeting_id"`);
        await queryRunner.query(`ALTER TABLE "rights_claims" ADD "restoration_action" jsonb`);
        await queryRunner.query(`ALTER TABLE "rights_claims" ADD "repeat_infringement_case_ref" jsonb`);
        await queryRunner.query(`ALTER TABLE "rights_claims" ADD "appeal" jsonb`);
        await queryRunner.query(`ALTER TABLE "rights_claims" ADD "claimed_work_ref" jsonb NOT NULL`);
        await queryRunner.query(`ALTER TABLE "rights_claims" ADD "affected_asset_ref" jsonb NOT NULL`);
        await queryRunner.query(`ALTER TABLE "rights_claims" ADD "claim_decision" jsonb`);
        await queryRunner.query(`ALTER TABLE "rights_claims" ADD "requested_action" jsonb NOT NULL`);
        await queryRunner.query(`ALTER TABLE "rights_claims" ADD "authority_evidence" jsonb NOT NULL`);
        await queryRunner.query(`ALTER TABLE "rights_claims" ADD "claimant_ref" jsonb NOT NULL`);
        await queryRunner.query(`ALTER TABLE "rights_claims" ADD "counter_notice" jsonb`);
        await queryRunner.query(`ALTER TABLE "rights_claims" ADD "automated_match_evidence" jsonb`);
        await queryRunner.query(`DROP TABLE "repeat_infringement_cases"`);
        await queryRunner.query(`DROP TABLE "restoration_actions"`);
        await queryRunner.query(`DROP TABLE "appeals"`);
        await queryRunner.query(`DROP TABLE "counter_notices"`);
        await queryRunner.query(`DROP TABLE "claim_decisions"`);
        await queryRunner.query(`DROP TABLE "requested_actions"`);
        await queryRunner.query(`DROP TABLE "affected_assets"`);
        await queryRunner.query(`DROP TABLE "claimant_authorities"`);
        await queryRunner.query(`DROP TABLE "claimed_work_matches"`);
        await queryRunner.query(`DROP TABLE "deletion_propagation_jobs"`);
        await queryRunner.query(`DROP TABLE "recording_cases"`);
        await queryRunner.query(`DROP TYPE "public"."recording_cases_case_type_enum"`);
        await queryRunner.query(`DROP TABLE "meeting_access_grants"`);
        await queryRunner.query(`DROP TYPE "public"."meeting_access_grants_resource_kind_enum"`);
        await queryRunner.query(`DROP TABLE "derived_artifacts"`);
        await queryRunner.query(`DROP TYPE "public"."derived_artifacts_artifact_kind_enum"`);
        await queryRunner.query(`DROP TABLE "speaker_labels"`);
        await queryRunner.query(`DROP TYPE "public"."speaker_labels_label_kind_enum"`);
        await queryRunner.query(`DROP TABLE "meeting_transcripts"`);
        await queryRunner.query(`DROP TABLE "raw_recordings"`);
        await queryRunner.query(`DROP TABLE "recording_segments"`);
        await queryRunner.query(`DROP TABLE "recording_permissions"`);
        await queryRunner.query(`DROP TABLE "participant_notices"`);
        await queryRunner.query(`DROP TABLE "participants"`);
        await queryRunner.query(`DROP TABLE "meetings"`);
        await queryRunner.query(`DROP TABLE "financial_credits"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d42ce4365d536533ace34d7c68"`);
        await queryRunner.query(`DROP TABLE "allowances"`);
        await queryRunner.query(`DROP TYPE "public"."allowances_overage_model_enum"`);
    }

}
