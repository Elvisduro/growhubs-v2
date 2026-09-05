import { MigrationInterface, QueryRunner } from "typeorm";

export class XD007XD008AuthorityAccess1788575488341 implements MigrationInterface {
    name = 'XD007XD008AuthorityAccess1788575488341'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."action_capabilities_risk_ceiling_enum" AS ENUM('A0', 'A1', 'A2', 'A3', 'A4')`);
        await queryRunner.query(`CREATE TYPE "public"."action_capabilities_reversibility_class_enum" AS ENUM('REVERSIBLE', 'COMPENSATABLE', 'PARTIALLY_REVERSIBLE', 'EXTERNALLY_IRREVERSIBLE', 'LEGALLY_OR_FINANCIALLY_BINDING')`);
        await queryRunner.query(`CREATE TABLE "action_capabilities" ("capability_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "capability_version" integer NOT NULL DEFAULT '1', "owner_domain" character varying NOT NULL, "action_name" character varying NOT NULL, "allowed_targets" jsonb NOT NULL, "permissions_required" jsonb NOT NULL DEFAULT '{}', "risk_ceiling" "public"."action_capabilities_risk_ceiling_enum" NOT NULL, "reversibility_class" "public"."action_capabilities_reversibility_class_enum" NOT NULL, "side_effects" jsonb NOT NULL DEFAULT '{}', "evidence_requirement" character varying, "approval_requirement" uuid, "budget_ceiling" jsonb NOT NULL DEFAULT '{}', "idempotency_contract" character varying NOT NULL, "compensation_contract" character varying, "prohibited_contexts" jsonb NOT NULL DEFAULT '{}', "provider_or_tool" character varying, CONSTRAINT "PK_07fdb0dd1fde5bd53e00d35f9b7" PRIMARY KEY ("capability_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."approval_policies_trigger_enum" AS ENUM('EVERY_ACTION', 'AMOUNT_THRESHOLD', 'VOLUME_THRESHOLD', 'AUDIENCE_THRESHOLD', 'TEMPLATE_THRESHOLD', 'NAMED_ROLE', 'TWO_PERSON', 'SAFEGUARDING', 'LEGAL_FINANCE_SECURITY')`);
        await queryRunner.query(`CREATE TABLE "approval_policies" ("policy_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "trigger" "public"."approval_policies_trigger_enum" NOT NULL, "threshold_value" jsonb, "required_approver_role" character varying, "expiry" interval NOT NULL, CONSTRAINT "PK_7a09afb99a617c2e6cc0ac6378f" PRIMARY KEY ("policy_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."authority_grants_risk_ceiling_enum" AS ENUM('A0', 'A1', 'A2', 'A3', 'A4')`);
        await queryRunner.query(`CREATE TYPE "public"."authority_grants_revocation_state_enum" AS ENUM('ACTIVE', 'SUSPENDED', 'REVOKED', 'EXPIRED')`);
        await queryRunner.query(`CREATE TABLE "authority_grants" ("grant_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "principal_person_id" uuid NOT NULL, "delegated_agent" character varying NOT NULL, "tenant_id" uuid NOT NULL, "workspace_id" uuid, "role_id" uuid, "context" jsonb NOT NULL DEFAULT '{}', "capability_id" uuid NOT NULL, "capability_version" integer NOT NULL, "target_scope" jsonb NOT NULL, "permitted_actions" jsonb NOT NULL DEFAULT '{}', "prohibited_actions" jsonb NOT NULL DEFAULT '{}', "risk_ceiling" "public"."authority_grants_risk_ceiling_enum" NOT NULL, "limits" jsonb NOT NULL DEFAULT '{}', "evidence_confidence_floor" double precision, "approval_policy_id" uuid, "duration" interval, "expires_at" TIMESTAMP WITH TIME ZONE, "revocation_state" "public"."authority_grants_revocation_state_enum" NOT NULL DEFAULT 'ACTIVE', "fallback_behavior" character varying NOT NULL, "approvers" jsonb NOT NULL DEFAULT '{}', CONSTRAINT "PK_59ef4d0fdfb8e562d8a1a4a8318" PRIMARY KEY ("grant_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."aria_action_requests_reversibility_class_enum" AS ENUM('REVERSIBLE', 'COMPENSATABLE', 'PARTIALLY_REVERSIBLE', 'EXTERNALLY_IRREVERSIBLE', 'LEGALLY_OR_FINANCIALLY_BINDING')`);
        await queryRunner.query(`CREATE TYPE "public"."aria_action_requests_execution_state_enum" AS ENUM('PROPOSED', 'POLICY_CHECK', 'AWAITING_APPROVAL', 'APPROVED', 'REVALIDATING', 'EXECUTING', 'SUCCEEDED', 'OUTCOME_MONITORING', 'CLOSED', 'DENIED', 'EXPIRED', 'REVOKED', 'KILL_SWITCH_HALTED', 'EVIDENCE_INSUFFICIENT', 'SCOPE_EXCEEDED', 'FAILED', 'PARTIALLY_EXECUTED', 'EXTERNAL_OUTCOME_UNKNOWN', 'COMPENSATION_IN_PROGRESS', 'CORRECTED')`);
        await queryRunner.query(`CREATE TABLE "aria_action_requests" ("request_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "initiator" jsonb NOT NULL, "use_case" character varying NOT NULL, "capability_id" uuid NOT NULL, "grant_id" uuid, "target" jsonb NOT NULL, "change" jsonb NOT NULL, "sources" jsonb NOT NULL DEFAULT '{}', "uncertainty" jsonb NOT NULL DEFAULT '{}', "side_effects" jsonb NOT NULL DEFAULT '{}', "affected_people" jsonb NOT NULL DEFAULT '{}', "reversibility_class" "public"."aria_action_requests_reversibility_class_enum" NOT NULL, "compensation_plan" jsonb, "cost" jsonb NOT NULL DEFAULT '{}', "approvals" jsonb NOT NULL DEFAULT '[]', "idempotency_key" character varying NOT NULL, "execution_state" "public"."aria_action_requests_execution_state_enum" NOT NULL DEFAULT 'PROPOSED', "outcome" jsonb, CONSTRAINT "PK_11953415aa695fd66d25f8e5c60" PRIMARY KEY ("request_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b5d0f15046037e6e83cb3782a6" ON "aria_action_requests"  ("grant_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_ba7d93cd292c848eefe72ac172" ON "aria_action_requests"  ("capability_id") `);
        await queryRunner.query(`CREATE TABLE "access_policies" ("policy_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "version" integer NOT NULL DEFAULT '1', "scope" jsonb NOT NULL, "rule_body" jsonb NOT NULL, CONSTRAINT "PK_6d936efe59c6293743cb989c56d" PRIMARY KEY ("policy_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."access_grants_capability_enum" AS ENUM('DISCOVER', 'PREVIEW', 'VIEW', 'DOWNLOAD', 'INTERACT', 'SUBMIT', 'ASSESS', 'MODERATE', 'MANAGE', 'PUBLISH', 'SELL', 'BUY', 'EXPORT', 'SHARE', 'INVITE', 'GRANT', 'ANALYTICS', 'SENSITIVE', 'FINANCIAL', 'SUPERADMIN')`);
        await queryRunner.query(`CREATE TYPE "public"."access_grants_source_type_enum" AS ENUM('PUBLIC_ACCOUNT_CAPABILITY', 'TENANT_WORKSPACE_MEMBERSHIP', 'ORGANIZATION_OBJECT_ROLE', 'ENTITLEMENT', 'ENROLLMENT', 'COMMUNITY_MEMBERSHIP', 'REGISTRATION_TICKET', 'AGREEMENT_BOOKING', 'GROUP_COHORT', 'SPONSORED_SEAT', 'EXPLICIT_GRANT', 'GUARDIAN_REPRESENTATION', 'PLATFORM_AUTHORITY', 'FEDERATED_GRANT')`);
        await queryRunner.query(`CREATE TABLE "access_grants" ("grant_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "subject_person_id" uuid NOT NULL, "capability" "public"."access_grants_capability_enum" NOT NULL, "resource_ref" jsonb NOT NULL, "source_type" "public"."access_grants_source_type_enum" NOT NULL, "source_ref" jsonb NOT NULL, "context" jsonb NOT NULL DEFAULT '{}', "valid_from" TIMESTAMP WITH TIME ZONE, "expires_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_73ce05961918b65a3dd145d336c" PRIMARY KEY ("grant_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."access_restrictions_restriction_kind_enum" AS ENUM('MODERATION', 'ACCOUNT_SUSPENSION', 'MEMBERSHIP_REMOVAL', 'ACCESS_RESTRICTION', 'FINANCIAL_HOLD', 'LEGAL_SAFETY_HOLD')`);
        await queryRunner.query(`CREATE TABLE "access_restrictions" ("restriction_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "subject_person_id" uuid NOT NULL, "scope" jsonb NOT NULL, "restriction_kind" "public"."access_restrictions_restriction_kind_enum" NOT NULL, "precedence_position" smallint NOT NULL, "imposed_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "expires_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_adfcda97d27e244f21f75eff24a" PRIMARY KEY ("restriction_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."access_decisions_capability_enum" AS ENUM('DISCOVER', 'PREVIEW', 'VIEW', 'DOWNLOAD', 'INTERACT', 'SUBMIT', 'ASSESS', 'MODERATE', 'MANAGE', 'PUBLISH', 'SELL', 'BUY', 'EXPORT', 'SHARE', 'INVITE', 'GRANT', 'ANALYTICS', 'SENSITIVE', 'FINANCIAL', 'SUPERADMIN')`);
        await queryRunner.query(`CREATE TYPE "public"."access_decisions_result_enum" AS ENUM('ALLOW', 'DENY', 'CONDITIONAL', 'STEP_UP_REQUIRED', 'APPROVAL_REQUIRED', 'TEMPORARILY_UNAVAILABLE')`);
        await queryRunner.query(`CREATE TABLE "access_decisions" ("decision_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "subject_person_id" uuid NOT NULL, "capability" "public"."access_decisions_capability_enum" NOT NULL, "resource_ref" jsonb NOT NULL, "context" jsonb NOT NULL DEFAULT '{}', "evaluated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "result" "public"."access_decisions_result_enum" NOT NULL, "reason_code" character varying NOT NULL, "policy_versions_used" jsonb NOT NULL, CONSTRAINT "PK_c1040c693589f3b1889f4ea2653" PRIMARY KEY ("decision_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_40357ee537552402e57303084a" ON "access_decisions"  ("subject_person_id", "capability") `);
        // XD-008 §4 (XD-C0588/XD-C0589): precedence_position occupies ONLY
        // positions 1-2 of the 6-position resolution algorithm. Not
        // expressible as a TypeORM column decorator, so enforced here as a
        // raw CHECK — this is a real DB-level invariant, not a convention.
        await queryRunner.query(
          `ALTER TABLE "access_restrictions" ADD CONSTRAINT "CHK_access_restrictions_precedence_1_or_2" CHECK ("precedence_position" IN (1, 2))`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "access_restrictions" DROP CONSTRAINT "CHK_access_restrictions_precedence_1_or_2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_40357ee537552402e57303084a"`);
        await queryRunner.query(`DROP TABLE "access_decisions"`);
        await queryRunner.query(`DROP TYPE "public"."access_decisions_result_enum"`);
        await queryRunner.query(`DROP TYPE "public"."access_decisions_capability_enum"`);
        await queryRunner.query(`DROP TABLE "access_restrictions"`);
        await queryRunner.query(`DROP TYPE "public"."access_restrictions_restriction_kind_enum"`);
        await queryRunner.query(`DROP TABLE "access_grants"`);
        await queryRunner.query(`DROP TYPE "public"."access_grants_source_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."access_grants_capability_enum"`);
        await queryRunner.query(`DROP TABLE "access_policies"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ba7d93cd292c848eefe72ac172"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b5d0f15046037e6e83cb3782a6"`);
        await queryRunner.query(`DROP TABLE "aria_action_requests"`);
        await queryRunner.query(`DROP TYPE "public"."aria_action_requests_execution_state_enum"`);
        await queryRunner.query(`DROP TYPE "public"."aria_action_requests_reversibility_class_enum"`);
        await queryRunner.query(`DROP TABLE "authority_grants"`);
        await queryRunner.query(`DROP TYPE "public"."authority_grants_revocation_state_enum"`);
        await queryRunner.query(`DROP TYPE "public"."authority_grants_risk_ceiling_enum"`);
        await queryRunner.query(`DROP TABLE "approval_policies"`);
        await queryRunner.query(`DROP TYPE "public"."approval_policies_trigger_enum"`);
        await queryRunner.query(`DROP TABLE "action_capabilities"`);
        await queryRunner.query(`DROP TYPE "public"."action_capabilities_reversibility_class_enum"`);
        await queryRunner.query(`DROP TYPE "public"."action_capabilities_risk_ceiling_enum"`);
    }

}
