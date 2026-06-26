import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddImageCropToLltcourse1748700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE LLTCOURSE ADD COLUMN COSE_IMAGE_CROP VARCHAR(512) NULL DEFAULT NULL AFTER COSE_IMAGE_URL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE LLTCOURSE DROP COLUMN COSE_IMAGE_CROP`);
  }
}
