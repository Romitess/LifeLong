import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixInstructorThaiNameInLltumuser1749800000002 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    // แก้ชื่อไทยใน LLTUMUSER จาก "อาจารย์ทดสอบ ระบบผู้สอน" เป็น "สมชาย ใจดี"
    await queryRunner.query(`
      UPDATE LLTUMUSER
      SET
        USER_FNAMETH = 'สมชาย',
        USER_LNAMETH = 'ใจดี'
      WHERE USER_EMAIL = 'instructor@example.com'
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE LLTUMUSER
      SET
        USER_FNAMETH = 'อาจารย์ทดสอบ',
        USER_LNAMETH = 'ระบบผู้สอน'
      WHERE USER_EMAIL = 'instructor@example.com'
    `);
  }
}
