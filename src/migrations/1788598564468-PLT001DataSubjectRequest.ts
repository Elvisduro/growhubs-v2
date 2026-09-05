import { MigrationInterface, QueryRunner } from "typeorm";

export class PLT001DataSubjectRequest1788598564468 implements MigrationInterface {
    name = 'PLT001DataSubjectRequest1788598564468'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // NOTE: migration:generate's diff repeatedly proposes dropping
        // "CHK_access_restrictions_precedence_1_or_2" (hand-written raw SQL in
        // the XD-007/008 migration, not part of any entity's TypeORM metadata) —
        // a generator artifact, not a real schema change. Spurious DROP/ADD pair
        // removed here, same fix applied to every migration since XD-007/008.
        await queryRunner.query(`CREATE TYPE "public"."data_subject_requests_kind_enum" AS ENUM('ACCESS', 'CORRECTION', 'DELETION', 'RESTRICTION', 'OBJECTION', 'CONSENT_WITHDRAWAL', 'PORTABILITY', 'EXPLANATION', 'ACCOUNT_CLOSURE')`);
        await queryRunner.query(`CREATE TYPE "public"."data_subject_requests_state_enum" AS ENUM('RECEIVED', 'IDENTITY_VERIFICATION', 'NEEDS_INFORMATION', 'SCOPING', 'IN_REVIEW', 'RESTRICTED_BY_LEGAL_HOLD', 'ACTION_REQUIRED', 'PROPAGATING', 'PARTIALLY_COMPLETED', 'APPEALED', 'COMPLETED', 'DECLINED_WITH_REASON', 'CANCELLED_BY_REQUESTER')`);
        await queryRunner.query(`CREATE TABLE "data_subject_requests" ("request_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "subject_ref" jsonb NOT NULL, "requester_ref" jsonb NOT NULL, "kind" "public"."data_subject_requests_kind_enum" NOT NULL, "state" "public"."data_subject_requests_state_enum" NOT NULL DEFAULT 'RECEIVED', "state_version" integer NOT NULL DEFAULT '0', "intake_channel" character varying NOT NULL, "deadline_at" TIMESTAMP WITH TIME ZONE, "class_determinations" jsonb NOT NULL DEFAULT '[]', "decision_reason" jsonb, "appeal_record" jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "completed_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_caf67b8cb15fc93dbfd24e09a9c" PRIMARY KEY ("request_id"))`);
        await queryRunner.query(`CREATE TABLE "legal_holds" ("hold_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "authority_ref" jsonb NOT NULL, "scope" jsonb NOT NULL, "reason_basis" jsonb NOT NULL, "placed_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "review_or_expiry_at" TIMESTAMP WITH TIME ZONE NOT NULL, "released_at" TIMESTAMP WITH TIME ZONE, "release_authority_ref" jsonb, "version" integer NOT NULL DEFAULT '1', CONSTRAINT "PK_bac5d773b0e7c34bec6030c3d08" PRIMARY KEY ("hold_id"))`);
        await queryRunner.query(`CREATE TABLE "deletion_propagation_plans" ("plan_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "request_id" uuid NOT NULL, "version" integer NOT NULL DEFAULT '1', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_72d100e9a67895ad1d4ef82640b" PRIMARY KEY ("plan_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."propagation_targets_outcome_enum" AS ENUM('DELETED', 'ANONYMISED', 'RESTRICTED', 'RETAINED_WITH_BASIS', 'PROVIDER_PENDING', 'OUTSIDE_PLATFORM_CONTROL')`);
        await queryRunner.query(`CREATE TABLE "propagation_targets" ("target_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "plan_id" uuid NOT NULL, "domain_name" character varying NOT NULL, "object_ref" jsonb NOT NULL, "outcome" "public"."propagation_targets_outcome_enum", "retention_basis_ref" jsonb, "idempotency_key" character varying NOT NULL, "attempted_at" TIMESTAMP WITH TIME ZONE, "resolved_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_d43b9e5f2c046b88b0930510f34" PRIMARY KEY ("target_id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "propagation_targets"`);
        await queryRunner.query(`DROP TYPE "public"."propagation_targets_outcome_enum"`);
        await queryRunner.query(`DROP TABLE "deletion_propagation_plans"`);
        await queryRunner.query(`DROP TABLE "legal_holds"`);
        await queryRunner.query(`DROP TABLE "data_subject_requests"`);
        await queryRunner.query(`DROP TYPE "public"."data_subject_requests_state_enum"`);
        await queryRunner.query(`DROP TYPE "public"."data_subject_requests_kind_enum"`);
        // spurious ADD CONSTRAINT counterpart removed — see note in up() above.
    }

}
