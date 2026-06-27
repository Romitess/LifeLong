import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFacNameEnToLltfaculty1749900000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE LLTFACULTY
      ADD COLUMN FAC_NAMEEN VARCHAR(255) NULL COMMENT 'English name of the faculty'
      AFTER FAC_NAME
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE LLTFACULTY DROP COLUMN FAC_NAMEEN
    `);
  }
}
