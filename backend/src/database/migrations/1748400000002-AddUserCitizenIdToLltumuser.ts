import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserCitizenIdToLltumuser1748400000002 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE LLTUMUSER
        ADD COLUMN USER_CITIZEN_ID VARCHAR(13) NULL AFTER USER_CODE,
        ADD UNIQUE KEY uq_lltumuser_citizen_id (USER_CITIZEN_ID)
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE LLTUMUSER
        DROP KEY uq_lltumuser_citizen_id,
        DROP COLUMN USER_CITIZEN_ID
    `);
  }
}
