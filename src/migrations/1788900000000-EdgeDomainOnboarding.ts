import { MigrationInterface, QueryRunner } from "typeorm";

export class EdgeDomainOnboarding1788900000000 implements MigrationInterface {
    name = 'EdgeDomainOnboarding1788900000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // NOTE: migration:generate's diff repeatedly proposes dropping
        // "CHK_access_restrictions_precedence_1_or_2" and re-adding it
        // unchanged — a generator artifact, not a real schema change.
        // Spurious DROP/ADD pair removed here, same fix applied to every
        // migration since XD-007/008.
        //
        // NOTE 2: the generator also proposed re-setting
        // "allowances"."thresholds_percent"'s default to the same array
        // with different JSON whitespace — a formatting artifact, not an
        // actual value change (same as BuilderBlueprintEngine1788800000000).
        // Removed here for the same reason.
        await queryRunner.query(`CREATE TYPE "public"."domain_verifications_verification_method_enum" AS ENUM('DNS_TXT_RECORD', 'DNS_CNAME_RECORD')`);
        await queryRunner.query(`CREATE TYPE "public"."domain_verifications_status_enum" AS ENUM('PROPOSED', 'DNS_CHECK_PENDING', 'VERIFIED', 'TLS_PROVISIONING', 'ACTIVE', 'FAILED', 'REVOKED')`);
        await queryRunner.query(`CREATE TABLE "domain_verifications" ("domain_verification_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenant_id" uuid NOT NULL, "requested_domain" character varying NOT NULL, "verification_method" "public"."domain_verifications_verification_method_enum" NOT NULL, "verification_token" character varying NOT NULL, "dns_evidence" jsonb, "tls_evidence" jsonb, "status" "public"."domain_verifications_status_enum" NOT NULL DEFAULT 'PROPOSED', "requested_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "verified_at" TIMESTAMP WITH TIME ZONE, "activated_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_a3bd85bc69de0bf1c61342e4f36" PRIMARY KEY ("domain_verification_id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "domain_verifications"`);
        await queryRunner.query(`DROP TYPE "public"."domain_verifications_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."domain_verifications_verification_method_enum"`);
    }

}
