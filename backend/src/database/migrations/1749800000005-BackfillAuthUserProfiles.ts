import { MigrationInterface, QueryRunner } from 'typeorm';

export class BackfillAuthUserProfiles1749800000005 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE LLT_AUTH_USERS
      SET ROLE = 'central_finance'
      WHERE LOWER(REPLACE(REPLACE(ROLE, ' ', '_'), '-', '_')) = 'central_finance'
        AND ROLE <> 'central_finance'
    `);

    await queryRunner.query(`
      INSERT INTO LLTUMUSER (
        USER_FNAMETH,
        USER_LNAMETH,
        USER_FNAMEEN,
        USER_LNAMEEN,
        USER_USERNAME,
        USER_EMAIL,
        USER_PASSWORD,
        USER_STATUS,
        CREATEUSER,
        CREATEDATE
      )
      SELECT
        COALESCE(
          NULLIF(TRIM((
            SELECT p.PSN_FNAMETH
            FROM PSNTPERSON p
            WHERE LOWER(p.PSN_EMAIL) = LOWER(a.EMAIL)
            LIMIT 1
          )), ''),
          CASE
            WHEN LOWER(REPLACE(REPLACE(a.ROLE, ' ', '_'), '-', '_')) = 'admin'
              THEN 'ผู้ดูแล'
            WHEN LOWER(REPLACE(REPLACE(a.ROLE, ' ', '_'), '-', '_')) = 'finance'
              THEN 'เจ้าหน้าที่การเงิน'
            WHEN LOWER(REPLACE(REPLACE(a.ROLE, ' ', '_'), '-', '_')) = 'central_finance'
              THEN 'เจ้าหน้าที่การเงินส่วนกลาง'
            WHEN LOWER(REPLACE(REPLACE(a.ROLE, ' ', '_'), '-', '_')) IN ('instructor', 'teach')
              THEN 'อาจารย์'
            ELSE 'ผู้เรียน'
          END
        ),
        COALESCE(
          NULLIF(TRIM((
            SELECT p.PSN_LNAMETH
            FROM PSNTPERSON p
            WHERE LOWER(p.PSN_EMAIL) = LOWER(a.EMAIL)
            LIMIT 1
          )), ''),
          CASE
            WHEN LOWER(REPLACE(REPLACE(a.ROLE, ' ', '_'), '-', '_')) IN ('instructor', 'teach')
              THEN 'ผู้สอน'
            ELSE 'ระบบ'
          END
        ),
        CASE
          WHEN LOWER(REPLACE(REPLACE(a.ROLE, ' ', '_'), '-', '_')) = 'admin' THEN 'SYSTEM'
          WHEN LOWER(REPLACE(REPLACE(a.ROLE, ' ', '_'), '-', '_')) = 'finance' THEN 'FINANCE'
          WHEN LOWER(REPLACE(REPLACE(a.ROLE, ' ', '_'), '-', '_')) = 'central_finance'
            THEN 'CENTRAL FINANCE'
          WHEN LOWER(REPLACE(REPLACE(a.ROLE, ' ', '_'), '-', '_')) IN ('instructor', 'teach')
            THEN 'INSTRUCTOR'
          ELSE 'STUDENT'
        END,
        CASE
          WHEN LOWER(REPLACE(REPLACE(a.ROLE, ' ', '_'), '-', '_')) = 'admin'
            THEN 'ADMINISTRATOR'
          WHEN LOWER(REPLACE(REPLACE(a.ROLE, ' ', '_'), '-', '_')) IN ('finance', 'central_finance')
            THEN 'OFFICER'
          ELSE 'USER'
        END,
        a.USERNAME,
        a.EMAIL,
        a.PASSWORD,
        'A',
        'MIGRATE_PROFILE_LINK',
        COALESCE(a.CREATEDATE, NOW())
      FROM LLT_AUTH_USERS a
      WHERE NOT EXISTS (
        SELECT 1
        FROM LLTUMUSER u
        WHERE LOWER(u.USER_USERNAME) = LOWER(a.USERNAME)
           OR LOWER(u.USER_EMAIL) = LOWER(a.EMAIL)
      )
    `);

    await queryRunner.query(`
      UPDATE LLTUMUSER u
      INNER JOIN LLT_AUTH_USERS a
        ON LOWER(u.USER_USERNAME) = LOWER(a.USERNAME)
        OR LOWER(u.USER_EMAIL) = LOWER(a.EMAIL)
      SET
        u.USER_FNAMETH = CASE
          WHEN LOWER(a.USERNAME) = 'finance1' THEN 'กิตติยา'
          WHEN LOWER(a.USERNAME) = 'finance2' THEN 'ธนพร'
          WHEN LOWER(a.USERNAME) = 'finance3' THEN 'ปวีณา'
          WHEN LOWER(a.USERNAME) = 'finance4' THEN 'ณัฐชา'
          WHEN LOWER(a.USERNAME) = 'finance5' THEN 'สุภาวดี'
          WHEN LOWER(a.USERNAME) = 'finance6' THEN 'พิมพ์ชนก'
          WHEN LOWER(a.USERNAME) = 'student_test' THEN 'สมปอง'
          WHEN LOWER(a.USERNAME) = 'bcrypt_test' THEN 'ผู้ทดสอบ'
          WHEN LOWER(a.USERNAME) = 'verify_test' THEN 'ผู้ตรวจสอบ'
          WHEN LOWER(a.USERNAME) = 'test.admin2' THEN 'ผู้ดูแล'
          WHEN LOWER(a.USERNAME) = 'test.finance' THEN 'เจ้าหน้าที่การเงิน'
          WHEN LOWER(a.USERNAME) = 'test.centralfinance'
            THEN 'เจ้าหน้าที่การเงินส่วนกลาง'
          WHEN LOWER(a.USERNAME) = 'test.instructor' THEN 'อาจารย์'
          WHEN LOWER(a.USERNAME) = 'test.staff' THEN 'บุคลากร'
          WHEN LOWER(a.USERNAME) = 'test.alumni' THEN 'ศิษย์เก่า'
          WHEN LOWER(a.USERNAME) = 'test.general' THEN 'ผู้ใช้งาน'
          ELSE 'ผู้เรียน'
        END,
        u.USER_LNAMETH = CASE
          WHEN LOWER(a.USERNAME) = 'finance1' THEN 'วัฒนากุล'
          WHEN LOWER(a.USERNAME) = 'finance2' THEN 'ศรีสกุล'
          WHEN LOWER(a.USERNAME) = 'finance3' THEN 'จันทร์งาม'
          WHEN LOWER(a.USERNAME) = 'finance4' THEN 'บุญช่วย'
          WHEN LOWER(a.USERNAME) = 'finance5' THEN 'รัตนชัย'
          WHEN LOWER(a.USERNAME) = 'finance6' THEN 'แสงทอง'
          WHEN LOWER(a.USERNAME) = 'student_test' THEN 'ใจดี'
          WHEN LOWER(a.USERNAME) = 'bcrypt_test' THEN 'รหัสผ่าน'
          ELSE 'ระบบทดสอบ'
        END,
        u.USER_FNAMEEN = CASE
          WHEN LOWER(a.USERNAME) = 'finance1' THEN 'KITTIYA'
          WHEN LOWER(a.USERNAME) = 'finance2' THEN 'THANAPORN'
          WHEN LOWER(a.USERNAME) = 'finance3' THEN 'PAWEENA'
          WHEN LOWER(a.USERNAME) = 'finance4' THEN 'NATCHA'
          WHEN LOWER(a.USERNAME) = 'finance5' THEN 'SUPAWADEE'
          WHEN LOWER(a.USERNAME) = 'finance6' THEN 'PHIMCHANOK'
          WHEN LOWER(a.USERNAME) = 'student_test' THEN 'SOMPONG'
          ELSE 'TEST'
        END,
        u.USER_LNAMEEN = CASE
          WHEN LOWER(a.USERNAME) = 'finance1' THEN 'WATTANAKUL'
          WHEN LOWER(a.USERNAME) = 'finance2' THEN 'SRISAKUN'
          WHEN LOWER(a.USERNAME) = 'finance3' THEN 'CHANNGAM'
          WHEN LOWER(a.USERNAME) = 'finance4' THEN 'BOONCHUAY'
          WHEN LOWER(a.USERNAME) = 'finance5' THEN 'RATTANACHAI'
          WHEN LOWER(a.USERNAME) = 'finance6' THEN 'SAENGTHONG'
          WHEN LOWER(a.USERNAME) = 'student_test' THEN 'JAIDEE'
          WHEN LOWER(a.USERNAME) = 'bcrypt_test' THEN 'PASSWORD TESTER'
          WHEN LOWER(a.USERNAME) = 'verify_test' THEN 'VERIFY TESTER'
          WHEN LOWER(a.USERNAME) = 'test.admin2' THEN 'ADMINISTRATOR'
          WHEN LOWER(a.USERNAME) = 'test.finance' THEN 'FINANCE OFFICER'
          WHEN LOWER(a.USERNAME) = 'test.centralfinance' THEN 'CENTRAL FINANCE'
          WHEN LOWER(a.USERNAME) = 'test.instructor' THEN 'INSTRUCTOR'
          WHEN LOWER(a.USERNAME) = 'test.staff' THEN 'STAFF'
          WHEN LOWER(a.USERNAME) = 'test.alumni' THEN 'ALUMNI'
          WHEN LOWER(a.USERNAME) = 'test.general' THEN 'GENERAL USER'
          ELSE 'STUDENT'
        END
      WHERE LOWER(a.USERNAME) IN (
        'finance1',
        'finance2',
        'finance3',
        'finance4',
        'finance5',
        'finance6',
        'student_test',
        'bcrypt_test',
        'verify_test',
        'test.student',
        'test.staff',
        'test.alumni',
        'test.general',
        'test.instructor',
        'test.admin2',
        'test.finance',
        'test.centralfinance'
      )
    `);
  }

  async down(): Promise<void> {
    // Data migration is intentionally irreversible because linked profiles may gain user data.
  }
}
