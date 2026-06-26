import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLayoutToLlttemplatecertificate1748900000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE LLTTEMPLATECERTIFICATE
        ADD COLUMN TEMP_LAYOUT JSON NULL AFTER TEMP_KEY
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE LLTTEMPLATECERTIFICATE
        DROP COLUMN TEMP_LAYOUT
    `);
  }
}
