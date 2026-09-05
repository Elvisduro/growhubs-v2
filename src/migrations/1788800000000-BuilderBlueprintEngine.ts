import { MigrationInterface, QueryRunner } from "typeorm";

export class BuilderBlueprintEngine1788800000000 implements MigrationInterface {
    name = 'BuilderBlueprintEngine1788800000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // NOTE: migration:generate's diff repeatedly proposes dropping
        // "CHK_access_restrictions_precedence_1_or_2" and re-adding it
        // unchanged — a generator artifact (the hand-written raw-SQL CHECK
        // constraint isn't part of TypeORM entity metadata), not a real
        // schema change. Spurious DROP/ADD pair removed here, same fix
        // applied to every migration since XD-007/008.
        //
        // NOTE 2: the generator also proposed re-setting
        // "allowances"."thresholds_percent"'s default from '[50,75,90,100]'
        // to the same array with different JSON whitespace
        // ('[50, 75, 90, 100]') — an artifact of how Postgres echoes back
        // jsonb-array defaults vs. the entity's literal string, not an
        // actual value change. Removed here for the same reason as the
        // CHECK-constraint artifact above.
        await queryRunner.query(`CREATE TYPE "public"."blueprint_definitions_lifecycle_state_enum" AS ENUM('DRAFT', 'REVIEW', 'PUBLISHED', 'PAUSED', 'RETIRED', 'ARCHIVED')`);
        await queryRunner.query(`CREATE TABLE "blueprint_definitions" ("blueprint_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenant_id" uuid NOT NULL, "blueprint_type" character varying NOT NULL, "name" character varying NOT NULL, "owner_ref" jsonb NOT NULL, "lifecycle_state" "public"."blueprint_definitions_lifecycle_state_enum" NOT NULL DEFAULT 'DRAFT', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_3ba488b8252734117ea058b1456" PRIMARY KEY ("blueprint_id"))`);
        await queryRunner.query(`CREATE TABLE "blueprint_versions" ("blueprint_version_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "blueprint_id" uuid NOT NULL, "version_number" integer NOT NULL, "schema_snapshot" jsonb NOT NULL, "render_contract" jsonb NOT NULL, "effective_from" TIMESTAMP WITH TIME ZONE NOT NULL, "published_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_54c7a41e801044be6d2b6b4bcab" PRIMARY KEY ("blueprint_version_id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_c3d55d53223c8d938eff416dfa" ON "blueprint_versions"  ("blueprint_id", "version_number") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_c3d55d53223c8d938eff416dfa"`);
        await queryRunner.query(`DROP TABLE "blueprint_versions"`);
        await queryRunner.query(`DROP TABLE "blueprint_definitions"`);
        await queryRunner.query(`DROP TYPE "public"."blueprint_definitions_lifecycle_state_enum"`);
    }

}
