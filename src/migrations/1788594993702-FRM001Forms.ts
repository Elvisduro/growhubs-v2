import { MigrationInterface, QueryRunner } from "typeorm";

export class FRM001Forms1788594993702 implements MigrationInterface {
    name = 'FRM001Forms1788594993702'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // NOTE: typeorm's migration:generate wrongly proposed dropping
        // access_restrictions' CHK_access_restrictions_precedence_1_or_2 here
        // — that CHECK constraint (added by hand in the XD-007/XD-008
        // migration, since TypeORM decorators can't express it) isn't part
        // of any entity's metadata, so the generator's DB-vs-entities diff
        // sees it as "extra" and wants it gone. It is NOT related to
        // FRM-001 and must be left alone — the drop line has been removed
        // from this migration.
        await queryRunner.query(`CREATE TYPE "public"."form_definitions_purpose_enum" AS ENUM('LEAD', 'NEWSLETTER', 'CONTACT', 'SERVICE', 'BOOKING', 'COURSE', 'COMMUNITY', 'EVENT', 'WAITLIST', 'JOB', 'PARTNER', 'CO_SELL', 'SUPPORT', 'ONBOARDING', 'FEEDBACK', 'TESTIMONIAL', 'EVIDENCE', 'INTERNAL', 'ORGANIZATION_INTAKE')`);
        await queryRunner.query(`CREATE TYPE "public"."form_definitions_lifecycle_state_enum" AS ENUM('DRAFT', 'REVIEW', 'PUBLISHED', 'PAUSED', 'RETIRED', 'ARCHIVED')`);
        await queryRunner.query(`CREATE TABLE "form_definitions" ("form_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenant_id" uuid NOT NULL, "purpose" "public"."form_definitions_purpose_enum" NOT NULL, "domain_type" character varying NOT NULL, "identity_mode_policy" jsonb NOT NULL DEFAULT '{}', "retention_policy_ref" character varying, "lifecycle_state" "public"."form_definitions_lifecycle_state_enum" NOT NULL DEFAULT 'DRAFT', CONSTRAINT "PK_622933e08b1d2931afbf5cb8172" PRIMARY KEY ("form_id"))`);
        await queryRunner.query(`CREATE TABLE "form_versions" ("form_version_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "form_id" uuid NOT NULL, "version_number" integer NOT NULL, "schema_snapshot" jsonb NOT NULL, "effective_from" TIMESTAMP WITH TIME ZONE NOT NULL, "published_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_46aae66a0eb09b355b04302df72" PRIMARY KEY ("form_version_id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_cdc3c166b14afa51ceac7f525b" ON "form_versions"  ("form_id", "version_number") `);
        await queryRunner.query(`CREATE TABLE "field_definitions" ("field_id" uuid NOT NULL, "form_version_id" uuid NOT NULL, "field_type" character varying NOT NULL, "sensitivity_tag" character varying NOT NULL, "semantic_mapping_key" character varying, CONSTRAINT "PK_1b12c4e82848d73ba5e6a4a184f" PRIMARY KEY ("field_id", "form_version_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."submissions_identity_mode_enum" AS ENUM('ANONYMOUS', 'PSEUDONYMOUS', 'AUTHENTICATED', 'INVITED', 'TENANT_MEMBER', 'APPLICANT', 'GUARDIAN_REPRESENTATIVE', 'FEDERATED')`);
        await queryRunner.query(`CREATE TYPE "public"."submissions_state_enum" AS ENUM('STARTED', 'PARTIAL_SAVED', 'VALIDATING', 'SUBMITTED', 'PROCESSING', 'ACCEPTED', 'ROUTED', 'COMPLETED')`);
        await queryRunner.query(`CREATE TABLE "submissions" ("submission_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "form_version_id" uuid NOT NULL, "identity_mode" "public"."submissions_identity_mode_enum" NOT NULL, "source_context" jsonb NOT NULL DEFAULT '{}', "state" "public"."submissions_state_enum" NOT NULL DEFAULT 'STARTED', "state_version" integer NOT NULL DEFAULT '0', "risk_flags" jsonb NOT NULL DEFAULT '{}', "idempotency_key" character varying NOT NULL, "consent_receipt_ids" jsonb NOT NULL DEFAULT '[]', CONSTRAINT "UQ_15649cedf148fb846c9727f9255" UNIQUE ("idempotency_key"), CONSTRAINT "PK_9d2b514f747142635edb10c1d3d" PRIMARY KEY ("submission_id"))`);
        await queryRunner.query(`CREATE TABLE "response_values" ("response_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "submission_id" uuid NOT NULL, "field_id" uuid NOT NULL, "form_version_id" uuid NOT NULL, "value" jsonb NOT NULL, CONSTRAINT "PK_026e749e1a496c030995e4f1680" PRIMARY KEY ("response_id"))`);
        await queryRunner.query(`CREATE TABLE "consent_receipts" ("consent_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "subject_person_id" uuid, "purpose" character varying NOT NULL, "controller" character varying NOT NULL, "channel" character varying NOT NULL, "data_categories" jsonb NOT NULL DEFAULT '[]', "recipient" character varying, "consent_text" character varying NOT NULL, "consent_text_version" character varying NOT NULL, "age_guardian_context" jsonb, "guardian_person_id" uuid, "given_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "source_context" jsonb NOT NULL DEFAULT '{}', "expires_at" TIMESTAMP WITH TIME ZONE, "withdrawn_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_95597c3641c85b540b27f525e45" PRIMARY KEY ("consent_id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "consent_receipts"`);
        await queryRunner.query(`DROP TABLE "response_values"`);
        await queryRunner.query(`DROP TABLE "submissions"`);
        await queryRunner.query(`DROP TYPE "public"."submissions_state_enum"`);
        await queryRunner.query(`DROP TYPE "public"."submissions_identity_mode_enum"`);
        await queryRunner.query(`DROP TABLE "field_definitions"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cdc3c166b14afa51ceac7f525b"`);
        await queryRunner.query(`DROP TABLE "form_versions"`);
        await queryRunner.query(`DROP TABLE "form_definitions"`);
        await queryRunner.query(`DROP TYPE "public"."form_definitions_lifecycle_state_enum"`);
        await queryRunner.query(`DROP TYPE "public"."form_definitions_purpose_enum"`);
        // (see matching note in up()) — nothing to restore here since up()
        // never dropped the CHECK constraint in the first place.
    }

}
