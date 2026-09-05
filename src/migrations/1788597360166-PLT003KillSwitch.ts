import { MigrationInterface, QueryRunner } from "typeorm";

export class PLT003KillSwitch1788597360166 implements MigrationInterface {
    name = 'PLT003KillSwitch1788597360166'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // NOTE: migration:generate's diff repeatedly proposes dropping
        // "CHK_access_restrictions_precedence_1_or_2" (hand-written raw SQL in
        // the XD-007/008 migration, not part of any entity's TypeORM metadata) —
        // a generator artifact, not a real schema change. Spurious DROP/ADD pair
        // removed here, same fix applied to every migration since XD-007/008.
        await queryRunner.query(`CREATE TYPE "public"."kill_switch_definitions_family_enum" AS ENUM('AI', 'PAYMENTS_CHECKOUT_REFUND_PAYOUT_SETTLEMENT_POINTS', 'ACCESS_GRANTS_INVITATIONS_MINORS_CREDENTIAL_ISSUANCE', 'MARKETING_AND_TRANSACTIONAL_COMMUNICATION_MESSAGING', 'TORVET_EXTERNAL_DSP_SEARCH_CTA_DISTRIBUTION', 'UPLOAD_LIVE_RECORDING_TRANSCRIPTION_PLAYBACK', 'CONNECTORS_WEBHOOKS_IMPORT_EXPORT_B2BUILD_FEDERATION', 'TORVET_LISTING_RANKING_PLACEMENT_WORK', 'GRANULAR_TENANT_CAPABILITIES', 'WHITE_LABEL_DOMAIN_APP_RELEASE_DEPLOYMENT')`);
        await queryRunner.query(`CREATE TYPE "public"."kill_switch_definitions_risk_tier_enum" AS ENUM('K1', 'K2', 'K3', 'K4')`);
        await queryRunner.query(`CREATE TYPE "public"."kill_switch_definitions_failure_mode_enum" AS ENUM('FAIL_CLOSED', 'FAIL_OPEN', 'DEGRADED_READ_ONLY', 'QUEUE_FOR_REVIEW', 'FALLBACK_PROVIDER', 'MANUAL_OPERATION')`);
        await queryRunner.query(`CREATE TYPE "public"."kill_switch_definitions_state_enum" AS ENUM('DEFINED', 'TESTED', 'PRODUCTION_ELIGIBLE', 'DEPRECATED')`);
        await queryRunner.query(`CREATE TABLE "kill_switch_definitions" ("definition_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "family" "public"."kill_switch_definitions_family_enum" NOT NULL, "risk_tier" "public"."kill_switch_definitions_risk_tier_enum" NOT NULL, "failure_mode" "public"."kill_switch_definitions_failure_mode_enum" NOT NULL, "scope_shape" jsonb NOT NULL DEFAULT '{}', "recovery_plan" jsonb, "test_evidence" jsonb, "state" "public"."kill_switch_definitions_state_enum" NOT NULL DEFAULT 'DEFINED', "version" integer NOT NULL DEFAULT '1', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_508383eb7e332db78cc82f1bad7" PRIMARY KEY ("definition_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."kill_switch_activations_state_enum" AS ENUM('DRAFT', 'ARMED', 'ACTIVE', 'STABILISING', 'RECOVERY_READY', 'RESTORING', 'MONITORING', 'CLOSED', 'FAILED', 'PARTIAL', 'SCOPE_CHANGE', 'RESTORE_FAILURE', 'CANCELLED')`);
        await queryRunner.query(`CREATE TABLE "kill_switch_activations" ("activation_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "definition_id" uuid NOT NULL, "definition_version" integer NOT NULL, "state" "public"."kill_switch_activations_state_enum" NOT NULL DEFAULT 'DRAFT', "state_version" integer NOT NULL DEFAULT '0', "incident_ref" jsonb, "blast_radius_scope" jsonb NOT NULL, "approval_ref" uuid, "second_review_ref" uuid, "in_flight_actions" jsonb NOT NULL DEFAULT '[]', "idempotency_key" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "closed_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_30fc43bba874d206be093d5dd86" UNIQUE ("idempotency_key"), CONSTRAINT "PK_fa3ae97c2059ea7d6ead095da74" PRIMARY KEY ("activation_id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "kill_switch_activations"`);
        await queryRunner.query(`DROP TYPE "public"."kill_switch_activations_state_enum"`);
        await queryRunner.query(`DROP TABLE "kill_switch_definitions"`);
        await queryRunner.query(`DROP TYPE "public"."kill_switch_definitions_state_enum"`);
        await queryRunner.query(`DROP TYPE "public"."kill_switch_definitions_failure_mode_enum"`);
        await queryRunner.query(`DROP TYPE "public"."kill_switch_definitions_risk_tier_enum"`);
        await queryRunner.query(`DROP TYPE "public"."kill_switch_definitions_family_enum"`);
        // spurious ADD CONSTRAINT counterpart removed — see note in up() above.
    }

}
