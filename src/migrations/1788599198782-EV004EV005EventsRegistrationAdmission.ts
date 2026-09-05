import { MigrationInterface, QueryRunner } from "typeorm";

export class EV004EV005EventsRegistrationAdmission1788599198782 implements MigrationInterface {
    name = 'EV004EV005EventsRegistrationAdmission1788599198782'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // NOTE: migration:generate's diff repeatedly proposes dropping
        // "CHK_access_restrictions_precedence_1_or_2" (hand-written raw SQL in
        // the XD-007/008 migration, not part of any entity's TypeORM metadata) —
        // a generator artifact, not a real schema change. Spurious DROP/ADD pair
        // removed here, same fix applied to every migration since XD-007/008.
        await queryRunner.query(`CREATE TYPE "public"."event_registrations_state_enum" AS ENUM('not_open', 'browsing_hold', 'hold_expired', 'pending_payment', 'confirmed', 'waitlisted', 'waitlist_offer_pending', 'transferred', 'cancelled', 'refunded', 'closed')`);
        await queryRunner.query(`CREATE TABLE "event_registrations" ("registration_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "person_ref" jsonb NOT NULL, "purchaser_ref" jsonb, "admission_scope_ref" jsonb NOT NULL, "inventory_pool_ref" jsonb NOT NULL, "state" "public"."event_registrations_state_enum" NOT NULL DEFAULT 'browsing_hold', "state_version" integer NOT NULL DEFAULT '0', "hold_idempotency_key" character varying NOT NULL, "hold_expires_at" TIMESTAMP WITH TIME ZONE, "order_ref" jsonb, "entitlement_ref" jsonb, "waitlist_entry_ref" jsonb, "waitlist_offer_expires_at" TIMESTAMP WITH TIME ZONE, "transferred_from_registration_id" uuid, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "closed_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_835a00dff93f15dc202b50f031d" UNIQUE ("hold_idempotency_key"), CONSTRAINT "PK_823dbb7f9de811cdf27c871aa99" PRIMARY KEY ("registration_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."admission_credentials_state_enum" AS ENUM('pending', 'issued', 'presented', 'transferred', 'revoked', 'expired', 'consumed')`);
        await queryRunner.query(`CREATE TABLE "admission_credentials" ("credential_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "registration_id" uuid NOT NULL, "scope_and_policy" jsonb NOT NULL, "security_level" character varying NOT NULL, "state" "public"."admission_credentials_state_enum" NOT NULL DEFAULT 'pending', "state_version" integer NOT NULL DEFAULT '0', "signing_key_ref" character varying, "validity_expires_at" TIMESTAMP WITH TIME ZONE, "supersedes_credential_id" uuid, "revocation_reason" jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_68420ee57058a719fcfbad5e626" PRIMARY KEY ("credential_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."admission_scan_events_decision_result_enum" AS ENUM('admitted', 'review', 'rejected')`);
        await queryRunner.query(`CREATE TABLE "admission_scan_events" ("scan_event_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "credential_id" uuid NOT NULL, "decision_result" "public"."admission_scan_events_decision_result_enum" NOT NULL, "decision_reason" jsonb NOT NULL, "device_station_ref" jsonb NOT NULL, "sync_provenance" jsonb NOT NULL DEFAULT '{}', "override_of_scan_event_id" uuid, "override_authority_ref" jsonb, "event_time" TIMESTAMP WITH TIME ZONE NOT NULL, "recorded_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_e9087e2b58a8360d62153e41e15" PRIMARY KEY ("scan_event_id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "admission_scan_events"`);
        await queryRunner.query(`DROP TYPE "public"."admission_scan_events_decision_result_enum"`);
        await queryRunner.query(`DROP TABLE "admission_credentials"`);
        await queryRunner.query(`DROP TYPE "public"."admission_credentials_state_enum"`);
        await queryRunner.query(`DROP TABLE "event_registrations"`);
        await queryRunner.query(`DROP TYPE "public"."event_registrations_state_enum"`);
        // spurious ADD CONSTRAINT counterpart removed — see note in up() above.
    }

}
