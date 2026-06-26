import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIconColorToLltcategory1748400000003 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE LLTCATEGORY
        ADD COLUMN CATEGORY_ICON  VARCHAR(100) NULL AFTER CATEGORY_URL,
        ADD COLUMN CATEGORY_COLOR VARCHAR(7)   NULL AFTER CATEGORY_ICON
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE LLTCATEGORY
        DROP COLUMN CATEGORY_COLOR,
        DROP COLUMN CATEGORY_ICON
    `);
  }
}
