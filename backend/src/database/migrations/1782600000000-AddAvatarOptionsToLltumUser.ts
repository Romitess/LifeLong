import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAvatarOptionsToLltumUser1782600000000 implements MigrationInterface {
  name = 'AddAvatarOptionsToLltumUser1782600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`LLTUMUSER\`
      ADD \`AVATAR_OPTIONS_JSON\` text NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`LLTUMUSER\`
      DROP COLUMN \`AVATAR_OPTIONS_JSON\`
    `);
  }
}
