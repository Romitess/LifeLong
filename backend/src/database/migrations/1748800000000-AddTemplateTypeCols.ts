import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTemplateTypeCols1748800000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE LLTTEMPLATECERTIFICATE
        ADD COLUMN TEMP_TYPE VARCHAR(20) NOT NULL DEFAULT 'image' AFTER TEMP_STATUS,
        ADD COLUMN TEMP_KEY  VARCHAR(100) NULL                    AFTER TEMP_TYPE
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE LLTTEMPLATECERTIFICATE
        DROP COLUMN TEMP_KEY,
        DROP COLUMN TEMP_TYPE
    `);
  }
}
