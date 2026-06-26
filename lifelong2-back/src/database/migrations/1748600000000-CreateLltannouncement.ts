import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLltannouncement1748600000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS LLTANNOUNCEMENT (
        ANNC_ID       INT          NOT NULL AUTO_INCREMENT,
        COSE_ID       INT          NOT NULL,
        ANNC_TITLE    VARCHAR(255) NOT NULL,
        ANNC_CONTENT  TEXT         NOT NULL,
        CREATEUSER    VARCHAR(100) NULL,
        CREATEDATE    DATETIME     DEFAULT NOW(),
        UPDATEUSER    VARCHAR(100) NULL,
        UPDATEDATE    DATETIME     NULL ON UPDATE NOW(),
        PRIMARY KEY (ANNC_ID),
        KEY idx_annc_cose (COSE_ID)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS LLTANNOUNCEMENT`);
  }
}
