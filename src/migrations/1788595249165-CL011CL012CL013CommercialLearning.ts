import { MigrationInterface, QueryRunner } from "typeorm";

export class CL011CL012CL013CommercialLearning1788595249165 implements MigrationInterface {
    name = 'CL011CL012CL013CommercialLearning1788595249165'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // NOTE: same generator quirk documented in FRM001Forms's migration —
        // typeorm's migration:generate again proposed dropping
        // access_restrictions' hand-written CHECK constraint because it
        // isn't part of any entity's metadata. Left alone; the drop line
        // has been removed.
        await queryRunner.query(`CREATE TABLE "learning_commercial_policy_snapshots" ("snapshot_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "enrollment_id" uuid NOT NULL, "offer_ref" character varying, "order_ref" character varying, "mor_ref" character varying, "terms" jsonb NOT NULL, "captured_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_e6ca7285806c4e934efd0e66b01" PRIMARY KEY ("snapshot_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."commercial_learning_cases_trigger_kind_enum" AS ENUM('DUPLICATE', 'CANCELLATION', 'WITHDRAWAL', 'GOODWILL', 'PARTIAL', 'SELLER_FAILURE', 'PLATFORM_FAILURE', 'SUBSCRIPTION_DEFAULT', 'INSTALMENT_DEFAULT', 'FRAUD', 'CHARGEBACK', 'SPONSOR', 'PLAN', 'SCHOLARSHIP', 'BILLING', 'SAFETY')`);
        await queryRunner.query(`CREATE TABLE "commercial_learning_cases" ("case_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "trigger_kind" "public"."commercial_learning_cases_trigger_kind_enum" NOT NULL, "finance_event_ref" character varying NOT NULL, "entitlement_ref" character varying NOT NULL, "enrollment_ref" uuid NOT NULL, "learning_state_snapshot" jsonb NOT NULL, "policy_snapshot_ref" uuid NOT NULL, "proposed_consequences" jsonb NOT NULL, "approvals" jsonb NOT NULL DEFAULT '[]', "notices" jsonb NOT NULL DEFAULT '{}', "appeal" jsonb, "resolution" jsonb, CONSTRAINT "PK_728d93d4120010052d0f572fd54" PRIMARY KEY ("case_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."learning_assignments_required_status_enum" AS ENUM('REQUIRED', 'OPTIONAL')`);
        await queryRunner.query(`CREATE TYPE "public"."learning_assignments_state_enum" AS ENUM('DRAFT', 'ASSIGNED', 'NOTIFIED', 'ACKNOWLEDGED', 'ACTIVATED', 'SATISFIED', 'CLOSED')`);
        await queryRunner.query(`CREATE TABLE "learning_assignments" ("assignment_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenant_id" uuid NOT NULL, "assignee_ref" jsonb NOT NULL, "target_ref" jsonb NOT NULL, "assigner_ref" character varying NOT NULL, "reason" character varying NOT NULL, "required_status" "public"."learning_assignments_required_status_enum" NOT NULL, "policy" jsonb NOT NULL, "state" "public"."learning_assignments_state_enum" NOT NULL DEFAULT 'DRAFT', "state_version" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_1581d7d1c2a7aa203bb8328b401" PRIMARY KEY ("assignment_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."enrollments_state_enum" AS ENUM('INVITED', 'ELIGIBILITY', 'ENROLLED', 'ACTIVE', 'COMPLETION_REVIEW', 'COMPLETED', 'ARCHIVED')`);
        await queryRunner.query(`CREATE TABLE "enrollments" ("enrollment_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "person_id" uuid NOT NULL, "tenant_id" uuid NOT NULL, "target_ref" jsonb NOT NULL, "cohort_ref" character varying, "source" character varying NOT NULL, "related_snapshot" jsonb NOT NULL, "state" "public"."enrollments_state_enum" NOT NULL DEFAULT 'INVITED', "state_version" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_3e9102cadbf8e3aaabc5acc6042" PRIMARY KEY ("enrollment_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."programme_registrations_state_enum" AS ENUM('APPLICATION', 'REVIEW', 'OFFER', 'ACCEPTANCE', 'CONVERTED')`);
        await queryRunner.query(`CREATE TABLE "programme_registrations" ("registration_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "person_id" uuid NOT NULL, "tenant_id" uuid NOT NULL, "programme_ref" character varying NOT NULL, "state" "public"."programme_registrations_state_enum" NOT NULL DEFAULT 'APPLICATION', CONSTRAINT "PK_c49942e4e9ddbe24984cef5fbc6" PRIMARY KEY ("registration_id"))`);
        await queryRunner.query(`CREATE TABLE "learning_progress" ("progress_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "person_id" uuid NOT NULL, "enrollment_id" uuid NOT NULL, "progress_snapshot" jsonb NOT NULL, "computed_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL DEFAULT '1', CONSTRAINT "PK_65907325bcce3d6d5922d1806e7" PRIMARY KEY ("progress_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."compliance_evaluations_state_enum" AS ENUM('NOT_APPLICABLE', 'NOT_ASSIGNED', 'ASSIGNED_NOT_STARTED', 'IN_PROGRESS_ON_TRACK', 'IN_PROGRESS_AT_RISK', 'OVERDUE_INCOMPLETE', 'COMPLETION_REVIEW', 'COMPLETED_COMPLIANT', 'COMPLETED_LATE', 'EXEMPTED', 'WAIVED', 'NON_COMPLIANT', 'DISPUTED', 'UNKNOWN_INCOMPLETE_DATA')`);
        await queryRunner.query(`CREATE TABLE "compliance_evaluations" ("evaluation_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "assignment_id" uuid NOT NULL, "enrollment_id" uuid NOT NULL, "state" "public"."compliance_evaluations_state_enum" NOT NULL, "policy_snapshot_ref" uuid NOT NULL, "derivation_inputs" jsonb NOT NULL, CONSTRAINT "PK_de2b3c201977e360c4e2238e8d3" PRIMARY KEY ("evaluation_id"))`);
        await queryRunner.query(`CREATE TABLE "compliance_policy_snapshots" ("snapshot_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenant_id" uuid NOT NULL, "scope_ref" jsonb NOT NULL, "terms" jsonb NOT NULL, "captured_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_4e072b026348996d6a74f0d5a01" PRIMARY KEY ("snapshot_id"))`);
        await queryRunner.query(`CREATE TABLE "learner_records" ("learner_record_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "person_id" uuid NOT NULL, "indexed_refs" jsonb NOT NULL DEFAULT '{}', CONSTRAINT "UQ_dc77ff82941749f19fbef0a9612" UNIQUE ("person_id"), CONSTRAINT "PK_7a0f84d14794068b6a0c4c6f2b3" PRIMARY KEY ("learner_record_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."projected_learning_facts_verification_status_enum" AS ENUM('SELF_DECLARED', 'ISSUER_VERIFIED', 'PLATFORM_VERIFIED', 'EXTERNALLY_VERIFIED', 'DISPUTED', 'EXPIRED', 'REVOKED')`);
        await queryRunner.query(`CREATE TYPE "public"."projected_learning_facts_correction_revocation_status_enum" AS ENUM('ACTIVE', 'CORRECTED', 'REVOKED')`);
        await queryRunner.query(`CREATE TABLE "projected_learning_facts" ("fact_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "subject_person_id" uuid NOT NULL, "fact_type" character varying NOT NULL, "source_object_ref" jsonb NOT NULL, "issuer_authority_ref" character varying NOT NULL, "tenant_id" uuid NOT NULL, "programme_course_delivery_ref" jsonb NOT NULL, "occurred_at" TIMESTAMP WITH TIME ZONE NOT NULL, "effective_at" TIMESTAMP WITH TIME ZONE NOT NULL, "version" integer NOT NULL DEFAULT '1', "evidence_refs" jsonb NOT NULL, "verification_status" "public"."projected_learning_facts_verification_status_enum" NOT NULL, "visibility_policy" jsonb NOT NULL, "retention_class" character varying NOT NULL, "correction_revocation_status" "public"."projected_learning_facts_correction_revocation_status_enum" NOT NULL DEFAULT 'ACTIVE', CONSTRAINT "PK_bd6d3239bb6d0a7f489d585df32" PRIMARY KEY ("fact_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."transcripts_state_enum" AS ENUM('OFFICIAL', 'PROVISIONAL', 'CORRECTED', 'REVOKED')`);
        await queryRunner.query(`CREATE TABLE "transcripts" ("transcript_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "person_id" uuid NOT NULL, "issuer_ref" character varying NOT NULL, "content" jsonb NOT NULL, "state" "public"."transcripts_state_enum" NOT NULL, "version" integer NOT NULL DEFAULT '1', "digital_signature" character varying, CONSTRAINT "PK_2b853a2e100e087b8f7eff2dfee" PRIMARY KEY ("transcript_id"))`);
        await queryRunner.query(`CREATE TABLE "portfolios" ("portfolio_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "person_id" uuid NOT NULL, "items" jsonb NOT NULL DEFAULT '[]', "disclosure_settings" jsonb NOT NULL DEFAULT '{}', CONSTRAINT "PK_9303b853b1d0672da696dc70a10" PRIMARY KEY ("portfolio_id"))`);
        await queryRunner.query(`CREATE TABLE "learning_passports" ("passport_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "person_id" uuid NOT NULL, "aggregated_fact_refs" jsonb NOT NULL DEFAULT '[]', CONSTRAINT "UQ_d23e9c7d239d7567323dc0fc999" UNIQUE ("person_id"), CONSTRAINT "PK_c7e4309bc948e2ec27f6be134c6" PRIMARY KEY ("passport_id"))`);
        await queryRunner.query(`CREATE TABLE "learner_profiles" ("profile_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "person_id" uuid NOT NULL, "visible_fact_refs" jsonb NOT NULL DEFAULT '[]', CONSTRAINT "UQ_aa3ddf58021b5808d8ea5974f46" UNIQUE ("person_id"), CONSTRAINT "PK_4fd0f1c390e79d0bc6e3c5d7adf" PRIMARY KEY ("profile_id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "learner_profiles"`);
        await queryRunner.query(`DROP TABLE "learning_passports"`);
        await queryRunner.query(`DROP TABLE "portfolios"`);
        await queryRunner.query(`DROP TABLE "transcripts"`);
        await queryRunner.query(`DROP TYPE "public"."transcripts_state_enum"`);
        await queryRunner.query(`DROP TABLE "projected_learning_facts"`);
        await queryRunner.query(`DROP TYPE "public"."projected_learning_facts_correction_revocation_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."projected_learning_facts_verification_status_enum"`);
        await queryRunner.query(`DROP TABLE "learner_records"`);
        await queryRunner.query(`DROP TABLE "compliance_policy_snapshots"`);
        await queryRunner.query(`DROP TABLE "compliance_evaluations"`);
        await queryRunner.query(`DROP TYPE "public"."compliance_evaluations_state_enum"`);
        await queryRunner.query(`DROP TABLE "learning_progress"`);
        await queryRunner.query(`DROP TABLE "programme_registrations"`);
        await queryRunner.query(`DROP TYPE "public"."programme_registrations_state_enum"`);
        await queryRunner.query(`DROP TABLE "enrollments"`);
        await queryRunner.query(`DROP TYPE "public"."enrollments_state_enum"`);
        await queryRunner.query(`DROP TABLE "learning_assignments"`);
        await queryRunner.query(`DROP TYPE "public"."learning_assignments_state_enum"`);
        await queryRunner.query(`DROP TYPE "public"."learning_assignments_required_status_enum"`);
        await queryRunner.query(`DROP TABLE "commercial_learning_cases"`);
        await queryRunner.query(`DROP TYPE "public"."commercial_learning_cases_trigger_kind_enum"`);
        await queryRunner.query(`DROP TABLE "learning_commercial_policy_snapshots"`);
        // (see matching note in up())
    }

}
