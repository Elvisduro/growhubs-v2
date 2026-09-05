import { MigrationInterface, QueryRunner } from "typeorm";

export class TV012TorvetProjectionStateCorrection1788600087412 implements MigrationInterface {
    name = 'TV012TorvetProjectionStateCorrection1788600087412'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // NOTE: migration:generate's diff repeatedly proposes dropping the
        // hand-written raw-SQL CHECK constraint CHK_access_restrictions_precedence_1_or_2
        // (it isn't part of TypeORM entity metadata, so the generator always
        // sees it as a phantom removal) — a generator artifact, not a real
        // schema change. Spurious DROP/ADD pair removed here, same fix
        // applied to every migration since XD-007/008.
        await queryRunner.query(`ALTER TABLE "torvet_projections" ADD "archived_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TYPE "public"."torvet_projections_freshness_state_enum" ADD VALUE 'SOURCE_UNAVAILABLE'`);
        await queryRunner.query(`ALTER TYPE "public"."torvet_projections_freshness_state_enum" ADD VALUE 'ARCHIVED'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."torvet_projections_freshness_state_enum_old" AS ENUM('DRAFT', 'SYNCING', 'FRESH', 'AGING', 'STALE', 'RESTRICTED', 'REFRESHING')`);
        await queryRunner.query(`ALTER TABLE "torvet_projections" ALTER COLUMN "freshness_state" TYPE "public"."torvet_projections_freshness_state_enum_old" USING "freshness_state"::"text"::"public"."torvet_projections_freshness_state_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."torvet_projections_freshness_state_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."torvet_projections_freshness_state_enum_old" RENAME TO "torvet_projections_freshness_state_enum"`);
        await queryRunner.query(`ALTER TABLE "torvet_projections" DROP COLUMN "archived_at"`);
        // Spurious ADD CONSTRAINT removed here (see up() note) — the
        // CHK_access_restrictions_precedence_1_or_2 constraint was never
        // actually dropped, so it must not be re-added.
    }

}
