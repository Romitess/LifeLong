import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLltprogress1748400000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS LLTPROGRESS (
        PROGRESS_ID    INT          NOT NULL AUTO_INCREMENT,
        ENROLL_ID      INT          NOT NULL,
        COSESUBCHAP_ID INT          NOT NULL,
        PROGRESS_STATUS VARCHAR(20) NOT NULL DEFAULT 'completed',
        PROGRESS_DATE  DATETIME     NULL,
        CREATEDATE     DATETIME     DEFAULT NOW(),
        UPDATEDATE     DATETIME     DEFAULT NOW() ON UPDATE NOW(),
        PRIMARY KEY (PROGRESS_ID),
        UNIQUE KEY uq_enroll_subchap (ENROLL_ID, COSESUBCHAP_ID)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS LLTPROGRESS`);
  }
}
