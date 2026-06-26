/* eslint-disable no-console */
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { loadEnv } = require('./load-env');
const { getEnv } = require('./utils/env-validator');

loadEnv();

const PASSWORD = getEnv('SEED_USER_PASSWORD', { sensitive: true });
const BCRYPT_ROUNDS = 12;

const moodleConfig = {
  host: getEnv('SEED_MOODLE_DB_HOST', { fallback: '127.0.0.1' }),
  port: Number(getEnv('SEED_MOODLE_DB_PORT', { fallback: 3307 })),
  user: getEnv('SEED_MOODLE_DB_USER', { fallback: 'bn_moodle' }),
  password: getEnv('SEED_MOODLE_DB_PASSWORD', { sensitive: true }),
  database: getEnv('SEED_MOODLE_DB_NAME', { fallback: 'LLLv.2' }),
};

const appConfig = {
  host: getEnv('SEED_APP_DB_HOST', { fallback: '127.0.0.1' }),
  port: Number(getEnv('SEED_APP_DB_PORT', { fallback: 3306 })),
  user: getEnv('SEED_APP_DB_USER', { fallback: 'root' }),
  password: getEnv('SEED_APP_DB_PASSWORD', { sensitive: true }),
  database: getEnv('SEED_APP_DB_NAME', { fallback: 'lifelong2' }),
};

const firstNamesTh = [
  'กนกพร',
  'กัลยา',
  'ขวัญชนก',
  'จิราภรณ์',
  'ชยพล',
  'ณัฐชา',
  'ณิชารีย์',
  'ทิวา',
  'ธนกฤต',
  'นภัสสร',
  'นิภาพร',
  'ปวริศา',
  'ปัณณธร',
  'พรชนก',
  'พิมพ์ชนก',
  'ภัทรพล',
  'มธุรส',
  'เมธาวี',
  'ยุพดี',
  'รวิภา',
  'ลลิตา',
  'วรเมธ',
  'วาสนา',
  'ศศิธร',
  'สิริกร',
  'สุภาวดี',
  'อภิญญา',
  'อรยา',
  'อัญชลี',
  'อิทธิพล',
];

const lastNamesTh = [
  'กิตติคุณ',
  'เกื้อกูล',
  'จันทร์สว่าง',
  'เจริญกิจ',
  'ชัยมงคล',
  'ดวงดี',
  'ตันติวัฒน์',
  'ถาวรสุข',
  'ทรัพย์รุ่งเรือง',
  'ไทยเจริญ',
  'นาคสวัสดิ์',
  'บัวทอง',
  'ปัญญาเลิศ',
  'พัฒนกิจ',
  'พูนศิริ',
  'มณีโชติ',
  'รุ่งเรือง',
  'เลิศวิทยา',
  'วรวุฒิ',
  'วัฒนพงศ์',
  'ศรีสมบัติ',
  'สุขสันต์',
  'สุทธิกุล',
  'แสงทอง',
  'อินทรา',
  'เอี่ยมอรุณ',
];

const firstNamesEn = [
  'Kanokporn',
  'Kallaya',
  'Khwanchanok',
  'Jiraporn',
  'Chayaphon',
  'Natcha',
  'Nicharee',
  'Tiwa',
  'Thanakrit',
  'Napassorn',
  'Nipaporn',
  'Pawarisa',
  'Pannathorn',
  'Pornchanok',
  'Pimchanok',
  'Phattharaphon',
  'Mathuros',
  'Methawee',
  'Yupadee',
  'Rawipa',
  'Lalita',
  'Woramet',
  'Wasana',
  'Sasithorn',
  'Sirikorn',
  'Supawadee',
  'Apinya',
  'Araya',
  'Anchalee',
  'Itthiphon',
];

const lastNamesEn = [
  'Kittikhun',
  'Kueakul',
  'Jansawang',
  'Charoenkij',
  'Chaimongkol',
  'Duangdee',
  'Tantiwat',
  'Thawornsuk',
  'Saprungrueang',
  'Thaicharoen',
  'Naksawat',
  'Buathong',
  'Panyalert',
  'Phatthanakit',
  'Poonsiri',
  'Maneechot',
  'Rungrueang',
  'Lertwitthaya',
  'Worawut',
  'Wattanaphong',
  'Srisombat',
  'Suksan',
  'Suttikun',
  'Saengthong',
  'Intra',
  'Iam-aroon',
];

function buildTargetCount(courseId) {
  return 40 + ((courseId * 7) % 16);
}

function buildLearnerProfile(course, index) {
  const firstIndex = (course.id + index) % firstNamesTh.length;
  const lastIndex = (course.id * 3 + index) % lastNamesTh.length;
  const studentId = `66${String(course.id).padStart(2, '0')}${String(index + 1).padStart(4, '0')}`;
  const username = `mdl_${course.shortname.toLowerCase()}_${String(index + 1).padStart(3, '0')}`;

  return {
    username,
    studentId,
    email: `${username}@demo.local`,
    phone: `08${String(course.id).padStart(2, '0')}${String(index + 1).padStart(6, '0')}`.slice(0, 10),
    firstNameTh: firstNamesTh[firstIndex],
    lastNameTh: lastNamesTh[lastIndex],
    firstNameEn: firstNamesEn[firstIndex],
    lastNameEn: lastNamesEn[lastIndex],
  };
}

async function upsertMoodleUser(connection, passwordHash, profile) {
  const [existing] = await connection.execute(
    'SELECT id FROM mdl_user WHERE username = ? LIMIT 1',
    [profile.username],
  );

  if (existing.length > 0) {
    const userId = existing[0].id;
    await connection.execute(
      `UPDATE mdl_user
       SET idnumber = ?, firstname = ?, lastname = ?, email = ?, phone1 = ?, timemodified = UNIX_TIMESTAMP()
       WHERE id = ?`,
      [
        profile.studentId,
        profile.firstNameTh,
        profile.lastNameTh,
        profile.email,
        profile.phone,
        userId,
      ],
    );
    return userId;
  }

  const [result] = await connection.execute(
    `INSERT INTO mdl_user (
       auth, confirmed, mnethostid, username, password, idnumber, firstname, lastname, email,
       phone1, institution, department, city, country, lang, timezone, firstaccess, lastaccess,
       lastlogin, currentlogin, lastip, mailformat, maildigest, maildisplay, autosubscribe,
       trackforums, timecreated, timemodified
     ) VALUES (
       'manual', 1, 1, ?, ?, ?, ?, ?, ?, ?, 'Burapha University', 'Lifelong Learning',
       'Chonburi', 'TH', 'th', '99', 0, 0, 0, 0, '', 1, 0, 2, 1, 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()
     )`,
    [
      profile.username,
      passwordHash,
      profile.studentId,
      profile.firstNameTh,
      profile.lastNameTh,
      profile.email,
      profile.phone,
    ],
  );

  return result.insertId;
}

async function ensureUserEnrolment(connection, enrolId, userId) {
  const [existing] = await connection.execute(
    'SELECT id FROM mdl_user_enrolments WHERE enrolid = ? AND userid = ? LIMIT 1',
    [enrolId, userId],
  );

  if (existing.length > 0) {
    await connection.execute(
      `UPDATE mdl_user_enrolments
       SET status = 0, timeend = 2147483647, timemodified = UNIX_TIMESTAMP()
       WHERE id = ?`,
      [existing[0].id],
    );
    return existing[0].id;
  }

  const [result] = await connection.execute(
    `INSERT INTO mdl_user_enrolments (
       status, enrolid, userid, timestart, timeend, modifierid, timecreated, timemodified
     ) VALUES (0, ?, ?, UNIX_TIMESTAMP(), 2147483647, 2, UNIX_TIMESTAMP(), UNIX_TIMESTAMP())`,
    [enrolId, userId],
  );
  return result.insertId;
}

async function ensureRoleAssignment(connection, roleId, contextId, userId, enrolId) {
  const [existing] = await connection.execute(
    'SELECT id FROM mdl_role_assignments WHERE roleid = ? AND contextid = ? AND userid = ? LIMIT 1',
    [roleId, contextId, userId],
  );

  if (existing.length > 0) {
    await connection.execute(
      `UPDATE mdl_role_assignments
       SET component = 'enrol_manual', itemid = ?, timemodified = UNIX_TIMESTAMP(), modifierid = 2
       WHERE id = ?`,
      [enrolId, existing[0].id],
    );
    return;
  }

  await connection.execute(
    `INSERT INTO mdl_role_assignments (
       roleid, contextid, userid, timemodified, modifierid, component, itemid, sortorder
     ) VALUES (?, ?, ?, UNIX_TIMESTAMP(), 2, 'enrol_manual', ?, 0)`,
    [roleId, contextId, userId, enrolId],
  );
}

async function upsertBackendUsers(connection, moodleUserId, profile, hashedPassword) {
  await connection.execute(
    `INSERT INTO LLT_AUTH_USERS (USERNAME, EMAIL, PASSWORD, ROLE, CREATEUSER, CREATEDATE, UPDATEUSER, UPDATEDATE)
     VALUES (?, ?, ?, 'Student', 'SEED_MOODLE', NOW(), 'SEED_MOODLE', NOW())
     ON DUPLICATE KEY UPDATE EMAIL = VALUES(EMAIL), ROLE = 'Student', UPDATEUSER = 'SEED_MOODLE', UPDATEDATE = NOW()`,
    [profile.studentId, profile.email, hashedPassword],
  );

  const [existing] = await connection.execute(
    'SELECT USER_ID AS id FROM LLTUMUSER WHERE USER_USERNAME = ? LIMIT 1',
    [profile.studentId],
  );

  if (existing.length > 0) {
    await connection.execute(
      `UPDATE LLTUMUSER
       SET USER_FNAMETH = ?, USER_LNAMETH = ?, USER_FNAMEEN = ?, USER_LNAMEEN = ?, USER_TEL = ?,
           USER_EMAIL = ?, LMS_ID = ?, USER_STATUS = 'A', UPDATEUSER = 'SEED_MOODLE', UPDATEDATE = NOW()
       WHERE USER_ID = ?`,
      [
        profile.firstNameTh,
        profile.lastNameTh,
        profile.firstNameEn,
        profile.lastNameEn,
        profile.phone,
        profile.email,
        moodleUserId,
        existing[0].id,
      ],
    );
    return;
  }

  await connection.execute(
    `INSERT INTO LLTUMUSER (
       USER_FNAMETH, USER_LNAMETH, USER_FNAMEEN, USER_LNAMEEN, USER_TEL, USER_USERNAME, USER_EMAIL,
       USER_PASSWORD, USER_STATUS, LMS_ID, CREATEUSER, CREATEDATE
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'A', ?, 'SEED_MOODLE', NOW())`,
    [
      profile.firstNameTh,
      profile.lastNameTh,
      profile.firstNameEn,
      profile.lastNameEn,
      profile.phone,
      profile.studentId,
      profile.email,
      hashedPassword,
      moodleUserId,
    ],
  );
}

async function main() {
  const moodle = await mysql.createConnection(moodleConfig);
  const app = await mysql.createConnection(appConfig);

  try {
    const [courses] = await moodle.execute(
      "SELECT id, shortname, fullname FROM mdl_course WHERE id <> 1 AND shortname <> 'moodle' ORDER BY id",
    );
    const [enrolments] = await moodle.execute(
      "SELECT id, courseid, roleid FROM mdl_enrol WHERE enrol = 'manual' AND status = 0",
    );
    const [contexts] = await moodle.execute(
      'SELECT id, instanceid FROM mdl_context WHERE contextlevel = 50',
    );
    const [passwordRows] = await moodle.execute(
      "SELECT password FROM mdl_user WHERE username = 'admin' LIMIT 1",
    );

    if (passwordRows.length === 0) {
      throw new Error('Admin password hash not found in Moodle.');
    }

    const enrolByCourseId = new Map(enrolments.map((row) => [row.courseid, row]));
    const contextByCourseId = new Map(contexts.map((row) => [row.instanceid, row.id]));
    const passwordHash = passwordRows[0].password;
    const backendPasswordHash = await bcrypt.hash(PASSWORD, BCRYPT_ROUNDS);

    let totalUsersSeeded = 0;
    let totalEnrolmentsSeeded = 0;

    for (const course of courses) {
      const enrol = enrolByCourseId.get(course.id);
      const contextId = contextByCourseId.get(course.id);

      if (!enrol || !contextId) {
        console.warn(`Skipping course ${course.shortname} because manual enrol/context is missing.`);
        continue;
      }

      const targetCount = buildTargetCount(course.id);

      for (let index = 0; index < targetCount; index += 1) {
        const profile = buildLearnerProfile(course, index);
        const moodleUserId = await upsertMoodleUser(moodle, passwordHash, profile);
        await ensureUserEnrolment(moodle, enrol.id, moodleUserId);
        await ensureRoleAssignment(moodle, enrol.roleid || 5, contextId, moodleUserId, enrol.id);
        await upsertBackendUsers(app, moodleUserId, profile, backendPasswordHash);
        totalUsersSeeded += 1;
        totalEnrolmentsSeeded += 1;
      }

      console.log(`Seeded ${targetCount} learners for ${course.shortname} (${course.fullname})`);
    }

    const [summary] = await moodle.execute(
      `SELECT c.shortname, COUNT(ue.id) AS enrolled_count
       FROM mdl_course c
       LEFT JOIN mdl_enrol e ON e.courseid = c.id AND e.enrol = 'manual'
       LEFT JOIN mdl_user_enrolments ue ON ue.enrolid = e.id AND ue.status = 0
       WHERE c.id <> 1 AND c.shortname <> 'moodle'
       GROUP BY c.id, c.shortname
       ORDER BY c.id`,
    );

    const [demoSummary] = await moodle.execute(
      `SELECT c.shortname, COUNT(ue.id) AS enrolled_count
       FROM mdl_course c
       LEFT JOIN mdl_enrol e ON e.courseid = c.id AND e.enrol = 'manual'
       LEFT JOIN mdl_user_enrolments ue ON ue.enrolid = e.id AND ue.status = 0
       LEFT JOIN mdl_user u ON u.id = ue.userid
       WHERE c.id <> 1
         AND c.shortname <> 'moodle'
         AND (u.username LIKE 'mdl\\_%' OR u.email LIKE '%@demo.local')
       GROUP BY c.id, c.shortname
       ORDER BY c.id`,
    );

    console.table(summary);
    console.table(demoSummary);
    console.log(`Done. Upserted ${totalUsersSeeded} learner profiles and ${totalEnrolmentsSeeded} enrolments.`);
  } finally {
    await moodle.end();
    await app.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
