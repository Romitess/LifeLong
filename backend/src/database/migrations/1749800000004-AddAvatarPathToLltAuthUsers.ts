import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAvatarPathToLltAuthUsers1749800000004 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE LLT_AUTH_USERS
        ADD COLUMN AVATAR_PATH VARCHAR(255) NULL AFTER UPDATEDATE
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE LLT_AUTH_USERS
        DROP COLUMN AVATAR_PATH
    `);
  }
}
