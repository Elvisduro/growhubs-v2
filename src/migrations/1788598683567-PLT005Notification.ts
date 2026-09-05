import { MigrationInterface, QueryRunner } from "typeorm";

export class PLT005Notification1788598683567 implements MigrationInterface {
    name = 'PLT005Notification1788598683567'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // NOTE: migration:generate's diff repeatedly proposes dropping
        // "CHK_access_restrictions_precedence_1_or_2" (hand-written raw SQL in
        // the XD-007/008 migration, not part of any entity's TypeORM metadata) —
        // a generator artifact, not a real schema change. Spurious DROP/ADD pair
        // removed here, same fix applied to every migration since XD-007/008.
        await queryRunner.query(`CREATE TYPE "public"."notifications_state_enum" AS ENUM('CREATED', 'ROUTING', 'SUPPRESSED', 'QUEUED', 'SENDING', 'SENT', 'SEND_FAILED_RETRYABLE', 'SEND_FAILED_TERMINAL', 'DELIVERY_PENDING', 'DELIVERED_CONFIRMED', 'READ_ACKNOWLEDGED', 'DELIVERY_UNKNOWN', 'DELIVERY_FAILED_TERMINAL', 'ESCALATION_FALLBACK', 'CANCELLED', 'EXPIRED_UNSENT')`);
        await queryRunner.query(`CREATE TYPE "public"."notifications_channel_enum" AS ENUM('EMAIL', 'SMS', 'PUSH', 'IN_APP')`);
        await queryRunner.query(`CREATE TABLE "notifications" ("notification_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "source_event_id" character varying NOT NULL, "notification_class_id" character varying NOT NULL, "correlation_ref" jsonb NOT NULL, "recipient_ref" jsonb NOT NULL, "state" "public"."notifications_state_enum" NOT NULL DEFAULT 'CREATED', "state_version" integer NOT NULL DEFAULT '0', "channel" "public"."notifications_channel_enum", "suppression_reason" jsonb, "attempt_count" integer NOT NULL DEFAULT '0', "provider_refs" jsonb NOT NULL DEFAULT '{}', "sent_at" TIMESTAMP WITH TIME ZONE, "delivered_at" TIMESTAMP WITH TIME ZONE, "read_at" TIMESTAMP WITH TIME ZONE, "escalated_from_id" uuid, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "closed_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_eaedfe19f0f765d26afafa85956" PRIMARY KEY ("notification_id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_8fc8850705db5674c3086f575a" ON "notifications"  ("source_event_id", "notification_class_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_8fc8850705db5674c3086f575a"`);
        await queryRunner.query(`DROP TABLE "notifications"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_channel_enum"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_state_enum"`);
        // spurious ADD CONSTRAINT counterpart removed — see note in up() above.
    }

}
