import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLltcertificate1748400000001 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS LLTCERTIFICATE (
        CER_ID         INT          NOT NULL AUTO_INCREMENT,
        ENROLL_ID      INT          NOT NULL,
        CERT_CODE      VARCHAR(100) NOT NULL,
        CERT_PATH      VARCHAR(500) NULL,
        CERT_URL       VARCHAR(500) NULL,
        TEMP_ID        INT          NULL,
        SIGN_ID        INT          NULL,
        CERT_ISSUEDATE DATETIME     NULL,
        CREATEDATE     DATETIME     DEFAULT NOW(),
        UPDATEDATE     DATETIME     DEFAULT NOW() ON UPDATE NOW(),
        PRIMARY KEY (CER_ID),
        UNIQUE KEY uq_enroll (ENROLL_ID),
        UNIQUE KEY uq_code   (CERT_CODE)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS LLTCERTIFICATE`);
  }
}
