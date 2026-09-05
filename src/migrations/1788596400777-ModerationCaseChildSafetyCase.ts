import { MigrationInterface, QueryRunner } from "typeorm";

export class ModerationCaseChildSafetyCase1788596400777 implements MigrationInterface {
    name = 'ModerationCaseChildSafetyCase1788596400777'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // NOTE: typeorm's migration:generate diff tool repeatedly proposes dropping
        // "CHK_access_restrictions_precedence_1_or_2" (added via raw SQL in the
        // XD-007/008 migration, since TypeORM decorators can't express a literal-set
        // CHECK) because it is not part of any entity's TypeORM metadata. This is a
        // generator artifact, not a real schema change — the spurious DROP/ADD pair
        // has been manually removed here, same fix applied to every migration
        // generated since XD-007/008.
        await queryRunner.query(`CREATE TYPE "public"."moderation_cases_state_enum" AS ENUM('REPORTED_OR_DETECTED', 'CLASSIFICATION', 'AUTO_CONTAINED', 'MODERATOR_REVIEW', 'ACTION_PENDING_APPROVAL', 'ACTION_TAKEN', 'APPEAL_OPEN', 'MERGED_DUPLICATE', 'RESOLVED_NO_ACTION', 'RESOLVED_ACTION_TAKEN', 'RESOLVED_APPEAL_UPHELD')`);
        await queryRunner.query(`CREATE TABLE "moderation_cases" ("case_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "subject_ref" jsonb NOT NULL, "state" "public"."moderation_cases_state_enum" NOT NULL DEFAULT 'REPORTED_OR_DETECTED', "state_version" integer NOT NULL DEFAULT '0', "report_evidence_ref" jsonb NOT NULL, "classification" jsonb NOT NULL DEFAULT '{}', "child_safety_case_ref" uuid, "approval_ref" uuid, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "closed_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_36a0f46cf4fc160b118c8d1a1f3" PRIMARY KEY ("case_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."child_safety_cases_state_enum" AS ENUM('REPORTED_OR_DETECTED', 'AUTO_CONTAINED', 'SPECIALIST_TRIAGE', 'JURISDICTION_ROUTING', 'ACTION_AND_REPORTING', 'ONGOING_PRESERVATION', 'RESOLVED', 'IMMINENT_DANGER', 'LIKELY_FALSE_POSITIVE_REVIEW', 'INSUFFICIENT_EVIDENCE', 'AUTHORITY_PENDING', 'DUPLICATE', 'SPECIALIST_TRANSFER', 'RESTRICTED_HOLD')`);
        await queryRunner.query(`CREATE TABLE "child_safety_cases" ("case_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "subject_ref" jsonb NOT NULL, "state" "public"."child_safety_cases_state_enum" NOT NULL DEFAULT 'REPORTED_OR_DETECTED', "state_version" integer NOT NULL DEFAULT '0', "detection_signal_type" character varying NOT NULL, "containment_at" TIMESTAMP WITH TIME ZONE, "specialist_access_grants" jsonb NOT NULL DEFAULT '[]', "jurisdictional_registry_version" character varying, "reporting_obligation_evidence" jsonb, "preservation_retention_basis" character varying, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_f176eeda7a54238724233ec4dc1" PRIMARY KEY ("case_id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "child_safety_cases"`);
        await queryRunner.query(`DROP TYPE "public"."child_safety_cases_state_enum"`);
        await queryRunner.query(`DROP TABLE "moderation_cases"`);
        await queryRunner.query(`DROP TYPE "public"."moderation_cases_state_enum"`);
        // spurious ADD CONSTRAINT counterpart removed — see note in up() above.
    }

}
