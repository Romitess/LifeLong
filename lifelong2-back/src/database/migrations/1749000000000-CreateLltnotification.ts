import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLltnotification1749000000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS LLTNOTIFICATION (
        NOTIF_ID      INT          NOT NULL AUTO_INCREMENT,
        USER_ID       INT          NOT NULL,
        NOTIF_TYPE    VARCHAR(50)  NOT NULL DEFAULT 'announcement',
        NOTIF_TITLE   VARCHAR(255) NOT NULL,
        NOTIF_MESSAGE TEXT         NOT NULL,
        REF_ID        INT          NULL,
        REF_TYPE      VARCHAR(50)  NULL,
        IS_READ       TINYINT(1)   NOT NULL DEFAULT 0,
        CREATEDATE    DATETIME     DEFAULT NOW(),
        PRIMARY KEY (NOTIF_ID),
        KEY idx_notif_user (USER_ID),
        KEY idx_notif_user_read (USER_ID, IS_READ)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS LLTNOTIFICATION`);
  }
}
