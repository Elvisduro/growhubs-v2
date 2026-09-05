import { MigrationInterface, QueryRunner } from 'typeorm';

/** Required for uuid_generate_v4(), used as the default for every PK in
 * this schema. Runs before InitPf011Plt005. */
export class EnableUuidExtension1788574000000 implements MigrationInterface {
  name = 'EnableUuidExtension1788574000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp"`);
  }
}
