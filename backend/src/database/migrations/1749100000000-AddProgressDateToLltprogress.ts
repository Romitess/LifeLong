import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProgressDateToLltprogress1749100000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE LLTPROGRESS
        ADD COLUMN IF NOT EXISTS PROGRESS_DATE DATETIME NULL
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE LLTPROGRESS DROP COLUMN IF EXISTS PROGRESS_DATE
    `);
  }
}
