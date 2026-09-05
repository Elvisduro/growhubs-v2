import { MigrationInterface, QueryRunner } from "typeorm";

export class PLT005SupportCase1788598795289 implements MigrationInterface {
    name = 'PLT005SupportCase1788598795289'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // NOTE: migration:generate's diff repeatedly proposes dropping
        // "CHK_access_restrictions_precedence_1_or_2" (hand-written raw SQL in
        // the XD-007/008 migration, not part of any entity's TypeORM metadata) —
        // a generator artifact, not a real schema change. Spurious DROP/ADD pair
        // removed here, same fix applied to every migration since XD-007/008.
        await queryRunner.query(`CREATE TYPE "public"."support_cases_state_enum" AS ENUM('SUBMITTED', 'TRIAGE', 'AI_ASSISTED', 'AWAITING_REQUESTER_CONFIRMATION', 'QUEUED_FOR_HUMAN', 'WITH_HUMAN_AGENT', 'PENDING_REQUESTER_INFO', 'PENDING_INTERNAL_DEPENDENCY', 'RESOLVED_PENDING_CLOSE', 'RESOLVED_CLOSED', 'CLOSED_NO_RESPONSE', 'WITHDRAWN_BY_REQUESTER', 'MERGED_INTO_OTHER_CASE', 'ESCALATED_TO_INCIDENT', 'REOPENED')`);
        await queryRunner.query(`CREATE TYPE "public"."support_cases_closure_authority_enum" AS ENUM('REQUESTER_CONFIRMATION', 'HUMAN_AGENT_ACTION', 'AUTHORIZED_AUTOMATED_CLOSURE_POLICY')`);
        await queryRunner.query(`CREATE TABLE "support_cases" ("case_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "support_surface" character varying NOT NULL, "requester_ref" jsonb NOT NULL, "account_context_ref" jsonb NOT NULL, "state" "public"."support_cases_state_enum" NOT NULL DEFAULT 'SUBMITTED', "state_version" integer NOT NULL DEFAULT '0', "category" character varying, "priority" character varying, "attached_answers" jsonb NOT NULL DEFAULT '[]', "closure_authority" "public"."support_cases_closure_authority_enum", "closure_policy_version" character varying, "linked_ref" jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "closed_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_62ae8ab5f1e67df8a9a1954fe6b" PRIMARY KEY ("case_id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "support_cases"`);
        await queryRunner.query(`DROP TYPE "public"."support_cases_closure_authority_enum"`);
        await queryRunner.query(`DROP TYPE "public"."support_cases_state_enum"`);
        // spurious ADD CONSTRAINT counterpart removed — see note in up() above.
    }

}
