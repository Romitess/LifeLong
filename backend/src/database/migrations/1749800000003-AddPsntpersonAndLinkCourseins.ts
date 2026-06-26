import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPsntpersonAndLinkCourseins1749800000003 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    // 1. เพิ่ม PSNTPERSON records สำหรับ teach6-10 (ใช้ MOCKT007-011 ที่ยังว่าง)
    await queryRunner.query(`
      INSERT INTO PSNTPERSON (PSN_ID, PRF_NAMETH, PSN_FNAMETH, PSN_LNAMETH)
      VALUES
        ('MOCKT007', 'อาจารย์', 'วิชัย',     'ศรีสุวรรณ'),
        ('MOCKT008', 'อาจารย์', 'นันทนา',    'เกษมสุข'),
        ('MOCKT009', 'อาจารย์', 'ประสิทธิ์', 'พันธุ์รัตน์'),
        ('MOCKT010', 'อาจารย์', 'กาญจนา',   'อุดมพร'),
        ('MOCKT011', 'อาจารย์', 'สมพงษ์',   'ชัยวัฒน์')
    `);

    // 2. link PSN_ID = MOCKT001 (สมชาย ใจดี) สำหรับ course ที่ยังเป็น NULL
    await queryRunner.query(`
      UPDATE LLTCOURSEINS
      SET PSN_ID = 'MOCKT001'
      WHERE COSE_ID IN (157, 167, 168, 172, 173)
        AND COSEINS_ADMIN = 'Y'
        AND PSN_ID IS NULL
    `);

    // 3. link PSN_ID สำหรับ teach6 (วิชัย ศรีสุวรรณ) — COSE_ID 127, 128
    await queryRunner.query(`
      UPDATE LLTCOURSEINS
      SET PSN_ID = 'MOCKT007'
      WHERE COSE_ID IN (127, 128)
        AND COSEINS_ADMIN = 'Y'
        AND PSN_ID IS NULL
    `);

    // 4. link PSN_ID สำหรับ teach7 (นันทนา เกษมสุข) — COSE_ID 129, 130, 131, 132
    await queryRunner.query(`
      UPDATE LLTCOURSEINS
      SET PSN_ID = 'MOCKT008'
      WHERE COSE_ID IN (129, 130, 131, 132)
        AND COSEINS_ADMIN = 'Y'
        AND PSN_ID IS NULL
    `);

    // 5. link PSN_ID สำหรับ teach8 (ประสิทธิ์ พันธุ์รัตน์) — COSE_ID 133, 134, 135
    await queryRunner.query(`
      UPDATE LLTCOURSEINS
      SET PSN_ID = 'MOCKT009'
      WHERE COSE_ID IN (133, 134, 135)
        AND COSEINS_ADMIN = 'Y'
        AND PSN_ID IS NULL
    `);

    // 6. link PSN_ID สำหรับ teach9 (กาญจนา อุดมพร) — COSE_ID 136, 137
    await queryRunner.query(`
      UPDATE LLTCOURSEINS
      SET PSN_ID = 'MOCKT010'
      WHERE COSE_ID IN (136, 137)
        AND COSEINS_ADMIN = 'Y'
        AND PSN_ID IS NULL
    `);

    // 7. link PSN_ID สำหรับ teach10 (สมพงษ์ ชัยวัฒน์) — COSE_ID 138, 139
    await queryRunner.query(`
      UPDATE LLTCOURSEINS
      SET PSN_ID = 'MOCKT011'
      WHERE COSE_ID IN (138, 139)
        AND COSEINS_ADMIN = 'Y'
        AND PSN_ID IS NULL
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE LLTCOURSEINS
      SET PSN_ID = NULL
      WHERE COSE_ID IN (127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 157, 167, 168, 172, 173)
        AND COSEINS_ADMIN = 'Y'
        AND PSN_ID IN ('MOCKT001', 'MOCKT007', 'MOCKT008', 'MOCKT009', 'MOCKT010', 'MOCKT011')
    `);

    await queryRunner.query(`
      DELETE FROM PSNTPERSON
      WHERE PSN_ID IN ('MOCKT007', 'MOCKT008', 'MOCKT009', 'MOCKT010', 'MOCKT011')
    `);
  }
}
