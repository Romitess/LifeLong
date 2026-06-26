import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNameEnToLltcategory1749500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE LLTCATEGORY
      ADD COLUMN CATEGORY_NAME_EN VARCHAR(255) NULL COMMENT 'English name of the category'
      AFTER CATEGORY_NAME
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE LLTCATEGORY DROP COLUMN CATEGORY_NAME_EN
    `);
  }
}
