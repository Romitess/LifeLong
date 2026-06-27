import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProfileImageUrlToLltumuser1749800000004 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    const columns = (await queryRunner.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'LLTUMUSER'
        AND COLUMN_NAME = 'USER_IMAGE_URL'
    `)) as Array<{ COLUMN_NAME: string }>;

    if (columns.length === 0) {
      await queryRunner.query(`
        ALTER TABLE LLTUMUSER
          ADD COLUMN USER_IMAGE_URL VARCHAR(2048) NULL AFTER USER_CITIZEN_ID
      `);
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    const columns = (await queryRunner.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'LLTUMUSER'
        AND COLUMN_NAME = 'USER_IMAGE_URL'
    `)) as Array<{ COLUMN_NAME: string }>;

    if (columns.length > 0) {
      await queryRunner.query(`
        ALTER TABLE LLTUMUSER
          DROP COLUMN USER_IMAGE_URL
      `);
    }
  }
}
