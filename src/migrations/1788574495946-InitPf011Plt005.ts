import { MigrationInterface, QueryRunner } from "typeorm";

export class InitPf011Plt0051788574495946 implements MigrationInterface {
    name = 'InitPf011Plt0051788574495946'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."people_status_enum" AS ENUM('ACTIVE', 'SUSPENDED', 'CLOSED')`);
        await queryRunner.query(`CREATE TABLE "people" ("person_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "canonical_name" character varying NOT NULL, "date_of_birth" date, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "status" "public"."people_status_enum" NOT NULL DEFAULT 'ACTIVE', CONSTRAINT "PK_14a8a70884ba14699b85367294a" PRIMARY KEY ("person_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."accounts_status_enum" AS ENUM('ACTIVE', 'LOCKED', 'RECOVERY_PENDING', 'CLOSED')`);
        await queryRunner.query(`CREATE TABLE "accounts" ("account_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "person_id" uuid NOT NULL, "primary_email" character varying NOT NULL, "auth_credential_ref" character varying NOT NULL, "recovery_methods" jsonb NOT NULL DEFAULT '{}', "device_history_ref" character varying, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "last_login_at" TIMESTAMP WITH TIME ZONE, "status" "public"."accounts_status_enum" NOT NULL DEFAULT 'ACTIVE', CONSTRAINT "UQ_cecdd107ca499a5b3279f9f2cea" UNIQUE ("person_id"), CONSTRAINT "UQ_7a6b86a5d8b9a080ce4a5e657e5" UNIQUE ("primary_email"), CONSTRAINT "REL_cecdd107ca499a5b3279f9f2ce" UNIQUE ("person_id"), CONSTRAINT "PK_abcd260aa34b3ad2c0ff663dc20" PRIMARY KEY ("account_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."organizations_org_kind_enum" AS ENUM('BUSINESS', 'AGENCY', 'INSTITUTION', 'CLUB', 'SCHOOL', 'GROUP')`);
        await queryRunner.query(`CREATE TABLE "organizations" ("organization_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "legal_name" character varying NOT NULL, "org_kind" "public"."organizations_org_kind_enum" NOT NULL, "has_operational_tenant" boolean NOT NULL DEFAULT false, "primary_tenant_id" uuid, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_82ade2bdf772ced2c2468c1e843" UNIQUE ("primary_tenant_id"), CONSTRAINT "PK_256856c7ab20081dd27937d43ed" PRIMARY KEY ("organization_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."tenants_tenant_kind_enum" AS ENUM('PERSONAL', 'BUSINESS')`);
        await queryRunner.query(`CREATE TYPE "public"."tenants_lifecycle_state_enum" AS ENUM('PROVISIONING', 'ACTIVE', 'RESTRICTED', 'SUSPENDED_PARTIAL', 'EXITING', 'RETENTION_ONLY', 'CLOSED', 'DELETED_OR_ANONYMISED')`);
        await queryRunner.query(`CREATE TABLE "tenants" ("tenant_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "owning_organization_id" uuid NOT NULL, "tenant_kind" "public"."tenants_tenant_kind_enum" NOT NULL, "lifecycle_state" "public"."tenants_lifecycle_state_enum" NOT NULL DEFAULT 'PROVISIONING', "primary_payer_billing_account_id" uuid, "data_residency_region" character varying, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_2bc5fb666b382723700bb4c1e76" PRIMARY KEY ("tenant_id"))`);
        await queryRunner.query(`CREATE TABLE "organization_units" ("unit_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_id" uuid NOT NULL, "parent_unit_id" uuid, "unit_kind" character varying NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_7eae4243340daa20e6f49902dd9" PRIMARY KEY ("unit_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."workspaces_lifecycle_state_enum" AS ENUM('DRAFT', 'ACTIVE', 'ARCHIVED', 'RESTORED', 'CLOSED')`);
        await queryRunner.query(`CREATE TABLE "workspaces" ("workspace_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenant_id" uuid NOT NULL, "bound_organization_unit_id" uuid, "lifecycle_state" "public"."workspaces_lifecycle_state_enum" NOT NULL DEFAULT 'DRAFT', "name" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_5caa470396a1512cf146272e60f" PRIMARY KEY ("workspace_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."tenant_memberships_status_enum" AS ENUM('ACTIVE', 'PAUSED', 'REMOVED')`);
        await queryRunner.query(`CREATE TABLE "tenant_memberships" ("person_id" uuid NOT NULL, "tenant_id" uuid NOT NULL, "status" "public"."tenant_memberships_status_enum" NOT NULL DEFAULT 'ACTIVE', "joined_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_e132fd99c48915dc7ae088d7a6c" PRIMARY KEY ("person_id", "tenant_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."workspace_memberships_status_enum" AS ENUM('ACTIVE', 'PAUSED', 'REMOVED')`);
        await queryRunner.query(`CREATE TABLE "workspace_memberships" ("person_id" uuid NOT NULL, "workspace_id" uuid NOT NULL, "status" "public"."workspace_memberships_status_enum" NOT NULL DEFAULT 'ACTIVE', "joined_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_196108fc223e371edb5a0cda811" PRIMARY KEY ("person_id", "workspace_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."role_assignments_source_enum" AS ENUM('SELF_SERVE', 'INVITED', 'DELEGATED', 'AGENCY')`);
        await queryRunner.query(`CREATE TYPE "public"."role_assignments_status_enum" AS ENUM('ACTIVE', 'EXPIRED', 'REVOKED')`);
        await queryRunner.query(`CREATE TABLE "role_assignments" ("role_assignment_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "person_id" uuid NOT NULL, "tenant_id" uuid NOT NULL, "workspace_id" uuid, "unit_id" uuid, "object_id" uuid, "role_key" character varying NOT NULL, "source" "public"."role_assignments_source_enum" NOT NULL, "granted_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "expires_at" TIMESTAMP WITH TIME ZONE, "delegation_ref" character varying, "status" "public"."role_assignments_status_enum" NOT NULL DEFAULT 'ACTIVE', CONSTRAINT "PK_9aa37f8369ed4ff3c8834fe2c5e" PRIMARY KEY ("role_assignment_id"))`);
        await queryRunner.query(`CREATE TABLE "billing_accounts" ("billing_account_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "payer_person_or_org_id" uuid NOT NULL, "funds_tenant_ids" uuid array NOT NULL DEFAULT '{}', CONSTRAINT "PK_b9c8f78ce7da6bb288adbe3a6c2" PRIMARY KEY ("billing_account_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."brand_bindings_bound_type_enum" AS ENUM('ORGANIZATION', 'TENANT', 'SCOPED_PRODUCT')`);
        await queryRunner.query(`CREATE TABLE "brand_bindings" ("binding_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "bound_type" "public"."brand_bindings_bound_type_enum" NOT NULL, "bound_id" uuid NOT NULL, "domain" character varying NOT NULL, "tenant_id" uuid NOT NULL, CONSTRAINT "UQ_42d6d960a4a5abd59f6fa3180b3" UNIQUE ("domain"), CONSTRAINT "PK_ef33ce61e6934541f42d1bc2056" PRIMARY KEY ("binding_id"))`);
        await queryRunner.query(`CREATE TABLE "federated_references" ("federated_reference_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "local_tenant_or_entity_id" uuid NOT NULL, "external_platform" character varying NOT NULL, "external_entity_id" character varying NOT NULL, "relation_kind" character varying NOT NULL, "scope" jsonb NOT NULL, "authority_ref" character varying NOT NULL, "version" integer NOT NULL DEFAULT '1', "sync_state" character varying NOT NULL, "retention_until" TIMESTAMP WITH TIME ZONE, "revoked_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_ddb0814c618a81f5b822a86604e" PRIMARY KEY ("federated_reference_id"))`);
        await queryRunner.query(`CREATE TABLE "state_machine_definitions" ("machine_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "family_key" character varying NOT NULL, "version" integer NOT NULL DEFAULT '1', "owner_domain" character varying NOT NULL, "initial_state" character varying NOT NULL, "terminal_states" jsonb NOT NULL, "actors_capabilities" jsonb NOT NULL DEFAULT '{}', CONSTRAINT "PK_8c9f37165cd0efc0ebc4d37b03f" PRIMARY KEY ("machine_id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_50a33f47410e88bd8c06f1cdf0" ON "state_machine_definitions"  ("family_key", "version") `);
        await queryRunner.query(`CREATE TABLE "transition_definitions" ("transition_def_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "machine_id" uuid NOT NULL, "from_state" character varying NOT NULL, "to_state" character varying NOT NULL, "guards" jsonb NOT NULL DEFAULT '{}', "evidence_requirements" jsonb NOT NULL DEFAULT '{}', "approval_policy_ref" uuid, "timers_events" jsonb NOT NULL DEFAULT '{}', "side_effects" jsonb NOT NULL DEFAULT '{}', "idempotency_policy" jsonb NOT NULL DEFAULT '{}', "timeout_retry_compensation" jsonb NOT NULL DEFAULT '{}', CONSTRAINT "PK_07e2370fbb46ba0d4dd1cc7677a" PRIMARY KEY ("transition_def_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."transition_attempts_result_enum" AS ENUM('SUCCESS', 'VALIDATION_FAILED', 'AUTHORITY_FAILED', 'PRECONDITION_FAILED', 'VERSION_CONFLICT', 'DUPLICATE', 'APPROVAL_FAILED', 'EVIDENCE_FAILED', 'POLICY_FAILED', 'KILL_SWITCH', 'DEPENDENCY_FAILED', 'PROVIDER_FAILED', 'TIMEOUT', 'EXTERNAL_UNKNOWN', 'PARTIAL', 'COMPENSATION', 'MANUAL_REVIEW')`);
        await queryRunner.query(`CREATE TABLE "transition_attempts" ("attempt_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "object_type" character varying NOT NULL, "object_id" character varying NOT NULL, "transition_def_id" uuid NOT NULL, "expected_version" integer NOT NULL, "actor_ref" character varying NOT NULL, "authority_ref" character varying, "correlation_id" character varying NOT NULL, "causation_id" character varying, "idempotency_key" character varying NOT NULL, "result" "public"."transition_attempts_result_enum" NOT NULL, "attempted_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_027f2f5ddec73cd3554bd4a3d57" PRIMARY KEY ("attempt_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_79c1110fa3e4cc36ec08047260" ON "transition_attempts"  ("object_type", "object_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_d922cb1910862f21157c1bb641" ON "transition_attempts"  ("object_type", "object_id", "idempotency_key") `);
        await queryRunner.query(`CREATE TYPE "public"."approvals_decision_enum" AS ENUM('PENDING', 'APPROVED', 'DENIED', 'EXPIRED')`);
        await queryRunner.query(`CREATE TABLE "approvals" ("approval_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "bound_payload_version" character varying NOT NULL, "required_role" character varying NOT NULL, "deadline" TIMESTAMP WITH TIME ZONE NOT NULL, "decision" "public"."approvals_decision_enum" NOT NULL DEFAULT 'PENDING', CONSTRAINT "PK_8c8da9e9f72fb8d1adf757b8cb9" PRIMARY KEY ("approval_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."transition_repair_queue_issue_kind_enum" AS ENUM('STUCK', 'UNKNOWN', 'MISSING', 'DUPLICATE', 'SIDE_EFFECT', 'VERSION', 'COMPENSATION')`);
        await queryRunner.query(`CREATE TABLE "transition_repair_queue" ("repair_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "object_type" character varying NOT NULL, "object_id" character varying NOT NULL, "issue_kind" "public"."transition_repair_queue_issue_kind_enum" NOT NULL, "authorized_command_ref" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "resolved_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_ef0a147d370f902af303e5e2f1c" PRIMARY KEY ("repair_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_9cab52f1ca7c215f339a5077b2" ON "transition_repair_queue"  ("object_type", "object_id") `);
        await queryRunner.query(`CREATE TABLE "state_machine_object_state" ("object_type" character varying NOT NULL, "object_id" character varying NOT NULL, "machine_id" uuid NOT NULL, "current_state" character varying NOT NULL, "current_version" integer NOT NULL DEFAULT '0', "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_761c5a24049512fb7fbf67814e4" PRIMARY KEY ("object_type", "object_id"))`);
        await queryRunner.query(`ALTER TABLE "accounts" ADD CONSTRAINT "FK_cecdd107ca499a5b3279f9f2cea" FOREIGN KEY ("person_id") REFERENCES "people"("person_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "accounts" DROP CONSTRAINT "FK_cecdd107ca499a5b3279f9f2cea"`);
        await queryRunner.query(`DROP TABLE "state_machine_object_state"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9cab52f1ca7c215f339a5077b2"`);
        await queryRunner.query(`DROP TABLE "transition_repair_queue"`);
        await queryRunner.query(`DROP TYPE "public"."transition_repair_queue_issue_kind_enum"`);
        await queryRunner.query(`DROP TABLE "approvals"`);
        await queryRunner.query(`DROP TYPE "public"."approvals_decision_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d922cb1910862f21157c1bb641"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_79c1110fa3e4cc36ec08047260"`);
        await queryRunner.query(`DROP TABLE "transition_attempts"`);
        await queryRunner.query(`DROP TYPE "public"."transition_attempts_result_enum"`);
        await queryRunner.query(`DROP TABLE "transition_definitions"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_50a33f47410e88bd8c06f1cdf0"`);
        await queryRunner.query(`DROP TABLE "state_machine_definitions"`);
        await queryRunner.query(`DROP TABLE "federated_references"`);
        await queryRunner.query(`DROP TABLE "brand_bindings"`);
        await queryRunner.query(`DROP TYPE "public"."brand_bindings_bound_type_enum"`);
        await queryRunner.query(`DROP TABLE "billing_accounts"`);
        await queryRunner.query(`DROP TABLE "role_assignments"`);
        await queryRunner.query(`DROP TYPE "public"."role_assignments_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."role_assignments_source_enum"`);
        await queryRunner.query(`DROP TABLE "workspace_memberships"`);
        await queryRunner.query(`DROP TYPE "public"."workspace_memberships_status_enum"`);
        await queryRunner.query(`DROP TABLE "tenant_memberships"`);
        await queryRunner.query(`DROP TYPE "public"."tenant_memberships_status_enum"`);
        await queryRunner.query(`DROP TABLE "workspaces"`);
        await queryRunner.query(`DROP TYPE "public"."workspaces_lifecycle_state_enum"`);
        await queryRunner.query(`DROP TABLE "organization_units"`);
        await queryRunner.query(`DROP TABLE "tenants"`);
        await queryRunner.query(`DROP TYPE "public"."tenants_lifecycle_state_enum"`);
        await queryRunner.query(`DROP TYPE "public"."tenants_tenant_kind_enum"`);
        await queryRunner.query(`DROP TABLE "organizations"`);
        await queryRunner.query(`DROP TYPE "public"."organizations_org_kind_enum"`);
        await queryRunner.query(`DROP TABLE "accounts"`);
        await queryRunner.query(`DROP TYPE "public"."accounts_status_enum"`);
        await queryRunner.query(`DROP TABLE "people"`);
        await queryRunner.query(`DROP TYPE "public"."people_status_enum"`);
    }

}
