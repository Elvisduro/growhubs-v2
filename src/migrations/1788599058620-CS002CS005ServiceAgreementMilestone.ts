import { MigrationInterface, QueryRunner } from "typeorm";

export class CS002CS005ServiceAgreementMilestone1788599058620 implements MigrationInterface {
    name = 'CS002CS005ServiceAgreementMilestone1788599058620'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // NOTE: migration:generate's diff repeatedly proposes dropping
        // "CHK_access_restrictions_precedence_1_or_2" (hand-written raw SQL in
        // the XD-007/008 migration, not part of any entity's TypeORM metadata) —
        // a generator artifact, not a real schema change. Spurious DROP/ADD pair
        // removed here, same fix applied to every migration since XD-007/008.
        await queryRunner.query(`CREATE TYPE "public"."service_agreements_state_enum" AS ENUM('draft', 'pending_signature', 'active', 'amended', 'expired', 'declined', 'terminated', 'closed')`);
        await queryRunner.query(`CREATE TABLE "service_agreements" ("agreement_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "proposal_version_ref" jsonb NOT NULL, "offer_price_ref" jsonb, "policy_version_refs" jsonb NOT NULL DEFAULT '{}', "state" "public"."service_agreements_state_enum" NOT NULL DEFAULT 'draft', "state_version" integer NOT NULL DEFAULT '0', "content" jsonb NOT NULL, "validity_expires_at" TIMESTAMP WITH TIME ZONE, "signature_evidence" jsonb, "predecessor_agreement_id" uuid, "superseded_by_agreement_id" uuid, "termination_record" jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "closed_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_dc52f7447195716d901e2c057f6" PRIMARY KEY ("agreement_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."milestones_state_enum" AS ENUM('planned', 'in_progress', 'evidence_pending', 'achieved', 'not_achieved', 'waived', 'disputed', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "milestones" ("milestone_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "agreement_id" uuid NOT NULL, "delivery_plan_version_ref" jsonb NOT NULL, "specification" jsonb NOT NULL, "state" "public"."milestones_state_enum" NOT NULL DEFAULT 'planned', "state_version" integer NOT NULL DEFAULT '0', "contributing_evidence" jsonb NOT NULL DEFAULT '[]', "decision_record" jsonb, "dispute_record" jsonb, "waiver_record" jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "resolved_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_f1e1f90ada344ec4c4dd1ad0a70" PRIMARY KEY ("milestone_id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "milestones"`);
        await queryRunner.query(`DROP TYPE "public"."milestones_state_enum"`);
        await queryRunner.query(`DROP TABLE "service_agreements"`);
        await queryRunner.query(`DROP TYPE "public"."service_agreements_state_enum"`);
        // spurious ADD CONSTRAINT counterpart removed — see note in up() above.
    }

}
