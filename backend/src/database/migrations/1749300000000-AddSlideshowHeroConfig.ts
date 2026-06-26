import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSlideshowHeroConfig1749300000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    // Per-slide rich config + grouping/order on the existing LLTSLIDESHOW table.
    // SLIDE_LAYOUT mirrors LLTTEMPLATECERTIFICATE.TEMP_LAYOUT (JSON => longtext utf8mb4_bin on MariaDB).
    await queryRunner.query(`
      ALTER TABLE LLTSLIDESHOW
        ADD COLUMN IF NOT EXISTS SLIDE_GROUP varchar(100) NOT NULL DEFAULT 'main' AFTER SLIDE_URL,
        ADD COLUMN IF NOT EXISTS SLIDE_ORDER int(11) NOT NULL DEFAULT 0 AFTER SLIDE_GROUP,
        ADD COLUMN IF NOT EXISTS SLIDE_LAYOUT JSON NULL AFTER SLIDE_ORDER
    `);

    // Global (per slideshow group) animation/timing config.
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS LLTSLIDESHOWCONFIG (
        CONFIG_ID int(11) NOT NULL AUTO_INCREMENT,
        CONFIG_KEY varchar(100) NOT NULL,
        SLIDE_DURATION_MS int(11) NULL,
        INITIAL_DELAY_MS int(11) NULL,
        CREATEUSER varchar(100) NULL,
        CREATEDATE datetime NULL,
        UPDATEUSER varchar(100) NULL,
        UPDATEDATE datetime NULL,
        UPDATEPROG varchar(100) NULL,
        PRIMARY KEY (CONFIG_ID),
        UNIQUE KEY UQ_LLTSLIDESHOWCONFIG_KEY (CONFIG_KEY)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS LLTSLIDESHOWCONFIG`);
    await queryRunner.query(`
      ALTER TABLE LLTSLIDESHOW
        DROP COLUMN IF EXISTS SLIDE_LAYOUT,
        DROP COLUMN IF EXISTS SLIDE_ORDER,
        DROP COLUMN IF EXISTS SLIDE_GROUP
    `);
  }
}
