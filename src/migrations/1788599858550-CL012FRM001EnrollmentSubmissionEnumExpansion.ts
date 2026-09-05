import { MigrationInterface, QueryRunner } from "typeorm";

export class CL012FRM001EnrollmentSubmissionEnumExpansion1788599858550 implements MigrationInterface {
    name = 'CL012FRM001EnrollmentSubmissionEnumExpansion1788599858550'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // NOTE: migration:generate's diff repeatedly proposes dropping the
        // hand-written raw-SQL CHECK constraint CHK_access_restrictions_precedence_1_or_2
        // (it isn't part of TypeORM entity metadata, so the generator always
        // sees it as a phantom removal) — a generator artifact, not a real
        // schema change. Spurious DROP/ADD pair removed here, same fix
        // applied to every migration since XD-007/008.
        await queryRunner.query(`CREATE TYPE "public"."orders_state_enum" AS ENUM('draft', 'checkout_pending', 'placed', 'confirmed', 'partial_fulfilment', 'full_fulfilment', 'exception', 'cancelled', 'disputed', 'closed')`);
        await queryRunner.query(`CREATE TABLE "orders" ("order_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "buyer_ref" jsonb NOT NULL, "merchant_of_record_ref" jsonb NOT NULL, "state" "public"."orders_state_enum" NOT NULL DEFAULT 'draft', "state_version" integer NOT NULL DEFAULT '0', "lines" jsonb NOT NULL DEFAULT '[]', "frozen_snapshot" jsonb, "payment_ref" jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "closed_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_cad55b3cb25b38be94d2ce831db" PRIMARY KEY ("order_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."payments_state_enum" AS ENUM('created', 'action_required', 'processing', 'authorised', 'captured', 'settled', 'failed', 'refund_pending', 'refunded', 'disputed', 'unknown', 'closed')`);
        await queryRunner.query(`CREATE TABLE "payments" ("payment_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order_id" uuid NOT NULL, "mor_tax_currency_snapshot" jsonb NOT NULL, "state" "public"."payments_state_enum" NOT NULL DEFAULT 'created', "state_version" integer NOT NULL DEFAULT '0', "provider_evidence" jsonb NOT NULL DEFAULT '{}', "ledger_entries" jsonb NOT NULL DEFAULT '[]', "idempotency_key" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "closed_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_59dcef70bd19850783c84f840e5" UNIQUE ("idempotency_key"), CONSTRAINT "PK_8866a3cfff96b8e17c2b204aae0" PRIMARY KEY ("payment_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."refund_cases_state_enum" AS ENUM('requested', 'under_review', 'approved', 'rejected', 'appeal_pending', 'provider_processing', 'provider_refunded', 'failed', 'closed')`);
        await queryRunner.query(`CREATE TABLE "refund_cases" ("refund_case_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "payment_id" uuid NOT NULL, "order_id" uuid NOT NULL, "reason_category" character varying NOT NULL, "initiator_ref" jsonb NOT NULL, "lines_quantities" jsonb NOT NULL, "state" "public"."refund_cases_state_enum" NOT NULL DEFAULT 'requested', "state_version" integer NOT NULL DEFAULT '0', "approval_record" jsonb, "commercial_learning_case_ref" jsonb, "provider_refund_ref" jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "closed_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_99aaa9f264b1febf8ee05db43a3" PRIMARY KEY ("refund_case_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."chargeback_cases_state_enum" AS ENUM('opened', 'evidence_collection', 'submitted', 'won', 'lost', 'partial', 'recovery', 'write_off', 'closed')`);
        await queryRunner.query(`CREATE TABLE "chargeback_cases" ("case_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "payment_id" uuid NOT NULL, "state" "public"."chargeback_cases_state_enum" NOT NULL DEFAULT 'opened', "state_version" integer NOT NULL DEFAULT '0', "provider_case_ref" jsonb NOT NULL, "response_deadline_at" TIMESTAMP WITH TIME ZONE, "evidence_package" jsonb, "ruling_evidence" jsonb, "reserve_hold_record" jsonb NOT NULL DEFAULT '{}', "integrity_case_opened" boolean NOT NULL DEFAULT false, "integrity_case_ref" jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "closed_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_4c99cc22049f54c17d5e5fbce6c" PRIMARY KEY ("case_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."subscriptions_state_enum" AS ENUM('pending_activation', 'active', 'grace', 'restricted', 'suspended', 'cancel_scheduled', 'ended')`);
        await queryRunner.query(`CREATE TABLE "subscriptions" ("subscription_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "buyer_ref" jsonb NOT NULL, "plan_offer_ref" jsonb NOT NULL, "mor_tax_currency_snapshot" jsonb NOT NULL, "state" "public"."subscriptions_state_enum" NOT NULL DEFAULT 'pending_activation', "state_version" integer NOT NULL DEFAULT '0', "current_period_index" integer NOT NULL DEFAULT '0', "current_period_payment_ref" jsonb, "grace_timer_started_at" TIMESTAMP WITH TIME ZONE, "restriction_timer_started_at" TIMESTAMP WITH TIME ZONE, "paid_through_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "ended_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_33b940ef52faaafc3d05f95719f" PRIMARY KEY ("subscription_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."payouts_state_enum" AS ENUM('earned', 'pending_clearance', 'available', 'scheduled', 'in_transit', 'paid', 'held', 'failed', 'returned', 'reversed', 'disputed')`);
        await queryRunner.query(`CREATE TABLE "payouts" ("payout_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "beneficiary_ref" jsonb NOT NULL, "mor_ref" jsonb NOT NULL, "state" "public"."payouts_state_enum" NOT NULL DEFAULT 'earned', "state_version" integer NOT NULL DEFAULT '0', "amount_ref" jsonb NOT NULL, "reserve_hold_record" jsonb NOT NULL DEFAULT '{}', "eligibility_check" jsonb, "provider_instruction_ref" jsonb, "ledger_entries" jsonb NOT NULL DEFAULT '[]', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "paid_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_9725cd634bfc4096ff177a66448" PRIMARY KEY ("payout_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."entitlements_state_enum" AS ENUM('pending_grant', 'granted', 'grant_failed', 'restricted', 'suspended', 'revoked', 'expired')`);
        await queryRunner.query(`CREATE TABLE "entitlements" ("entitlement_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "target_ref" jsonb NOT NULL, "capability_ref" jsonb NOT NULL, "triggering_event_ref" jsonb NOT NULL, "state" "public"."entitlements_state_enum" NOT NULL DEFAULT 'pending_grant', "state_version" integer NOT NULL DEFAULT '0', "grant_failure_evidence" jsonb, "policy_case_evidence" jsonb, "expires_at" TIMESTAMP WITH TIME ZONE, "idempotency_key" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_8505bca46f88050c7b70ed0f19f" UNIQUE ("idempotency_key"), CONSTRAINT "PK_5338ee58ae703b2c4adab7e6c79" PRIMARY KEY ("entitlement_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."publication_versions_state_enum" AS ENUM('draft', 'publishing', 'live', 'paused', 'unpublished', 'restricted', 'superseded', 'archived', 'failed', 'tombstoned')`);
        await queryRunner.query(`CREATE TABLE "publication_versions" ("publication_version_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "source_object_ref" jsonb NOT NULL, "serving_context" jsonb NOT NULL, "state" "public"."publication_versions_state_enum" NOT NULL DEFAULT 'draft', "state_version" integer NOT NULL DEFAULT '0', "frozen_snapshot" jsonb, "supersedes_version_id" uuid, "rollback_of_version_id" uuid, "publish_guard_evidence" jsonb, "failure_evidence" jsonb, "hold_evidence" jsonb, "idempotency_key" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "live_at" TIMESTAMP WITH TIME ZONE, "closed_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_554a441d8877d03abcb9ddc5328" UNIQUE ("idempotency_key"), CONSTRAINT "PK_63e534bb8e57770bd7ecc8a8e67" PRIMARY KEY ("publication_version_id"))`);
        await queryRunner.query(`ALTER TABLE "enrollments" ADD "source_enrollment_id" uuid`);
        await queryRunner.query(`ALTER TYPE "public"."submissions_state_enum" ADD VALUE 'VALIDATION_FAILED'`);
        await queryRunner.query(`ALTER TYPE "public"."submissions_state_enum" ADD VALUE 'DUPLICATE_DETECTED'`);
        await queryRunner.query(`ALTER TYPE "public"."submissions_state_enum" ADD VALUE 'SPAM_FLAGGED'`);
        await queryRunner.query(`ALTER TYPE "public"."submissions_state_enum" ADD VALUE 'MANUAL_REVIEW'`);
        await queryRunner.query(`ALTER TYPE "public"."submissions_state_enum" ADD VALUE 'REJECTED'`);
        await queryRunner.query(`ALTER TYPE "public"."submissions_state_enum" ADD VALUE 'WITHDRAWN'`);
        await queryRunner.query(`ALTER TYPE "public"."submissions_state_enum" ADD VALUE 'EXPIRED'`);
        await queryRunner.query(`ALTER TYPE "public"."submissions_state_enum" ADD VALUE 'PROCESSING_FAILED'`);
        await queryRunner.query(`ALTER TYPE "public"."enrollments_state_enum" RENAME TO "enrollments_state_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."enrollments_state_enum" AS ENUM('INVITED', 'ELIGIBILITY_PENDING', 'WAITLISTED', 'ENROLLED', 'ACTIVE', 'PAUSED', 'ACCESS_RESTRICTED', 'COMPLETION_REVIEW', 'COMPLETED', 'PRE_START_CANCELLED', 'WITHDRAWN', 'REMOVED_WITH_RECORD', 'EXPIRED', 'TRANSFERRED', 'ARCHIVED')`);
        await queryRunner.query(`ALTER TABLE "enrollments" ALTER COLUMN "state" DROP DEFAULT`);
        // NOTE (08_BaseEnrollment.md correction): this is a rename, not only
        // an addition — the pre-correction enum used the label 'ELIGIBILITY',
        // the canonical doc's label is 'ELIGIBILITY_PENDING'. A plain
        // text-cast would fail on any existing row still carrying the old
        // label, so the USING clause maps it explicitly instead of relying
        // on identical label survival (verified empty table at migration
        // time via psql, but the mapping is kept for safety/documentation).
        await queryRunner.query(`ALTER TABLE "enrollments" ALTER COLUMN "state" TYPE "public"."enrollments_state_enum" USING (CASE WHEN "state"::"text" = 'ELIGIBILITY' THEN 'ELIGIBILITY_PENDING' ELSE "state"::"text" END)::"public"."enrollments_state_enum"`);
        await queryRunner.query(`ALTER TABLE "enrollments" ALTER COLUMN "state" SET DEFAULT 'INVITED'`);
        await queryRunner.query(`DROP TYPE "public"."enrollments_state_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."enrollments_state_enum_old" AS ENUM('INVITED', 'ELIGIBILITY', 'ENROLLED', 'ACTIVE', 'COMPLETION_REVIEW', 'COMPLETED', 'ARCHIVED')`);
        await queryRunner.query(`ALTER TABLE "enrollments" ALTER COLUMN "state" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "enrollments" ALTER COLUMN "state" TYPE "public"."enrollments_state_enum_old" USING (CASE WHEN "state"::"text" = 'ELIGIBILITY_PENDING' THEN 'ELIGIBILITY' ELSE "state"::"text" END)::"public"."enrollments_state_enum_old"`);
        await queryRunner.query(`ALTER TABLE "enrollments" ALTER COLUMN "state" SET DEFAULT 'INVITED'`);
        await queryRunner.query(`DROP TYPE "public"."enrollments_state_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."enrollments_state_enum_old" RENAME TO "enrollments_state_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."submissions_state_enum_old" AS ENUM('STARTED', 'PARTIAL_SAVED', 'VALIDATING', 'SUBMITTED', 'PROCESSING', 'ACCEPTED', 'ROUTED', 'COMPLETED')`);
        await queryRunner.query(`ALTER TABLE "submissions" ALTER COLUMN "state" TYPE "public"."submissions_state_enum_old" USING "state"::"text"::"public"."submissions_state_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."submissions_state_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."submissions_state_enum_old" RENAME TO "submissions_state_enum"`);
        await queryRunner.query(`ALTER TABLE "enrollments" DROP COLUMN "source_enrollment_id"`);
        await queryRunner.query(`DROP TABLE "publication_versions"`);
        await queryRunner.query(`DROP TYPE "public"."publication_versions_state_enum"`);
        await queryRunner.query(`DROP TABLE "entitlements"`);
        await queryRunner.query(`DROP TYPE "public"."entitlements_state_enum"`);
        await queryRunner.query(`DROP TABLE "payouts"`);
        await queryRunner.query(`DROP TYPE "public"."payouts_state_enum"`);
        await queryRunner.query(`DROP TABLE "subscriptions"`);
        await queryRunner.query(`DROP TYPE "public"."subscriptions_state_enum"`);
        await queryRunner.query(`DROP TABLE "chargeback_cases"`);
        await queryRunner.query(`DROP TYPE "public"."chargeback_cases_state_enum"`);
        await queryRunner.query(`DROP TABLE "refund_cases"`);
        await queryRunner.query(`DROP TYPE "public"."refund_cases_state_enum"`);
        await queryRunner.query(`DROP TABLE "payments"`);
        await queryRunner.query(`DROP TYPE "public"."payments_state_enum"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TYPE "public"."orders_state_enum"`);
        // Spurious ADD CONSTRAINT removed here (see up() note) — the
        // CHK_access_restrictions_precedence_1_or_2 constraint was never
        // actually dropped, so it must not be re-added.
    }

}
