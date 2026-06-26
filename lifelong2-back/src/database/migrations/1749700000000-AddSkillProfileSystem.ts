import { MigrationInterface, QueryRunner } from 'typeorm';

interface ColumnExistsRow {
  cnt: number | string;
}

export class AddSkillProfileSystem1749700000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Clear old LLTSKILL data and insert 5 new OECD Learning Compass 2030 skills
    //    We truncate first to ensure clean state, then re-insert
    await queryRunner.query(`DELETE FROM LLTCOURSESKILL`);
    await queryRunner.query(`DELETE FROM LLTSKILL`);
    await queryRunner.query(`ALTER TABLE LLTSKILL AUTO_INCREMENT = 1`);

    await queryRunner.query(`
      INSERT INTO LLTSKILL (SKILL_ID, SKILL_NAME) VALUES
        (1, 'Critical Thinking'),
        (2, 'Creativity'),
        (3, 'Practical Skill'),
        (4, 'Collaboration'),
        (5, 'Self Learning')
    `);

    // 2. Add SKILL_WEIGHT column to LLTCOURSESKILL (idempotent)
    const weightExists = (await queryRunner.query(`
      SELECT COUNT(*) AS cnt
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME   = 'LLTCOURSESKILL'
        AND COLUMN_NAME  = 'SKILL_WEIGHT'
    `)) as ColumnExistsRow[];
    if (Number(weightExists[0]?.cnt ?? 0) === 0) {
      await queryRunner.query(`
        ALTER TABLE \`LLTCOURSESKILL\`
        ADD COLUMN \`SKILL_WEIGHT\` DECIMAL(5,2) NOT NULL DEFAULT 0.00
        COMMENT 'Weight percentage of this skill in the course (0-100)'
      `);
    }

    // 3. Create LLTUSER_SKILL table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`LLTUSER_SKILL\` (
        \`USER_ID\`     INT            NOT NULL,
        \`SKILL_ID\`    TINYINT        NOT NULL,
        \`SKILL_SCORE\` DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
        \`CREATEUSER\`  VARCHAR(100)   NULL,
        \`CREATEDATE\`  DATETIME       DEFAULT NOW(),
        \`UPDATEUSER\`  VARCHAR(100)   NULL,
        \`UPDATEDATE\`  DATETIME       DEFAULT NOW() ON UPDATE NOW(),
        PRIMARY KEY (\`USER_ID\`, \`SKILL_ID\`),
        KEY \`idx_user_skill_user\` (\`USER_ID\`),
        KEY \`idx_user_skill_skill\` (\`SKILL_ID\`),
        CONSTRAINT \`fk_userskill_user\`  FOREIGN KEY (\`USER_ID\`)  REFERENCES \`LLTUMUSER\`(\`USER_ID\`) ON DELETE CASCADE,
        CONSTRAINT \`fk_userskill_skill\` FOREIGN KEY (\`SKILL_ID\`) REFERENCES \`LLTSKILL\`(\`SKILL_ID\`)  ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    // Drop LLTUSER_SKILL
    await queryRunner.query(`DROP TABLE IF EXISTS \`LLTUSER_SKILL\``);

    // Remove SKILL_WEIGHT from LLTCOURSESKILL
    const weightExists = (await queryRunner.query(`
      SELECT COUNT(*) AS cnt
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME   = 'LLTCOURSESKILL'
        AND COLUMN_NAME  = 'SKILL_WEIGHT'
    `)) as ColumnExistsRow[];
    if (Number(weightExists[0]?.cnt ?? 0) > 0) {
      await queryRunner.query(`ALTER TABLE \`LLTCOURSESKILL\` DROP COLUMN \`SKILL_WEIGHT\``);
    }
  }
}
