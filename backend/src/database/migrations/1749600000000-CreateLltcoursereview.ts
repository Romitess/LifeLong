import { MigrationInterface, QueryRunner } from 'typeorm';

interface ColumnExistsRow {
  cnt: number | string;
}

export class CreateLltcoursereview1749600000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create LLTCOURSEREVIEW table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`LLTCOURSEREVIEW\` (
        \`REVIEW_ID\`      INT           NOT NULL AUTO_INCREMENT,
        \`COSE_ID\`        INT           NOT NULL,
        \`USER_ID\`        INT           NOT NULL,
        \`ENROLL_ID\`      INT           NULL,
        \`REVIEW_RATING\`  TINYINT       NOT NULL,
        \`REVIEW_COMMENT\` VARCHAR(1000) NULL,
        \`REVIEW_STATUS\`  ENUM('A', 'P', 'H') NOT NULL DEFAULT 'A',
        \`CREATEUSER\`     VARCHAR(100)  NULL,
        \`CREATEDATE\`     DATETIME      DEFAULT NOW(),
        \`UPDATEUSER\`     VARCHAR(100)  NULL,
        \`UPDATEDATE\`     DATETIME      DEFAULT NOW() ON UPDATE NOW(),
        PRIMARY KEY (\`REVIEW_ID\`),
        UNIQUE KEY \`uq_course_user\` (\`COSE_ID\`, \`USER_ID\`),
        KEY \`idx_course_status\` (\`COSE_ID\`, \`REVIEW_STATUS\`),
        CONSTRAINT \`fk_review_course\`  FOREIGN KEY (\`COSE_ID\`)   REFERENCES \`LLTCOURSE\`(\`COSE_ID\`)   ON DELETE CASCADE,
        CONSTRAINT \`fk_review_user\`    FOREIGN KEY (\`USER_ID\`)   REFERENCES \`LLTUMUSER\`(\`USER_ID\`)   ON DELETE CASCADE,
        CONSTRAINT \`fk_review_enroll\`  FOREIGN KEY (\`ENROLL_ID\`) REFERENCES \`LLTENROLL\`(\`ENROLL_ID\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 2. Idempotently add COSE_RATINGAVG to LLTCOURSE
    const avgExists = (await queryRunner.query(`
      SELECT COUNT(*) AS cnt
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME   = 'LLTCOURSE'
        AND COLUMN_NAME  = 'COSE_RATINGAVG'
    `)) as ColumnExistsRow[];
    if (Number(avgExists[0]?.cnt ?? 0) === 0) {
      await queryRunner.query(`
        ALTER TABLE \`LLTCOURSE\`
        ADD COLUMN \`COSE_RATINGAVG\` DECIMAL(3,2) NOT NULL DEFAULT 0.00
      `);
    }

    // 3. Idempotently add COSE_RATINGCOUNT to LLTCOURSE
    const cntExists = (await queryRunner.query(`
      SELECT COUNT(*) AS cnt
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME   = 'LLTCOURSE'
        AND COLUMN_NAME  = 'COSE_RATINGCOUNT'
    `)) as ColumnExistsRow[];
    if (Number(cntExists[0]?.cnt ?? 0) === 0) {
      await queryRunner.query(`
        ALTER TABLE \`LLTCOURSE\`
        ADD COLUMN \`COSE_RATINGCOUNT\` INT NOT NULL DEFAULT 0
      `);
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    // Remove cache columns first (IF EXISTS guard via information_schema)
    const cntExists = (await queryRunner.query(`
      SELECT COUNT(*) AS cnt
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME   = 'LLTCOURSE'
        AND COLUMN_NAME  = 'COSE_RATINGCOUNT'
    `)) as ColumnExistsRow[];
    if (Number(cntExists[0]?.cnt ?? 0) > 0) {
      await queryRunner.query(`ALTER TABLE \`LLTCOURSE\` DROP COLUMN \`COSE_RATINGCOUNT\``);
    }

    const avgExists = (await queryRunner.query(`
      SELECT COUNT(*) AS cnt
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME   = 'LLTCOURSE'
        AND COLUMN_NAME  = 'COSE_RATINGAVG'
    `)) as ColumnExistsRow[];
    if (Number(avgExists[0]?.cnt ?? 0) > 0) {
      await queryRunner.query(`ALTER TABLE \`LLTCOURSE\` DROP COLUMN \`COSE_RATINGAVG\``);
    }

    await queryRunner.query(`DROP TABLE IF EXISTS \`LLTCOURSEREVIEW\``);
  }
}
