import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixInstructorEmailInLltcourseins1749800000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    // 1. แก้ชื่อไทยและชื่อ EN ใน LLTUMUSER ให้เป็น "สมชาย ใจดี" / "Somchai Jaidee"
    await queryRunner.query(`
      UPDATE LLTUMUSER
      SET
        USER_FNAMETH = 'สมชาย',
        USER_LNAMETH = 'ใจดี',
        USER_FNAMEEN = 'Somchai',
        USER_LNAMEEN = 'Jaidee'
      WHERE USER_EMAIL = 'instructor@example.com'
    `);

    // 2. แก้ COSEINS_EMAIL ใน LLTCOURSEINS สำหรับ COSE_ID 7-11
    //    จาก 'teach@go.buu.ac.th' (ไม่มีใน LLTUMUSER) → 'instructor@example.com'
    await queryRunner.query(`
      UPDATE LLTCOURSEINS
      SET COSEINS_EMAIL = 'instructor@example.com'
      WHERE COSE_ID IN (7, 8, 9, 10, 11)
        AND COSEINS_EMAIL = 'teach@go.buu.ac.th'
        AND COSEINS_ADMIN = 'Y'
    `);

    // 3. แก้ COSEINS_EMAIL ที่เก็บ username 'instructor_test' แทน email จริง
    //    สำหรับ COSE_ID 157, 167, 168, 172, 173
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

    await queryRunner.query(`
      UPDATE LLTCOURSEINS
      SET COSEINS_EMAIL = 'teach@go.buu.ac.th'
      WHERE COSE_ID IN (7, 8, 9, 10, 11)
        AND COSEINS_EMAIL = 'instructor@example.com'
        AND COSEINS_ADMIN = 'Y'
    `);

    await queryRunner.query(`
      UPDATE LLTUMUSER
      SET
        USER_FNAMETH = 'อาจารย์ทดสอบ',
        USER_LNAMETH = 'ระบบผู้สอน',
        USER_FNAMEEN = 'INSTRUCTOR',
        USER_LNAMEEN = 'TEST'
      WHERE USER_EMAIL = 'instructor@example.com'
    `);
  }
}
