import { MigrationInterface, QueryRunner } from "typeorm";

export class CM012TV012CommunicationTorvet1788595681255 implements MigrationInterface {
    name = 'CM012TV012CommunicationTorvet1788595681255'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // NOTE: same generator quirk documented in prior migrations — the
        // hand-written CHECK constraint on access_restrictions isn't
        // entity metadata, so migration:generate keeps proposing to drop
        // it. Left alone; drop line removed.
        await queryRunner.query(`CREATE TYPE "public"."conversations_conversation_type_enum" AS ENUM('DIRECT', 'GROUP', 'CLIENT_PROVIDER', 'SERVICE', 'SUPPORT')`);
        await queryRunner.query(`CREATE TYPE "public"."conversations_state_enum" AS ENUM('DRAFT', 'ACTIVE', 'RESTRICTED', 'CLOSED', 'ARCHIVED', 'QUARANTINED')`);
        await queryRunner.query(`CREATE TABLE "conversations" ("conversation_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenant_id" uuid NOT NULL, "owner_ref" character varying NOT NULL, "conversation_type" "public"."conversations_conversation_type_enum" NOT NULL, "participant_roles" jsonb NOT NULL DEFAULT '{}', "source_context_ref" jsonb, "access_privacy_retention_policy" jsonb NOT NULL, "cross_tenant_permission" jsonb, "minors_policy" jsonb NOT NULL DEFAULT '{}', "moderation_state" jsonb NOT NULL DEFAULT '{}', "state" "public"."conversations_state_enum" NOT NULL DEFAULT 'DRAFT', CONSTRAINT "PK_c00ef2d6a90778048c6b8150819" PRIMARY KEY ("conversation_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."messages_state_enum" AS ENUM('CREATED', 'ACCEPTED', 'DELIVERED', 'READ', 'FAILED', 'BLOCKED', 'QUARANTINED')`);
        await queryRunner.query(`CREATE TABLE "messages" ("message_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "conversation_id" uuid NOT NULL, "state" "public"."messages_state_enum" NOT NULL DEFAULT 'CREATED', "current_version_id" uuid NOT NULL, CONSTRAINT "PK_6187089f850b8deeca0232cfeba" PRIMARY KEY ("message_id"))`);
        await queryRunner.query(`CREATE TABLE "message_versions" ("message_version_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "message_id" uuid NOT NULL, "version_number" integer NOT NULL, "content" jsonb NOT NULL, "edited_by_person_id" uuid NOT NULL, "edited_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_b95cfadad7e214f22ed8107d940" PRIMARY KEY ("message_version_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."message_attachments_malware_scan_status_enum" AS ENUM('PENDING', 'CLEAN', 'INFECTED', 'QUARANTINED')`);
        await queryRunner.query(`CREATE TABLE "message_attachments" ("attachment_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "message_id" uuid NOT NULL, "storage_ref" character varying NOT NULL, "malware_scan_status" "public"."message_attachments_malware_scan_status_enum" NOT NULL DEFAULT 'PENDING', "signed_access_policy" jsonb NOT NULL DEFAULT '{}', CONSTRAINT "PK_0ef0554da4e0685e32bb3272102" PRIMARY KEY ("attachment_id"))`);
        await queryRunner.query(`CREATE TABLE "delivery_receipts" ("receipt_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "message_id" uuid NOT NULL, "participant_person_id" uuid NOT NULL, "delivered_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_418539586a4c666e67e9e4057be" PRIMARY KEY ("receipt_id"))`);
        await queryRunner.query(`CREATE TABLE "read_receipts" ("receipt_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "message_id" uuid NOT NULL, "participant_person_id" uuid NOT NULL, "read_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_8cba47c27845bff4f8e95f2ff5d" PRIMARY KEY ("receipt_id"))`);
        await queryRunner.query(`CREATE TABLE "communication_policies" ("policy_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenant_id" uuid NOT NULL, "conversation_id" uuid, "cross_tenant_rules" jsonb NOT NULL DEFAULT '{}', "minors_rules" jsonb NOT NULL DEFAULT '{}', CONSTRAINT "PK_10e0e3c9748833e32f743ba25e7" PRIMARY KEY ("policy_id"))`);
        await queryRunner.query(`CREATE TABLE "communication_consents" ("consent_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "conversation_id" uuid NOT NULL, "person_id" uuid NOT NULL, "consent_type" character varying NOT NULL, "given_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "withdrawn_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_11ac37024d16b9b4256d0a3a5e6" PRIMARY KEY ("consent_id"))`);
        await queryRunner.query(`CREATE TABLE "moderation_envelopes" ("envelope_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "conversation_id" uuid NOT NULL, "case_family" character varying NOT NULL, "case_ref" character varying, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_41a77cc4227eb3d14193f53210b" PRIMARY KEY ("envelope_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."conversation_cases_status_enum" AS ENUM('OPEN', 'CLOSED')`);
        await queryRunner.query(`CREATE TABLE "conversation_cases" ("case_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "conversation_id" uuid NOT NULL, "moderation_case_ref" character varying, "status" "public"."conversation_cases_status_enum" NOT NULL DEFAULT 'OPEN', "opened_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_d1b84467ceb22dfa4f35c97c110" PRIMARY KEY ("case_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."torvet_surfaces_surface_name_enum" AS ENUM('KNOWLEDGE_AND_SHORT_MEDIA_FEEDS', 'PRODUCTS_SERVICES', 'PEOPLE_ORGANIZATIONS', 'EVENTS', 'COMMUNITIES', 'COURSES', 'PODCAST_MEDIA', 'APPS', 'TORVET_WORK', 'GLOSSARY_KNOWLEDGE_INDEX', 'SPONSORED_FEATURED_INVENTORY')`);
        await queryRunner.query(`CREATE TYPE "public"."torvet_surfaces_activation_state_enum" AS ENUM('INTERNAL_ONLY', 'SEEDING', 'PRIVATE_BETA', 'PUBLIC_DISCOVERY', 'TRANSACTION_ENABLED', 'SCALED')`);
        await queryRunner.query(`CREATE TYPE "public"."torvet_surfaces_protection_states_enum" AS ENUM('DENSITY_GATED', 'STALE_RESTRICTED', 'SAFETY_RESTRICTED', 'TRANSACTION_PAUSED', 'REGION_DISABLED', 'SUNSET')`);
        await queryRunner.query(`CREATE TABLE "torvet_surfaces" ("surface_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "surface_name" "public"."torvet_surfaces_surface_name_enum" NOT NULL, "activation_state" "public"."torvet_surfaces_activation_state_enum" NOT NULL DEFAULT 'INTERNAL_ONLY', "protection_states" "public"."torvet_surfaces_protection_states_enum" array NOT NULL DEFAULT '{}', CONSTRAINT "UQ_323f6c8576c0d6361aee20a4fa7" UNIQUE ("surface_name"), CONSTRAINT "PK_947abd02a635d6fe7892b8b0abf" PRIMARY KEY ("surface_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."torvet_market_cells_activation_state_enum" AS ENUM('INTERNAL_ONLY', 'SEEDING', 'PRIVATE_BETA', 'PUBLIC_DISCOVERY', 'TRANSACTION_ENABLED', 'SCALED')`);
        await queryRunner.query(`CREATE TYPE "public"."torvet_market_cells_protection_states_enum" AS ENUM('DENSITY_GATED', 'STALE_RESTRICTED', 'SAFETY_RESTRICTED', 'TRANSACTION_PAUSED', 'REGION_DISABLED', 'SUNSET')`);
        await queryRunner.query(`CREATE TABLE "torvet_market_cells" ("market_cell_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "surface_id" uuid NOT NULL, "product_category_ref" character varying NOT NULL, "country_region" character varying NOT NULL, "language" character varying NOT NULL, "audience_context" jsonb NOT NULL DEFAULT '{}', "activation_state" "public"."torvet_market_cells_activation_state_enum" NOT NULL DEFAULT 'INTERNAL_ONLY', "protection_states" "public"."torvet_market_cells_protection_states_enum" array NOT NULL DEFAULT '{}', CONSTRAINT "PK_c35098492a58626f511a78a223f" PRIMARY KEY ("market_cell_id"))`);
        await queryRunner.query(`CREATE TABLE "liquidity_gates" ("gate_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "market_cell_id" uuid NOT NULL, "version" integer NOT NULL DEFAULT '1', "evaluation_snapshot" jsonb NOT NULL, "passed" boolean NOT NULL, "evaluated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_e36f873a2be0f0d37cff3d4930f" PRIMARY KEY ("gate_id"))`);
        await queryRunner.query(`CREATE TABLE "liquidity_plans" ("plan_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "market_cell_id" uuid NOT NULL, "name" character varying NOT NULL, "plan" jsonb NOT NULL, CONSTRAINT "PK_ef8033b20453d1b5b58d55d7b6b" PRIMARY KEY ("plan_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."torvet_projections_freshness_state_enum" AS ENUM('DRAFT', 'SYNCING', 'FRESH', 'AGING', 'STALE', 'RESTRICTED', 'REFRESHING')`);
        await queryRunner.query(`CREATE TYPE "public"."torvet_projections_publication_state_enum" AS ENUM('PUBLISHED', 'UNPUBLISHED', 'RESTRICTED')`);
        await queryRunner.query(`CREATE TABLE "torvet_projections" ("projection_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "source_domain" character varying NOT NULL, "source_object_ref" jsonb NOT NULL, "source_version" integer NOT NULL, "market_ref" jsonb NOT NULL, "public_fields" jsonb NOT NULL, "critical_fields" jsonb NOT NULL, "interaction_cta_ranking_placement_policy" jsonb NOT NULL DEFAULT '{}', "last_confirmed_at" TIMESTAMP WITH TIME ZONE NOT NULL, "freshness_state" "public"."torvet_projections_freshness_state_enum" NOT NULL DEFAULT 'DRAFT', "freshness_state_version" integer NOT NULL DEFAULT '0', "publication_state" "public"."torvet_projections_publication_state_enum" NOT NULL DEFAULT 'UNPUBLISHED', "restrictions" jsonb NOT NULL DEFAULT '{}', CONSTRAINT "PK_80de013e311e2271279ab3a18f0" PRIMARY KEY ("projection_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_d54ee87306112b11665e7f6ae1" ON "torvet_projections"  ("source_domain", "source_object_ref") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_d54ee87306112b11665e7f6ae1"`);
        await queryRunner.query(`DROP TABLE "torvet_projections"`);
        await queryRunner.query(`DROP TYPE "public"."torvet_projections_publication_state_enum"`);
        await queryRunner.query(`DROP TYPE "public"."torvet_projections_freshness_state_enum"`);
        await queryRunner.query(`DROP TABLE "liquidity_plans"`);
        await queryRunner.query(`DROP TABLE "liquidity_gates"`);
        await queryRunner.query(`DROP TABLE "torvet_market_cells"`);
        await queryRunner.query(`DROP TYPE "public"."torvet_market_cells_protection_states_enum"`);
        await queryRunner.query(`DROP TYPE "public"."torvet_market_cells_activation_state_enum"`);
        await queryRunner.query(`DROP TABLE "torvet_surfaces"`);
        await queryRunner.query(`DROP TYPE "public"."torvet_surfaces_protection_states_enum"`);
        await queryRunner.query(`DROP TYPE "public"."torvet_surfaces_activation_state_enum"`);
        await queryRunner.query(`DROP TYPE "public"."torvet_surfaces_surface_name_enum"`);
        await queryRunner.query(`DROP TABLE "conversation_cases"`);
        await queryRunner.query(`DROP TYPE "public"."conversation_cases_status_enum"`);
        await queryRunner.query(`DROP TABLE "moderation_envelopes"`);
        await queryRunner.query(`DROP TABLE "communication_consents"`);
        await queryRunner.query(`DROP TABLE "communication_policies"`);
        await queryRunner.query(`DROP TABLE "read_receipts"`);
        await queryRunner.query(`DROP TABLE "delivery_receipts"`);
        await queryRunner.query(`DROP TABLE "message_attachments"`);
        await queryRunner.query(`DROP TYPE "public"."message_attachments_malware_scan_status_enum"`);
        await queryRunner.query(`DROP TABLE "message_versions"`);
        await queryRunner.query(`DROP TABLE "messages"`);
        await queryRunner.query(`DROP TYPE "public"."messages_state_enum"`);
        await queryRunner.query(`DROP TABLE "conversations"`);
        await queryRunner.query(`DROP TYPE "public"."conversations_state_enum"`);
        await queryRunner.query(`DROP TYPE "public"."conversations_conversation_type_enum"`);
        // (see matching note in up())
    }

}
