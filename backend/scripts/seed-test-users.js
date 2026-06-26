/**
 * seed-test-users.js
 *
 * Seeds test users for development/testing
 * Required env vars: SEED_USER_PASSWORD, SEED_DB_PASSWORD
 *
 * 1. สร้าง test users ครบทุกสิทธิ์ (นิสิต / บุคลากร / ศิษย์เก่า / ทั่วไป)
 * 2. Seed USER_CITIZEN_ID ใน LLTUMUSER ให้ทุก user ที่ยังไม่มี
 * 3. Seed LLTPRIVILEGE ให้ตรงกับสิทธิ์
 *
 * Usage:  npm run seed:test-users
 *
 * ⚠ DEV/TEST ONLY — ห้ามรันบน production
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { loadEnv } = require('./load-env');
const { getEnv } = require('./utils/env-validator');

loadEnv();

const PASSWORD = getEnv('SEED_USER_PASSWORD', { sensitive: true });
const BCRYPT_ROUNDS = 12;

function genThaiCitizenId() {
  const digits = [1 + Math.floor(Math.random() * 8)];
  for (let i = 1; i < 12; i++) digits.push(Math.floor(Math.random() * 10));
  const sum = digits.reduce((acc, d, i) => acc + d * (13 - i), 0);
  digits.push((11 - (sum % 11)) % 10);
  return digits.join('');
}

async function isCitizenIdTaken(conn, citizenId) {
  const [rows] = await conn.execute(
    'SELECT 1 FROM LLTUMUSER WHERE USER_CITIZEN_ID = ? LIMIT 1',
    [citizenId],
  );
  return rows.length > 0;
}

async function uniqueCitizenId(conn) {
  let id;
  do { id = genThaiCitizenId(); } while (await isCitizenIdTaken(conn, id));
  return id;
}

async function main() {
  const conn = await mysql.createConnection({
    host: getEnv('SEED_DB_HOST', { fallback: 'localhost' }),
    port: Number(getEnv('SEED_DB_PORT', { fallback: 3306 })),
    user: getEnv('SEED_DB_USER', { fallback: 'root' }),
    password: getEnv('SEED_DB_PASSWORD', { sensitive: true }),
    database: getEnv('SEED_DB_NAME', { fallback: 'lifelong2' }),
  });

  try {
    const hashed = await bcrypt.hash(PASSWORD, BCRYPT_ROUNDS);

    // ─── 1. ดึง STUTYPE_ID จริงจาก DB ───────────────────────────────────────
    const [stutypes] = await conn.execute(
      "SELECT STUTYPE_ID, STUTYPE_NAME FROM LLTTYPESTUDENT WHERE STUTYPE_STATUS = 'Y' ORDER BY STUTYPE_ID",
    );
    console.log('\nSTUTYPE ที่มีในระบบ:');
    stutypes.forEach(s => console.log(`  [${s.STUTYPE_ID}] ${s.STUTYPE_NAME}`));

    const findStutype = (keyword) =>
      stutypes.find(s => s.STUTYPE_NAME.includes(keyword))?.STUTYPE_ID ?? null;

    const STUTYPE = {
      student: findStutype('นิสิต'),
      staff:   findStutype('บุคลากร'),
      alumni:  findStutype('ศิษย์เก่า'),
      general: findStutype('ทั่วไป'),
    };
    console.log('Mapping:', STUTYPE);

    // ─── 2. Test users ที่ต้องการสร้าง ──────────────────────────────────────
    const testUsers = [
      {
        username: 'test.student',
        email: 'test.student@buu.ac.th',
        firstNameTh: 'ทดสอบ', lastNameTh: 'นิสิต',
        firstNameEn: 'TEST', lastNameEn: 'STUDENT',
        role: 'Student',
        stutypeId: STUTYPE.student,
        addToStaff: false,
      },
      {
        username: 'test.staff',
        email: 'test.staff@buu.ac.th',
        firstNameTh: 'ทดสอบ', lastNameTh: 'บุคลากร',
        firstNameEn: 'TEST', lastNameEn: 'STAFF',
        role: 'Student',
        stutypeId: STUTYPE.staff,
        addToStaff: true, // เพิ่มใน PSNTPERSON เพื่อ auto-detect
      },
      {
        username: 'test.alumni',
        email: 'test.alumni@buu.ac.th',
        firstNameTh: 'ทดสอบ', lastNameTh: 'ศิษย์เก่า',
        firstNameEn: 'TEST', lastNameEn: 'ALUMNI',
        role: 'Student',
        stutypeId: STUTYPE.alumni,
        addToStaff: false,
      },
      {
        username: 'test.general',
        email: 'test.general@buu.ac.th',
        firstNameTh: 'ทดสอบ', lastNameTh: 'ทั่วไป',
        firstNameEn: 'TEST', lastNameEn: 'GENERAL',
        role: 'Student',
        stutypeId: null, // ไม่มีสิทธิ์
        addToStaff: false,
      },
      {
        username: 'test.instructor',
        email: 'test.instructor@buu.ac.th',
        firstNameTh: 'ทดสอบ', lastNameTh: 'ผู้สอน',
        firstNameEn: 'TEST', lastNameEn: 'INSTRUCTOR',
        role: 'Instructor',
        stutypeId: STUTYPE.staff,
        addToStaff: true,
      },
      {
        username: 'test.admin2',
        email: 'test.admin2@buu.ac.th',
        firstNameTh: 'ทดสอบ', lastNameTh: 'แอดมิน',
        firstNameEn: 'TEST', lastNameEn: 'ADMIN',
        role: 'Admin',
        stutypeId: STUTYPE.staff,
        addToStaff: false,
      },
    ];

    console.log('\n─── สร้าง test users ──────────────────────────────────────');
    for (const u of testUsers) {
      // เช็ค duplicate email
      const [dup] = await conn.execute(
        'SELECT USER_ID FROM LLT_AUTH_USERS WHERE EMAIL = ? LIMIT 1', [u.email],
      );
      if (dup.length > 0) {
        console.log(`  SKIP (ซ้ำ): ${u.email}`);
        continue;
      }

      const citizenId = await uniqueCitizenId(conn);

      // Insert LLT_AUTH_USERS
      const [authRes] = await conn.execute(
        `INSERT INTO LLT_AUTH_USERS (USERNAME, EMAIL, PASSWORD, ROLE, CREATEUSER, CREATEDATE)
         VALUES (?, ?, ?, ?, 'seed', NOW())`,
        [u.username, u.email, hashed, u.role],
      );
      const authId = authRes.insertId;

      // Insert LLTUMUSER
      const [umRes] = await conn.execute(
        `INSERT INTO LLTUMUSER
           (USER_FNAMETH, USER_LNAMETH, USER_FNAMEEN, USER_LNAMEEN,
            USER_USERNAME, USER_EMAIL, USER_PASSWORD, USER_STATUS,
            USER_CITIZEN_ID, CREATEUSER, CREATEDATE)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'A', ?, 'seed', NOW())`,
        [u.firstNameTh, u.lastNameTh, u.firstNameEn, u.lastNameEn,
         u.username, u.email, hashed, citizenId],
      );
      const umId = umRes.insertId;

      // Insert LLTPRIVILEGE ถ้ามีสิทธิ์
      if (u.stutypeId) {
        await conn.execute(
          `INSERT INTO LLTPRIVILEGE (USER_ID, STUTYPE_ID, USER_CITIZEN, CREATEUSER, CREATEDATE, UPDATEPROG)
           VALUES (?, ?, ?, 'seed', NOW(), 'seed-test-users.js')
           ON DUPLICATE KEY UPDATE USER_CITIZEN = VALUES(USER_CITIZEN)`,
          [umId, u.stutypeId, citizenId],
        );
      }

      // เพิ่มใน PSNTPERSON สำหรับ staff auto-detect
      if (u.addToStaff) {
        const [psnDup] = await conn.execute(
          'SELECT 1 FROM PSNTPERSON WHERE PSN_EMAIL = ? LIMIT 1', [u.email],
        );
        if (!psnDup.length) {
          await conn.execute(
            `INSERT INTO PSNTPERSON
               (PSN_ID, PSN_FNAMETH, PSN_LNAMETH, PSN_EMAIL, PSN_IDCARD,
                PSN_RETIRE, FAC_NAMETH, IMPORTDATE)
             VALUES (?, ?, ?, ?, ?, 'N', 'คณะทดสอบ', NOW())`,
            [`T${String(umId).padStart(7,'0')}`, u.firstNameTh, u.lastNameTh,
             u.email, citizenId],
          );
        }
      }

      const stutypeName = stutypes.find(s => s.STUTYPE_ID === u.stutypeId)?.STUTYPE_NAME ?? 'ทั่วไป';
      console.log(`  ✓ ${u.email} [${u.role}] → ${stutypeName} | citizenId: ${citizenId}`);
    }

    // ─── 3. Seed USER_CITIZEN_ID ให้ทุก user ที่ยังไม่มี ────────────────────
    console.log('\n─── Seed USER_CITIZEN_ID ให้ users ที่ยังไม่มี ──────────────');
    const [usersWithout] = await conn.execute(
      "SELECT u.USER_ID, u.USER_EMAIL FROM LLTUMUSER u WHERE u.USER_CITIZEN_ID IS NULL AND u.USER_STATUS = 'A' LIMIT 50",
    );

    let updated = 0;
    for (const u of usersWithout) {
      const citizenId = await uniqueCitizenId(conn);
      await conn.execute(
        'UPDATE LLTUMUSER SET USER_CITIZEN_ID = ? WHERE USER_ID = ?',
        [citizenId, u.USER_ID],
      );

      // ถ้ามีแถวใน LLTPRIVILEGE ที่ยังไม่มี USER_CITIZEN → อัปด้วย
      await conn.execute(
        'UPDATE LLTPRIVILEGE SET USER_CITIZEN = ? WHERE USER_ID = ? AND (USER_CITIZEN IS NULL OR USER_CITIZEN = "")',
        [citizenId, u.USER_ID],
      );
      updated++;
    }
    console.log(`  อัป USER_CITIZEN_ID ให้ ${updated} users`);

    // ─── 4. Summary ──────────────────────────────────────────────────────────
    console.log('\n─── สรุป users ที่พร้อมทดสอบ ──────────────────────────────');
    const [summary] = await conn.execute(`
      SELECT u.USER_EMAIL, a.ROLE, u.USER_CITIZEN_ID,
             s.STUTYPE_NAME,
             CASE WHEN p.PSN_EMAIL IS NOT NULL THEN 'Y' ELSE 'N' END AS in_psntperson
      FROM LLTUMUSER u
      JOIN LLT_AUTH_USERS a ON LOWER(a.EMAIL) = LOWER(u.USER_EMAIL)
      LEFT JOIN LLTPRIVILEGE pr ON pr.USER_ID = u.USER_ID
      LEFT JOIN LLTTYPESTUDENT s ON s.STUTYPE_ID = pr.STUTYPE_ID
      LEFT JOIN PSNTPERSON p ON LOWER(p.PSN_EMAIL) = LOWER(u.USER_EMAIL)
      WHERE u.USER_EMAIL LIKE 'test.%'
      ORDER BY u.USER_ID
    `);

    console.log('\n  Email                         | Role       | STUTYPE       | PSNTPERSON');
    console.log('  ' + '-'.repeat(72));
    summary.forEach(r => {
      const stype = r.STUTYPE_NAME ?? '(ทั่วไป)';
      console.log(`  ${r.USER_EMAIL.padEnd(30)} | ${r.ROLE.padEnd(10)} | ${stype.padEnd(13)} | ${r.in_psntperson}`);
    });

    console.log(`\n  รหัสผ่านทุก account: ${PASSWORD}`);
    console.log('Done.');

  } finally {
    await conn.end();
  }
}

main().catch(err => { console.error('Seed failed:', err.message); process.exit(1); });
