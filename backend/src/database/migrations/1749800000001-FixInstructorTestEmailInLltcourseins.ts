import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixInstructorTestEmailInLltcourseins1749800000001 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    // แก้ COSEINS_EMAIL ที่เก็บ username 'instructor_test' แทน email จริง
    // สำหรับ COSE_ID 157, 167, 168, 172, 173
    await queryRunner.query(`
      UPDATE LLTCOURSEINS
      SET COSEINS_EMAIL = 'instructor@example.com'
      WHERE COSE_ID IN (157, 167, 168, 172, 173)
        AND COSEINS_EMAIL = 'instructor_test'
        AND COSEINS_ADMIN = 'Y'
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE LLTCOURSEINS
      SET COSEINS_EMAIL = 'instructor_test'
      WHERE COSE_ID IN (157, 167, 168, 172, 173)
        AND COSEINS_EMAIL = 'instructor@example.com'
        AND COSEINS_ADMIN = 'Y'
    `);
  }
}
