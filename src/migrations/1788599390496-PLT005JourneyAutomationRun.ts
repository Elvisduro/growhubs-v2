import { MigrationInterface, QueryRunner } from "typeorm";

export class PLT005JourneyAutomationRun1788599390496 implements MigrationInterface {
    name = 'PLT005JourneyAutomationRun1788599390496'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // NOTE: migration:generate's diff repeatedly proposes dropping
        // "CHK_access_restrictions_precedence_1_or_2" (hand-written raw SQL in
        // the XD-007/008 migration, not part of any entity's TypeORM metadata) —
        // a generator artifact, not a real schema change. Spurious DROP/ADD pair
        // removed here, same fix applied to every migration since XD-007/008.
        await queryRunner.query(`CREATE TYPE "public"."journey_automation_runs_state_enum" AS ENUM('created', 'running', 'paused', 'completed', 'cancelled', 'failed')`);
        await queryRunner.query(`CREATE TABLE "journey_automation_runs" ("run_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "definition_ref" jsonb NOT NULL, "definition_version_pinned" integer NOT NULL, "subject_ref" jsonb NOT NULL, "state" "public"."journey_automation_runs_state_enum" NOT NULL DEFAULT 'created', "state_version" integer NOT NULL DEFAULT '0', "step_position" jsonb, "step_log" jsonb NOT NULL DEFAULT '[]', "failure_reason" jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "ended_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_77b5bb57313cade53de840e6615" PRIMARY KEY ("run_id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "journey_automation_runs"`);
        await queryRunner.query(`DROP TYPE "public"."journey_automation_runs_state_enum"`);
        // spurious ADD CONSTRAINT counterpart removed — see note in up() above.
    }

}
