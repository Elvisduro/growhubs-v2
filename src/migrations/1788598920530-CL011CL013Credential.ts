import { MigrationInterface, QueryRunner } from "typeorm";

export class CL011CL013Credential1788598920530 implements MigrationInterface {
    name = 'CL011CL013Credential1788598920530'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // NOTE: migration:generate's diff repeatedly proposes dropping
        // "CHK_access_restrictions_precedence_1_or_2" (hand-written raw SQL in
        // the XD-007/008 migration, not part of any entity's TypeORM metadata) —
        // a generator artifact, not a real schema change. Spurious DROP/ADD pair
        // removed here, same fix applied to every migration since XD-007/008.
        await queryRunner.query(`CREATE TYPE "public"."credentials_state_enum" AS ENUM('PENDING_ISSUANCE', 'CRITERIA_NOT_MET', 'ISSUED', 'DISPUTED', 'CORRECTED', 'REVOKED', 'EXPIRED', 'ARCHIVED')`);
        await queryRunner.query(`CREATE TYPE "public"."credentials_action_ground_enum" AS ENUM('UNMET_CRITERIA_POST_ISSUANCE', 'PROVEN_INTEGRITY_OR_IDENTITY_ISSUE', 'ISSUER_ERROR_OR_DUPLICATE', 'LEGAL_OR_SAFETY_DECISION')`);
        await queryRunner.query(`CREATE TABLE "credentials" ("credential_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "person_ref" jsonb NOT NULL, "credential_type_ref" jsonb NOT NULL, "completion_snapshot_ref" jsonb, "state" "public"."credentials_state_enum" NOT NULL DEFAULT 'PENDING_ISSUANCE', "state_version" integer NOT NULL DEFAULT '0', "action_ground" "public"."credentials_action_ground_enum", "dispute_case_ref" jsonb, "supersedes_credential_id" uuid, "expires_at" TIMESTAMP WITH TIME ZONE, "issued_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_deddc3fc8fa9227193e910b0c39" PRIMARY KEY ("credential_id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "credentials"`);
        await queryRunner.query(`DROP TYPE "public"."credentials_action_ground_enum"`);
        await queryRunner.query(`DROP TYPE "public"."credentials_state_enum"`);
        // spurious ADD CONSTRAINT counterpart removed — see note in up() above.
    }

}
