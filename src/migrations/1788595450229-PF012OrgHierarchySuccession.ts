import { MigrationInterface, QueryRunner } from "typeorm";

export class PF012OrgHierarchySuccession1788595450229 implements MigrationInterface {
    name = 'PF012OrgHierarchySuccession1788595450229'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // NOTE: same generator quirk documented in the FRM-001 and
        // CL-011/012/013 migrations — the hand-written CHECK constraint on
        // access_restrictions isn't entity metadata, so migration:generate
        // keeps proposing to drop it. Left alone; drop line removed.
        await queryRunner.query(`CREATE TYPE "public"."delegations_status_enum" AS ENUM('ACTIVE', 'EXPIRED', 'REVOKED')`);
        await queryRunner.query(`CREATE TABLE "delegations" ("delegation_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "delegator_person_id" uuid NOT NULL, "delegate_person_id" uuid NOT NULL, "scope_ref" jsonb NOT NULL, "capability_scope" jsonb NOT NULL DEFAULT '{}', "valid_from" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "valid_to" TIMESTAMP WITH TIME ZONE, "status" "public"."delegations_status_enum" NOT NULL DEFAULT 'ACTIVE', CONSTRAINT "PK_11a8a3e7f64d9a7d4fdb3233805" PRIMARY KEY ("delegation_id"))`);
        await queryRunner.query(`CREATE TABLE "ownership_records" ("ownership_record_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_id" uuid NOT NULL, "legal_owner_ref" character varying NOT NULL, "ownership_evidence" jsonb NOT NULL, "effective_from" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_0abc049838268bdc8ecda790840" PRIMARY KEY ("ownership_record_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."ownership_transfers_status_enum" AS ENUM('PROPOSED', 'PARTIES_VERIFIED', 'COOLING_OFF', 'APPROVED', 'COMPLETED', 'REJECTED', 'APPEALED')`);
        await queryRunner.query(`CREATE TABLE "ownership_transfers" ("transfer_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "ownership_record_id" uuid NOT NULL, "from_owner_ref" character varying NOT NULL, "to_owner_ref" character varying NOT NULL, "authority_evidence" jsonb NOT NULL, "conflict_compliance_checks" jsonb NOT NULL DEFAULT '{}', "status" "public"."ownership_transfers_status_enum" NOT NULL DEFAULT 'PROPOSED', "initiated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "completed_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_c5e8b5d8de6f3bd4865682b04e4" PRIMARY KEY ("transfer_id"))`);
        await queryRunner.query(`CREATE TABLE "succession_plans" ("succession_plan_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_id" uuid NOT NULL, "nominated_successor_ref" character varying NOT NULL, "activation_conditions" jsonb NOT NULL, "required_proof_classes" jsonb NOT NULL, "protected_assets" jsonb NOT NULL, "interim_operator_ref" character varying, "communication_plan" jsonb NOT NULL DEFAULT '{}', "jurisdictional_rules" jsonb NOT NULL DEFAULT '{}', CONSTRAINT "PK_fc8d4e55cf499437b0a5d4ac838" PRIMARY KEY ("succession_plan_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."organization_recovery_cases_trigger_kind_enum" AS ENUM('DEATH', 'INCAPACITY', 'DEPARTURE', 'DISPUTE', 'COMPROMISE', 'ADMINISTRATIVE_LOCKOUT')`);
        await queryRunner.query(`CREATE TYPE "public"."organization_recovery_cases_state_enum" AS ENUM('REPORTED', 'CONTAINED', 'EVIDENCE_COLLECTION', 'REVIEW', 'INTERIM_CONTROL', 'APPROVED', 'DENIED', 'HANDOVER', 'MONITORED', 'CLOSED')`);
        await queryRunner.query(`CREATE TABLE "organization_recovery_cases" ("recovery_case_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_id" uuid NOT NULL, "trigger_kind" "public"."organization_recovery_cases_trigger_kind_enum" NOT NULL, "state" "public"."organization_recovery_cases_state_enum" NOT NULL DEFAULT 'REPORTED', "evidence_refs" jsonb NOT NULL DEFAULT '[]', CONSTRAINT "PK_78e6fdc71695d195a4a97510a28" PRIMARY KEY ("recovery_case_id"))`);
        await queryRunner.query(`ALTER TABLE "organization_units" ADD "hierarchy_version" integer NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE "organization_units" ADD "effective_from" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "organization_units" ADD "effective_to" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`CREATE TYPE "public"."organization_units_status_enum" AS ENUM('ACTIVE', 'ARCHIVED')`);
        await queryRunner.query(`ALTER TABLE "organization_units" ADD "status" "public"."organization_units_status_enum" NOT NULL DEFAULT 'ACTIVE'`);
        await queryRunner.query(`ALTER TABLE "organization_units" ADD "lineage" jsonb NOT NULL DEFAULT '[]'`);
        await queryRunner.query(`ALTER TABLE "role_assignments" ADD "organization_id" uuid`);
        await queryRunner.query(`ALTER TABLE "role_assignments" ADD "capability_scope" jsonb NOT NULL DEFAULT '{}'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "role_assignments" DROP COLUMN "capability_scope"`);
        await queryRunner.query(`ALTER TABLE "role_assignments" DROP COLUMN "organization_id"`);
        await queryRunner.query(`ALTER TABLE "organization_units" DROP COLUMN "lineage"`);
        await queryRunner.query(`ALTER TABLE "organization_units" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."organization_units_status_enum"`);
        await queryRunner.query(`ALTER TABLE "organization_units" DROP COLUMN "effective_to"`);
        await queryRunner.query(`ALTER TABLE "organization_units" DROP COLUMN "effective_from"`);
        await queryRunner.query(`ALTER TABLE "organization_units" DROP COLUMN "hierarchy_version"`);
        await queryRunner.query(`DROP TABLE "organization_recovery_cases"`);
        await queryRunner.query(`DROP TYPE "public"."organization_recovery_cases_state_enum"`);
        await queryRunner.query(`DROP TYPE "public"."organization_recovery_cases_trigger_kind_enum"`);
        await queryRunner.query(`DROP TABLE "succession_plans"`);
        await queryRunner.query(`DROP TABLE "ownership_transfers"`);
        await queryRunner.query(`DROP TYPE "public"."ownership_transfers_status_enum"`);
        await queryRunner.query(`DROP TABLE "ownership_records"`);
        await queryRunner.query(`DROP TABLE "delegations"`);
        await queryRunner.query(`DROP TYPE "public"."delegations_status_enum"`);
        // (see matching note in up())
    }

}
