/* eslint-disable no-console */
const mysql = require('mysql2/promise');
const { loadEnv, optionalEnv, requiredEnv } = require('./load-env');
const { exportMoodleSeed } = require('./export-moodle-seed');

loadEnv();

const SEED_USER = 'SEED_DEMO_LINKED';
const MIN_ENROLLED_PER_COURSE = Number(optionalEnv('DEMO_MIN_ENROLLED_PER_COURSE', 8));
const MOODLE_BASE_URL = requiredEnv('MOODLE_BASE_URL', 'MOODLE_URL').replace(/\/+$/, '');
const MOODLE_TOKEN = requiredEnv('MOODLE_TOKEN');

const moodleDbConfig = {
  host: optionalEnv('MOODLE_DB_HOST', '127.0.0.1'),
  port: Number(optionalEnv('MOODLE_DB_PORT', 3307)),
  user: optionalEnv('MOODLE_DB_USER', 'bn_moodle'),
  password: optionalEnv('MOODLE_DB_PASSWORD', 'moodle_password'),
  database: optionalEnv('MOODLE_DB_NAME', 'LLLv.2'),
};

const appDbConfig = {
  host: requiredEnv('DB_HOST'),
  port: Number(optionalEnv('DB_PORT', 3306)),
  user: requiredEnv('DB_USER'),
  password: requiredEnv('DB_PASSWORD'),
  database: requiredEnv('DB_NAME'),
};

const realisticCourseNames = new Map([
  [167, ['การวางแผนงบประมาณและแหล่งเงินสำหรับโครงการ', 'Project Budgeting and Funding Sources']],
  [
    168,
    ['การบริหารต้นทุนและรายรับสำหรับหลักสูตรอบรม', 'Training Course Cost and Revenue Management'],
  ],
  [
    174,
    [
      'การจัดทำเอกสารการเงินและใบเสร็จอิเล็กทรอนิกส์',
      'Financial Documents and E-Receipt Operations',
    ],
  ],
  [
    175,
    [
      'การใช้ระบบสารสนเทศสำหรับงานบริการวิชาการ',
      'Information Systems for Academic Service Operations',
    ],
  ],
  [176, ['การวิเคราะห์ข้อมูลพื้นฐานสำหรับงานวิทยาศาสตร์', 'Basic Data Analysis for Science Work']],
  [177, ['การออกแบบสื่อสร้างสรรค์เพื่อการเรียนรู้', 'Creative Media Design for Learning']],
  [178, ['การจัดการโครงการวิศวกรรมขนาดเล็ก', 'Small Engineering Project Management']],
  [
    179,
    [
      'การสื่อสารองค์กรและการเขียนรายงานเชิงวิชาชีพ',
      'Professional Corporate Communication and Reporting',
    ],
  ],
  [182, ['ทักษะดิจิทัลเพื่อการทำงานยุคใหม่', 'Digital Skills for Modern Work']],
  [183, ['การประยุกต์ใช้เครื่องมือ AI สำหรับงานประจำ', 'Applying AI Tools to Daily Work']],
]);

const realisticUserNames = new Map([
  ['verifytest001', ['ณิชารีย์', 'แก้วกาญจน์', 'Nicharee', 'Kaewkan']],
  ['bcrypt_test', ['ภูวดล', 'ตั้งเจริญ', 'Phuwadon', 'Tangcharoen']],
  ['verifytest1779873484', ['อรณิชา', 'วัฒนศิลป์', 'Oranicha', 'Wattanasin']],
  ['verify_test', ['ชุติมา', 'เกียรติไกร', 'Chutima', 'Kiatkrai']],
  ['test.student', ['ธนกฤต', 'พูนทรัพย์', 'Thanakrit', 'Poonsap']],
  ['test.staff', ['รัตนาภรณ์', 'สุขเกษม', 'Rattanaporn', 'Sukkasem']],
  ['test.alumni', ['ปัณณธร', 'ศรีวัฒน์', 'Pannathorn', 'Sriwat']],
  ['test.general', ['กัลยา', 'มณีโชติ', 'Kallaya', 'Maneechot']],
  ['test.instructor', ['วรากรณ์', 'สุวรรณศรี', 'Warakorn', 'Suwansri']],
  ['test.admin2', ['กนกวรรณ', 'ยอดแก้ว', 'Kanokwan', 'Yodkaew']],
  ['quiztest_906931', ['พิมพ์ชนก', 'จันทร์สว่าง', 'Pimchanok', 'Jansawang']],
  ['synctest_308045', ['ศศิธร', 'รุ่งเรือง', 'Sasithorn', 'Rungrueang']],
  ['asgntest_926663', ['เมธาวี', 'อินทรา', 'Methawee', 'Intra']],
  ['japan2006.j', ['เจษฎา', 'ไตรรัตน์', 'Jetsada', 'Trairat']],
]);

const courseImages = [
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
];

function courseTitle(course) {
  return realisticCourseNames.get(Number(course.courseId))?.[0] || course.nameTh || course.code;
}

function courseTitleEn(course) {
  return (
    realisticCourseNames.get(Number(course.courseId))?.[1] || course.nameEn || courseTitle(course)
  );
}

function courseSummary(title) {
  return `<p>${title} ออกแบบเป็นรายวิชาสำหรับผู้เรียนที่ต้องการนำความรู้ไปใช้กับงานจริง มีแบบทดสอบ งานประยุกต์ และกิจกรรมสะท้อนผลการเรียนรู้ครบถ้วน</p>`;
}

function thaiFullName(user) {
  const name = [user.firstNameTh, user.lastNameTh].filter(Boolean).join(' ').trim();
  return name || user.username || user.email || `User ${user.userId}`;
}

function splitThaiName(user) {
  return {
    firstname: user.firstNameTh || user.firstNameEn || user.username || 'ผู้เรียน',
    lastname: user.lastNameTh || user.lastNameEn || 'Demo',
  };
}

function moodleTimestamp(date = new Date()) {
  return Math.floor(date.getTime() / 1000);
}

async function callMoodleApi(wsfunction, entries) {
  const params = new URLSearchParams();
  params.set('wstoken', MOODLE_TOKEN);
  params.set('wsfunction', wsfunction);
  params.set('moodlewsrestformat', 'json');
  for (const [key, value] of entries) {
    if (value !== undefined && value !== null) params.set(key, String(value));
  }

  const response = await fetch(`${MOODLE_BASE_URL}/webservice/rest/server.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Moodle API returned non-JSON for ${wsfunction}: ${text.slice(0, 200)}`);
  }
  if (data?.exception) {
    throw new Error(
      `Moodle API ${wsfunction}: ${data.errorcode || data.exception} ${data.message || ''}`,
    );
  }
  return data;
}

async function getMoodleCourseByShortname(shortname) {
  const data = await callMoodleApi('core_course_get_courses_by_field', [
    ['field', 'shortname'],
    ['value', shortname],
  ]);
  return data.courses?.[0] || null;
}

async function getMoodleCourseById(id) {
  if (!id) return null;
  const data = await callMoodleApi('core_course_get_courses_by_field', [
    ['field', 'id'],
    ['value', id],
  ]);
  return data.courses?.[0] || null;
}

async function ensureMoodleCourse(app, course) {
  const title = courseTitle(course);
  const existingByShortname = await getMoodleCourseByShortname(course.code);
  const mappedById = await getMoodleCourseById(course.lmsId);
  const mapped =
    existingByShortname || (mappedById && mappedById.shortname === course.code ? mappedById : null);
  const entries = [
    ['courses[0][fullname]', title],
    ['courses[0][shortname]', course.code],
    ['courses[0][categoryid]', 1],
    ['courses[0][summary]', courseSummary(title)],
    ['courses[0][summaryformat]', 1],
    ['courses[0][visible]', 1],
    ['courses[0][startdate]', moodleTimestamp(course.startDate || new Date())],
    [
      'courses[0][enddate]',
      moodleTimestamp(course.endDate || new Date(Date.now() + 90 * 86400000)),
    ],
  ];

  let moodleCourse = mapped;
  if (moodleCourse?.id) {
    await callMoodleApi('core_course_update_courses', [
      ['courses[0][id]', moodleCourse.id],
      ...entries,
    ]);
  } else {
    await callMoodleApi('core_course_create_courses', entries);
    moodleCourse = await getMoodleCourseByShortname(course.code);
  }

  if (!moodleCourse?.id) {
    throw new Error(`Unable to create Moodle course for ${course.code}`);
  }

  await app.execute(
    `UPDATE LLTOPENCLASS
       SET LMS_ID = ?, LMS_STATUS = 'Y', LMS_USER = ?, LMS_DATE = NOW(), UPDATEUSER = ?, UPDATEDATE = NOW()
     WHERE OPENCLASS_ID = ?`,
    [moodleCourse.id, SEED_USER, SEED_USER, course.openclassId],
  );

  return Number(moodleCourse.id);
}

async function ensureCourseContent(app, course) {
  const title = courseTitle(course);
  const titleEn = courseTitleEn(course);
  const courseId = Number(course.courseId);
  const regStart = course.regStartDate || '2026-06-01';
  const regEnd = course.regEndDate || '2026-06-30';
  const classStart = course.classStartDate || '2026-07-01';
  const classEnd = course.classEndDate || '2026-08-15';
  const image = course.imageUrl || courseImages[courseId % courseImages.length];

  await app.execute(
    `UPDATE LLTCOURSE
        SET COSE_NAMETH = ?,
            COSE_NAMEEN = ?,
            COSE_HOUR = COALESCE(COSE_HOUR, 18),
            COSE_THEORYHOUR = COALESCE(COSE_THEORYHOUR, 9),
            COSE_ACTIONHOUR = COALESCE(COSE_ACTIONHOUR, 9),
            COSE_CREDITBANK = COALESCE(COSE_CREDITBANK, 1.50),
            COSE_STARTDATE = COALESCE(COSE_STARTDATE, ?),
            COSE_ENDDATE = COALESCE(COSE_ENDDATE, ?),
            COSE_YEAR = COALESCE(COSE_YEAR, '2569'),
            COSE_CONTRACTNAME = COALESCE(COSE_CONTRACTNAME, 'ศูนย์การเรียนรู้ตลอดชีวิต'),
            COSE_CONTRACTTEL = COALESCE(COSE_CONTRACTTEL, '038-102-222'),
            COSE_CONTRACTEMAIL = COALESCE(COSE_CONTRACTEMAIL, 'lifelong@buu.ac.th'),
            COSE_OBJECTIVE = ?,
            COSE_DESCRIPTION = ?,
            COSE_LO = ?,
            COSE_COMPETENCY = ?,
            COSE_EVALUATION = ?,
            COSE_PRECONDITION = COALESCE(COSE_PRECONDITION, 'เหมาะสำหรับผู้สนใจทั่วไป ไม่จำเป็นต้องมีพื้นฐานเฉพาะทาง'),
            COSE_PROPERTY = COALESCE(COSE_PROPERTY, 'บุคคลทั่วไป นิสิต บุคลากร และผู้ประกอบอาชีพที่ต้องการพัฒนาทักษะ'),
            COSE_KEYWORD = ?,
            COSE_IMAGE_URL = ?,
            UPDATEUSER = ?,
            UPDATEDATE = NOW()
      WHERE COSE_ID = ?`,
    [
      title,
      titleEn,
      classStart,
      classEnd,
      `ผู้เรียนสามารถอธิบายแนวคิดหลักของ ${title} และเลือกใช้เครื่องมือที่เหมาะสมกับสถานการณ์จริงได้`,
      `${title} ครอบคลุมเนื้อหาพื้นฐาน กรณีศึกษา แบบทดสอบ และงานประยุกต์ เพื่อให้ผู้เรียนเห็นภาพการนำไปใช้งานจริง`,
      '1) เข้าใจแนวคิดสำคัญ 2) วิเคราะห์โจทย์จากสถานการณ์จริง 3) จัดทำชิ้นงานหรือคำตอบเชิงประยุกต์ได้',
      'การคิดวิเคราะห์ การแก้ปัญหา การสื่อสาร และการใช้เทคโนโลยีหรือเครื่องมือที่เกี่ยวข้องกับรายวิชา',
      'แบบทดสอบออนไลน์ 40 คะแนน งานประยุกต์ 60 คะแนน และสรุปผลเป็นเกรดในระบบ LLL',
      `${title}, lifelong learning, digital learning, applied skills`,
      image,
      SEED_USER,
      courseId,
    ],
  );

  await app.execute(
    `UPDATE LLTOPENCLASS
        SET OPENCLASS_PUBLIC = 'Y',
            OPENCLASS_REGSTARTDATE = COALESCE(OPENCLASS_REGSTARTDATE, ?),
            OPENCLASS_REGENDDATE = COALESCE(OPENCLASS_REGENDDATE, ?),
            OPENCLASS_PAYSTARTDATE = COALESCE(OPENCLASS_PAYSTARTDATE, ?),
            OPENCLASS_PAYENDDATE = COALESCE(OPENCLASS_PAYENDDATE, ?),
            OPENCLASS_CLASSSTARTDATE = COALESCE(OPENCLASS_CLASSSTARTDATE, ?),
            OPENCLASS_CLASSENDDATE = COALESCE(OPENCLASS_CLASSENDDATE, ?),
            OPENCLASS_NUMOPEN = GREATEST(COALESCE(OPENCLASS_NUMOPEN, 0), ?),
            GRADEM_ID = COALESCE(GRADEM_ID, 1),
            TYPECLASS_ID = COALESCE(TYPECLASS_ID, 1),
            OPENCLASS_AMOUNT = COALESCE(OPENCLASS_AMOUNT, CASE WHEN ? % 3 = 0 THEN 1500 ELSE 0 END),
            OPENCLASS_GEN = COALESCE(OPENCLASS_GEN, 'รุ่นที่ 1'),
            OPENCLASS_GROUP = COALESCE(OPENCLASS_GROUP, 'กลุ่มเรียนหลัก'),
            OPENCLASS_NOTICE = COALESCE(OPENCLASS_NOTICE, 'Y'),
            OPENCLASS_TEACHTIME = COALESCE(OPENCLASS_TEACHTIME, 'เรียนออนไลน์และกิจกรรมตามกำหนดการ'),
            OPENCLASS_CONTRACTNAME = COALESCE(OPENCLASS_CONTRACTNAME, 'ศูนย์การเรียนรู้ตลอดชีวิต'),
            OPENCLASS_CONTRACTTEL = COALESCE(OPENCLASS_CONTRACTTEL, '038-102-222'),
            OPENCLASS_CONTRACTEMAIL = COALESCE(OPENCLASS_CONTRACTEMAIL, 'lifelong@buu.ac.th'),
            UPDATEUSER = ?,
            UPDATEDATE = NOW()
      WHERE OPENCLASS_ID = ?`,
    [
      regStart,
      regEnd,
      regStart,
      regEnd,
      classStart,
      classEnd,
      Math.max(MIN_ENROLLED_PER_COURSE + 6, Number(course.openSeats || 0)),
      courseId,
      SEED_USER,
      course.openclassId,
    ],
  );

  await ensureChapter(app, courseId, 1, `ภาพรวมและแนวคิดหลักของ${title}`, [
    'แนะนำรายวิชาและเป้าหมายการเรียนรู้',
    'กรณีศึกษาและตัวอย่างการประยุกต์ใช้',
  ]);
  await ensureChapter(app, courseId, 2, `การประยุกต์ใช้${title}กับงานจริง`, [
    'แนวทางวิเคราะห์โจทย์และวางแผนงาน',
    'สรุปผลการเรียนรู้และเตรียมงานประยุกต์',
  ]);
  await ensureCourseMetaRows(app, course);
}

async function ensureChapter(app, courseId, seq, subject, subchapters) {
  const [rows] = await app.execute(
    'SELECT COSECHAP_ID AS id FROM LLTCOURSECHAPTER WHERE COSE_ID = ? AND COSECHAP_SEQ = ? LIMIT 1',
    [courseId, seq],
  );
  let chapterId = rows[0]?.id;
  if (chapterId) {
    await app.execute(
      `UPDATE LLTCOURSECHAPTER
         SET COSECHAP_SUBJECT = ?, COSECHAP_HOUR = COALESCE(COSECHAP_HOUR, 9), TYPECHAP_ID = COALESCE(TYPECHAP_ID, 1),
             UPDATEUSER = ?, UPDATEDATE = NOW()
       WHERE COSECHAP_ID = ?`,
      [subject, SEED_USER, chapterId],
    );
  } else {
    const [result] = await app.execute(
      `INSERT INTO LLTCOURSECHAPTER (COSE_ID, COSECHAP_SUBJECT, COSECHAP_HOUR, COSECHAP_SEQ, TYPECHAP_ID, CREATEUSER, CREATEDATE)
       VALUES (?, ?, 9, ?, 1, ?, NOW())`,
      [courseId, subject, seq, SEED_USER],
    );
    chapterId = result.insertId;
  }

  for (let i = 0; i < subchapters.length; i += 1) {
    const subSeq = i + 1;
    const [subRows] = await app.execute(
      'SELECT COSESUBCHAP_ID AS id FROM LLTCOURSESUBCHAPTER WHERE COSECHAP_ID = ? AND COSESUBCHAP_SEQ = ? LIMIT 1',
      [chapterId, subSeq],
    );
    if (subRows[0]?.id) {
      await app.execute(
        `UPDATE LLTCOURSESUBCHAPTER SET COSESUBCHAP_SUBJECT = ?, UPDATEUSER = ?, UPDATEDATE = NOW() WHERE COSESUBCHAP_ID = ?`,
        [subchapters[i], SEED_USER, subRows[0].id],
      );
    } else {
      await app.execute(
        `INSERT INTO LLTCOURSESUBCHAPTER (COSECHAP_ID, COSESUBCHAP_SUBJECT, COSESUBCHAP_SEQ, CREATEUSER, CREATEDATE)
         VALUES (?, ?, ?, ?, NOW())`,
        [chapterId, subchapters[i], subSeq, SEED_USER],
      );
    }
  }
}

async function ensureCourseMetaRows(app, course) {
  const courseId = Number(course.courseId);
  await app.execute(
    `INSERT IGNORE INTO LLTCOURSETYPECLASS (COSE_ID, TYPECLASS_ID, COSETYPECLASS_AMOUNT, COSETYPECLASS_REMARK, CREATEUSER, CREATEDATE)
     VALUES (?, 1, 100, 'เรียนออนไลน์ผ่าน LLL และ Moodle', ?, NOW())`,
    [courseId, SEED_USER],
  );
  await app.execute(
    `INSERT IGNORE INTO LLTCOURSETARGET (COSE_ID, TARGET_ID, SUBTARGET_ID, COSETARGET_SEQ, COSETARGET_OTHER, CREATEUSER, CREATEDATE)
     VALUES (?, 1, NULL, 1, 'ผู้เรียนและบุคลากรที่ต้องการพัฒนาทักษะ', ?, NOW())`,
    [courseId, SEED_USER],
  );
  await app.execute(
    `INSERT IGNORE INTO LLTCOURSESKILL (COSE_ID, SKILL_ID, SKILL_WEIGHT, CREATEUSER, CREATEDATE)
     VALUES (?, 1, 50, ?, NOW())`,
    [courseId, SEED_USER],
  );
  await app.execute(
    `INSERT IGNORE INTO LLTCOURSESKILL (COSE_ID, SKILL_ID, SKILL_WEIGHT, CREATEUSER, CREATEDATE)
     VALUES (?, 2, 50, ?, NOW())`,
    [courseId, SEED_USER],
  );
  await app.execute(
    `INSERT IGNORE INTO LLTOPENCLASSSTUTYPEFEE (OPENCLASS_ID, STUTYPE_ID, STUTYPE_AMOUNT, CREATEUSER, CREATEDATE)
     VALUES (?, 1, COALESCE(?, 0), ?, NOW())`,
    [course.openclassId, course.amount || 0, SEED_USER],
  );
}

async function loadCourses(app) {
  const [courses] = await app.execute(`
    SELECT
      c.COSE_ID AS courseId,
      c.COSE_CODE AS code,
      c.COSE_NAMETH AS nameTh,
      c.COSE_NAMEEN AS nameEn,
      c.COSE_STARTDATE AS startDate,
      c.COSE_ENDDATE AS endDate,
      c.COSE_IMAGE_URL AS imageUrl,
      oc.OPENCLASS_ID AS openclassId,
      oc.LMS_ID AS lmsId,
      oc.OPENCLASS_REGSTARTDATE AS regStartDate,
      oc.OPENCLASS_REGENDDATE AS regEndDate,
      oc.OPENCLASS_CLASSSTARTDATE AS classStartDate,
      oc.OPENCLASS_CLASSENDDATE AS classEndDate,
      oc.OPENCLASS_AMOUNT AS amount,
      oc.OPENCLASS_NUMOPEN AS openSeats
    FROM LLTCOURSE c
    INNER JOIN LLTOPENCLASS oc ON oc.OPENCLASS_ID = (
      SELECT MAX(oc2.OPENCLASS_ID)
      FROM LLTOPENCLASS oc2
      WHERE oc2.COSE_ID = c.COSE_ID
    )
    WHERE c.COSE_CODE IS NOT NULL AND c.COSE_CODE <> ''
    ORDER BY c.COSE_ID ASC
  `);
  return courses;
}

async function loadTeachers(app) {
  const [teachers] = await app.execute(
    `SELECT u.USER_ID AS userId, u.USER_USERNAME AS username, u.USER_EMAIL AS email,
            u.USER_FNAMETH AS firstNameTh, u.USER_LNAMETH AS lastNameTh,
            u.USER_FNAMEEN AS firstNameEn, u.USER_LNAMEEN AS lastNameEn,
            u.LMS_ID AS lmsId, a.ROLE AS role
       FROM LLTUMUSER u
       INNER JOIN LLT_AUTH_USERS a ON LOWER(a.EMAIL) = LOWER(u.USER_EMAIL)
      WHERE a.ROLE IN ('Instructor', 'Admin')
      ORDER BY CASE WHEN a.ROLE = 'Instructor' THEN 0 ELSE 1 END, u.USER_ID`,
  );
  return teachers;
}

async function loadStudentPool(app) {
  const [students] = await app.execute(
    `SELECT u.USER_ID AS userId, u.USER_USERNAME AS username, u.USER_EMAIL AS email,
            u.USER_FNAMETH AS firstNameTh, u.USER_LNAMETH AS lastNameTh,
            u.USER_FNAMEEN AS firstNameEn, u.USER_LNAMEEN AS lastNameEn,
            u.USER_TEL AS phone, u.STUDENTCODE AS studentCode, u.USER_CODE AS userCode,
            u.USER_CITIZEN_ID AS citizenId, u.LMS_ID AS lmsId
       FROM LLTUMUSER u
       LEFT JOIN LLT_AUTH_USERS a ON LOWER(a.EMAIL) = LOWER(u.USER_EMAIL)
      WHERE COALESCE(a.ROLE, 'Student') = 'Student'
        AND u.USER_USERNAME IS NOT NULL
        AND u.USER_USERNAME <> ''
      ORDER BY CASE WHEN u.USER_USERNAME LIKE 'student%' THEN 0 ELSE 1 END, u.USER_ID`,
  );
  return students;
}

async function ensureMoodleUser(app, moodle, user, role) {
  await applyRealisticUserName(app, user);
  const username = String(user.username || user.email || `lll_user_${user.userId}`).toLowerCase();
  const email = user.email || `${username}@demo.local`;
  const { firstname, lastname } = splitThaiName(user);
  const idnumber = user.studentCode || user.userCode || username;

  const [byUsername] = await moodle.execute(
    'SELECT id FROM mdl_user WHERE deleted = 0 AND username = ? LIMIT 1',
    [username],
  );
  let moodleUserId = byUsername[0]?.id || null;

  if (!moodleUserId) {
    const [byEmail] = await moodle.execute(
      'SELECT id FROM mdl_user WHERE deleted = 0 AND LOWER(email) = LOWER(?) ORDER BY id LIMIT 2',
      [email],
    );
    if (byEmail.length === 1) moodleUserId = byEmail[0].id;
  }

  if (moodleUserId) {
    await moodle.execute(
      `UPDATE mdl_user
          SET username = ?, firstname = ?, lastname = ?, email = ?, idnumber = ?, institution = 'Burapha University',
              department = ?, city = 'Chonburi', country = 'TH', lang = 'th', timemodified = UNIX_TIMESTAMP()
        WHERE id = ?`,
      [
        username,
        firstname,
        lastname,
        email,
        idnumber,
        role === 'teacher' ? 'Instructor' : 'Learner',
        moodleUserId,
      ],
    );
  } else {
    const [adminRows] = await moodle.execute(
      "SELECT password FROM mdl_user WHERE username = 'admin' AND deleted = 0 LIMIT 1",
    );
    const passwordHash = adminRows[0]?.password || 'not cached';
    const [result] = await moodle.execute(
      `INSERT INTO mdl_user (
        auth, confirmed, mnethostid, username, password, idnumber, firstname, lastname, email, phone1,
        institution, department, city, country, lang, timezone, firstaccess, lastaccess, lastlogin,
        currentlogin, lastip, mailformat, maildigest, maildisplay, autosubscribe, trackforums,
        timecreated, timemodified
      ) VALUES ('manual', 1, 1, ?, ?, ?, ?, ?, ?, ?, 'Burapha University', ?, 'Chonburi', 'TH', 'th', '99',
        0, 0, 0, 0, '', 1, 0, 2, 1, 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP())`,
      [
        username,
        passwordHash,
        idnumber,
        firstname,
        lastname,
        email,
        user.phone || '',
        role === 'teacher' ? 'Instructor' : 'Learner',
      ],
    );
    moodleUserId = result.insertId;
  }

  await app.execute('UPDATE LLTUMUSER SET LMS_ID = ? WHERE USER_ID = ?', [
    moodleUserId,
    user.userId,
  ]);
  return Number(moodleUserId);
}

async function applyRealisticUserName(app, user) {
  const override = realisticUserNames.get(String(user.username || '').toLowerCase());
  if (!override) return;
  const [firstNameTh, lastNameTh, firstNameEn, lastNameEn] = override;
  user.firstNameTh = firstNameTh;
  user.lastNameTh = lastNameTh;
  user.firstNameEn = firstNameEn;
  user.lastNameEn = lastNameEn;
  await app.execute(
    `UPDATE LLTUMUSER
        SET USER_FNAMETH = ?,
            USER_LNAMETH = ?,
            USER_FNAMEEN = ?,
            USER_LNAMEEN = ?
      WHERE USER_ID = ?`,
    [firstNameTh, lastNameTh, firstNameEn, lastNameEn, user.userId],
  );
}

async function ensureTeacher(app, moodle, course, teacher) {
  const moodleUserId = await ensureMoodleUser(app, moodle, teacher, 'teacher');
  const [existing] = await app.execute(
    'SELECT COSEINS_ID AS id FROM LLTCOURSEINS WHERE COSE_ID = ? AND LOWER(COSEINS_EMAIL) = LOWER(?) LIMIT 1',
    [course.courseId, teacher.email],
  );

  let coseinsId = existing[0]?.id;
  if (!coseinsId) {
    const [reuse] = await app.execute(
      'SELECT PSN_ID AS psnId, FAC_ID_PSN AS facId FROM LLTCOURSEINS WHERE LOWER(COSEINS_EMAIL) = LOWER(?) AND PSN_ID IS NOT NULL LIMIT 1',
      [teacher.email],
    );
    const [result] = await app.execute(
      `INSERT INTO LLTCOURSEINS (COSE_ID, PSN_ID, FAC_ID_PSN, COSEINS_EMAIL, COSEINS_ADMIN, COSEINS_TEACHER, COSEINS_EDUCATION, CREATEUSER, CREATEDATE)
       VALUES (?, ?, ?, ?, 'Y', 'Y', 'ผู้สอนประจำรายวิชาและผู้ดูแลกิจกรรมใน Moodle', ?, NOW())`,
      [course.courseId, reuse[0]?.psnId || null, reuse[0]?.facId || null, teacher.email, SEED_USER],
    );
    coseinsId = result.insertId;
  } else {
    await app.execute(
      `UPDATE LLTCOURSEINS
          SET COSEINS_ADMIN = 'Y', COSEINS_TEACHER = 'Y',
              COSEINS_EDUCATION = COALESCE(COSEINS_EDUCATION, 'ผู้สอนประจำรายวิชาและผู้ดูแลกิจกรรมใน Moodle'),
              UPDATEUSER = ?, UPDATEDATE = NOW()
        WHERE COSEINS_ID = ?`,
      [SEED_USER, coseinsId],
    );
  }

  await app.execute(
    `INSERT IGNORE INTO LLTOPENCLASSINS (OPENCLASS_ID, COSEINS_ID, CREATEUSER, CREATEDATE)
     VALUES (?, ?, ?, NOW())`,
    [course.openclassId, coseinsId, SEED_USER],
  );

  await ensureMoodleEnrolment(moodle, course.moodleCourseId, moodleUserId, 3);
}

async function ensureMoodleEnrolment(moodle, moodleCourseId, moodleUserId, roleId) {
  const enrolId = await ensureManualEnrol(moodle, moodleCourseId);
  const contextId = await ensureCourseContext(moodle, moodleCourseId);

  const [existing] = await moodle.execute(
    'SELECT id FROM mdl_user_enrolments WHERE enrolid = ? AND userid = ? LIMIT 1',
    [enrolId, moodleUserId],
  );
  if (existing[0]?.id) {
    await moodle.execute(
      'UPDATE mdl_user_enrolments SET status = 0, timeend = 2147483647, timemodified = UNIX_TIMESTAMP() WHERE id = ?',
      [existing[0].id],
    );
  } else {
    await moodle.execute(
      `INSERT INTO mdl_user_enrolments (status, enrolid, userid, timestart, timeend, modifierid, timecreated, timemodified)
       VALUES (0, ?, ?, UNIX_TIMESTAMP(), 2147483647, 2, UNIX_TIMESTAMP(), UNIX_TIMESTAMP())`,
      [enrolId, moodleUserId],
    );
  }

  const [roleRows] = await moodle.execute(
    'SELECT id FROM mdl_role_assignments WHERE roleid = ? AND contextid = ? AND userid = ? LIMIT 1',
    [roleId, contextId, moodleUserId],
  );
  if (roleRows[0]?.id) {
    await moodle.execute(
      `UPDATE mdl_role_assignments
          SET component = 'enrol_manual', itemid = ?, timemodified = UNIX_TIMESTAMP(), modifierid = 2
        WHERE id = ?`,
      [enrolId, roleRows[0].id],
    );
  } else {
    await moodle.execute(
      `INSERT INTO mdl_role_assignments (roleid, contextid, userid, timemodified, modifierid, component, itemid, sortorder)
       VALUES (?, ?, ?, UNIX_TIMESTAMP(), 2, 'enrol_manual', ?, 0)`,
      [roleId, contextId, moodleUserId, enrolId],
    );
  }
}

async function ensureManualEnrol(moodle, moodleCourseId) {
  const [rows] = await moodle.execute(
    "SELECT id FROM mdl_enrol WHERE courseid = ? AND enrol = 'manual' LIMIT 1",
    [moodleCourseId],
  );
  if (rows[0]?.id) return Number(rows[0].id);
  const [result] = await moodle.execute(
    `INSERT INTO mdl_enrol (enrol, status, courseid, sortorder, enrolperiod, enrolstartdate, enrolenddate, expirynotify, expirythreshold,
      notifyall, roleid, timecreated, timemodified)
     VALUES ('manual', 0, ?, 0, 0, 0, 0, 0, 0, 0, 5, UNIX_TIMESTAMP(), UNIX_TIMESTAMP())`,
    [moodleCourseId],
  );
  return Number(result.insertId);
}

async function ensureCourseContext(moodle, moodleCourseId) {
  const [rows] = await moodle.execute(
    'SELECT id, path, depth FROM mdl_context WHERE contextlevel = 50 AND instanceid = ? LIMIT 1',
    [moodleCourseId],
  );
  if (rows[0]?.id) return Number(rows[0].id);
  const [systemRows] = await moodle.execute(
    'SELECT id, path, depth FROM mdl_context WHERE contextlevel = 10 LIMIT 1',
  );
  const parentPath = systemRows[0]?.path || '/1';
  const parentDepth = Number(systemRows[0]?.depth || 1);
  const [result] = await moodle.execute(
    'INSERT INTO mdl_context (contextlevel, instanceid, path, depth, locked) VALUES (50, ?, NULL, ?, 0)',
    [moodleCourseId, parentDepth + 1],
  );
  const contextId = Number(result.insertId);
  await moodle.execute('UPDATE mdl_context SET path = ? WHERE id = ?', [
    `${parentPath}/${contextId}`,
    contextId,
  ]);
  return contextId;
}

async function ensureEnrollment(app, moodle, course, student) {
  const moodleUserId = await ensureMoodleUser(app, moodle, student, 'student');
  const [existing] = await app.execute(
    'SELECT ENROLL_ID AS id FROM LLTENROLL WHERE OPENCLASS_ID = ? AND USER_ID = ? LIMIT 1',
    [course.openclassId, student.userId],
  );
  let enrollId = existing[0]?.id;
  if (!enrollId) {
    const [result] = await app.execute(
      `INSERT INTO LLTENROLL (
        OPENCLASS_ID, COSE_ID, USER_ID, ENROLL_DATE, ENROLL_AMOUNT, ENROLL_BALANCE, ENROLL_PAYSTATUS,
        ENROLL_CITIZEN, ENROLL_NAMERECEIPT, ENROLL_TELEPHONE, ENROLL_STATUS, CREATEUSER, CREATEDATE
      ) VALUES (?, ?, ?, CURDATE(), ?, 0, 'Y', ?, ?, ?, 'Y', ?, NOW())`,
      [
        course.openclassId,
        course.courseId,
        student.userId,
        course.amount || 0,
        student.citizenId || null,
        thaiFullName(student),
        student.phone || null,
        SEED_USER,
      ],
    );
    enrollId = result.insertId;
  } else {
    await app.execute(
      `UPDATE LLTENROLL
          SET ENROLL_PAYSTATUS = COALESCE(ENROLL_PAYSTATUS, 'Y'), ENROLL_STATUS = COALESCE(ENROLL_STATUS, 'Y'),
              ENROLL_AMOUNT = COALESCE(ENROLL_AMOUNT, ?), ENROLL_BALANCE = COALESCE(ENROLL_BALANCE, 0),
              UPDATEDATE = NOW(), UPDATEUSER = ?
        WHERE ENROLL_ID = ?`,
      [course.amount || 0, SEED_USER, enrollId],
    );
  }

  await ensureMoodleEnrolment(moodle, course.moodleCourseId, moodleUserId, 5);
  return { enrollId, moodleUserId };
}

async function ensureMoodleActivitySet(moodle, moodleCourseId) {
  const sectionId = await ensureSection(moodle, moodleCourseId, 1);
  const assign = await ensureActivity(
    moodle,
    moodleCourseId,
    sectionId,
    'assign',
    'งานประยุกต์ท้ายบท',
    60,
  );
  const quiz = await ensureActivity(
    moodle,
    moodleCourseId,
    sectionId,
    'quiz',
    'แบบทดสอบตรวจความเข้าใจ',
    40,
  );
  const courseItem = await ensureGradeItem(
    moodle,
    moodleCourseId,
    'course',
    null,
    null,
    null,
    'คะแนนรวมรายวิชา',
    100,
  );
  return { assign, quiz, courseItem };
}

async function ensureSection(moodle, moodleCourseId, sectionNumber) {
  const [rows] = await moodle.execute(
    'SELECT id FROM mdl_course_sections WHERE course = ? AND section = ? LIMIT 1',
    [moodleCourseId, sectionNumber],
  );
  if (rows[0]?.id) return Number(rows[0].id);
  const [result] = await moodle.execute(
    `INSERT INTO mdl_course_sections (course, section, name, summary, summaryformat, sequence, visible, timemodified)
     VALUES (?, ?, NULL, '', 1, '', 1, UNIX_TIMESTAMP())`,
    [moodleCourseId, sectionNumber],
  );
  return Number(result.insertId);
}

async function ensureActivity(moodle, moodleCourseId, sectionId, modname, name, maxGrade) {
  const [moduleRows] = await moodle.execute('SELECT id FROM mdl_modules WHERE name = ? LIMIT 1', [
    modname,
  ]);
  const moduleId = Number(moduleRows[0]?.id);
  if (!moduleId) throw new Error(`Moodle module not found: ${modname}`);

  const [activityRows] = await moodle.execute(
    `SELECT id FROM mdl_${modname} WHERE course = ? AND name = ? LIMIT 1`,
    [moodleCourseId, name],
  );
  let instanceId = activityRows[0]?.id || null;
  if (!instanceId) {
    instanceId = await insertActivityInstance(moodle, moodleCourseId, modname, name, maxGrade);
  } else {
    await updateActivityInstance(moodle, modname, instanceId, maxGrade);
  }

  const [cmRows] = await moodle.execute(
    'SELECT id FROM mdl_course_modules WHERE course = ? AND module = ? AND instance = ? LIMIT 1',
    [moodleCourseId, moduleId, instanceId],
  );
  let cmid = cmRows[0]?.id || null;
  if (!cmid) {
    const [result] = await moodle.execute(
      `INSERT INTO mdl_course_modules (
        course, module, instance, section, idnumber, added, score, indent, visible, visibleoncoursepage,
        visibleold, groupmode, groupingid, completion, completionview, completionexpected, showdescription,
        deletioninprogress, downloadcontent
      ) VALUES (?, ?, ?, ?, '', UNIX_TIMESTAMP(), 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1)`,
      [moodleCourseId, moduleId, instanceId, sectionId],
    );
    cmid = Number(result.insertId);
  } else {
    await moodle.execute(
      `UPDATE mdl_course_modules
          SET section = ?, visible = 1, visibleoncoursepage = 1, deletioninprogress = 0, downloadcontent = 1
        WHERE id = ?`,
      [sectionId, cmid],
    );
  }
  await ensureModuleContext(moodle, moodleCourseId, cmid);
  await ensureSectionSequence(moodle, sectionId, cmid);
  const gradeItem = await ensureGradeItem(
    moodle,
    moodleCourseId,
    'mod',
    modname,
    instanceId,
    0,
    name,
    maxGrade,
  );
  return {
    instanceId: Number(instanceId),
    cmid: Number(cmid),
    gradeItemId: gradeItem.id,
    maxGrade,
  };
}

async function insertActivityInstance(moodle, moodleCourseId, modname, name, maxGrade) {
  if (modname === 'assign') {
    const [result] = await moodle.execute(
      `INSERT INTO mdl_assign (
        course, name, intro, introformat, alwaysshowdescription, nosubmissions, submissiondrafts,
        sendnotifications, sendlatenotifications, duedate, allowsubmissionsfromdate, grade, timemodified,
        requiresubmissionstatement, completionsubmit, cutoffdate, gradingduedate, teamsubmission,
        requireallteammemberssubmit, teamsubmissiongroupingid, blindmarking, hidegrader, revealidentities,
        attemptreopenmethod, maxattempts, markingworkflow, markingallocation, markercount,
        markinganonymous, sendstudentnotifications, preventsubmissionnotingroup, activity,
        activityformat, timelimit, submissionattachments, gradepenalty
      ) VALUES (?, ?, '<p>ส่งชิ้นงานหรือไฟล์สรุปการประยุกต์ใช้ความรู้จากบทเรียน</p>', 1, 1, 0, 0, 0, 0,
        UNIX_TIMESTAMP() + 1209600, UNIX_TIMESTAMP() - 86400, ?, UNIX_TIMESTAMP(), 0, 0,
        UNIX_TIMESTAMP() + 1814400, UNIX_TIMESTAMP() + 1814400, 0, 0, 0, 0, 0, 0, 'none', -1, 0, 0, 1, 0, 1, 0,
        '<p>ให้อธิบายแนวทางประยุกต์ใช้ความรู้กับสถานการณ์จริง พร้อมแนบไฟล์ประกอบถ้ามี</p>', 1, 0, 0, 0)`,
      [moodleCourseId, name, maxGrade],
    );
    return Number(result.insertId);
  }

  const [result] = await moodle.execute(
    `INSERT INTO mdl_quiz (
      course, name, intro, introformat, timeopen, timeclose, timelimit, overduehandling, graceperiod,
      preferredbehaviour, canredoquestions, attempts, attemptonlast, grademethod, decimalpoints,
      questiondecimalpoints, reviewattempt, reviewcorrectness, reviewmaxmarks, reviewmarks,
      reviewspecificfeedback, reviewgeneralfeedback, reviewrightanswer, reviewoverallfeedback,
      questionsperpage, navmethod, shuffleanswers, sumgrades, grade, timecreated, timemodified,
      password, subnet, browsersecurity, delay1, delay2, showuserpicture, showblocks,
      completionattemptsexhausted, completionminattempts, allowofflineattempts
    ) VALUES (?, ?, '<p>แบบทดสอบเพื่อประเมินความเข้าใจก่อนเข้าสู่บทถัดไป</p>', 1, 0, 0, 0, 'autosubmit', 0,
      'deferredfeedback', 0, 0, 0, 1, 2, -1, 69904, 69904, 69904, 69904, 69904, 69904, 69904, 69904,
      1, 'free', 1, ?, ?, UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), '', '', '', 0, 0, 0, 0, 0, 0, 0)`,
    [moodleCourseId, name, maxGrade, maxGrade],
  );
  return Number(result.insertId);
}

async function updateActivityInstance(moodle, modname, instanceId, maxGrade) {
  if (modname === 'assign') {
    await moodle.execute(
      'UPDATE mdl_assign SET grade = ?, timemodified = UNIX_TIMESTAMP() WHERE id = ?',
      [maxGrade, instanceId],
    );
  } else {
    await moodle.execute(
      'UPDATE mdl_quiz SET grade = ?, sumgrades = ?, timemodified = UNIX_TIMESTAMP() WHERE id = ?',
      [maxGrade, maxGrade, instanceId],
    );
  }
}

async function ensureModuleContext(moodle, moodleCourseId, cmid) {
  const [existing] = await moodle.execute(
    'SELECT id FROM mdl_context WHERE contextlevel = 70 AND instanceid = ? LIMIT 1',
    [cmid],
  );
  if (existing[0]?.id) return Number(existing[0].id);
  const [courseContextRows] = await moodle.execute(
    'SELECT id, path, depth FROM mdl_context WHERE contextlevel = 50 AND instanceid = ? LIMIT 1',
    [moodleCourseId],
  );
  const courseContext = courseContextRows[0];
  const [result] = await moodle.execute(
    'INSERT INTO mdl_context (contextlevel, instanceid, path, depth, locked) VALUES (70, ?, NULL, ?, 0)',
    [cmid, Number(courseContext.depth || 3) + 1],
  );
  const contextId = Number(result.insertId);
  await moodle.execute('UPDATE mdl_context SET path = ? WHERE id = ?', [
    `${courseContext.path}/${contextId}`,
    contextId,
  ]);
  return contextId;
}

async function ensureSectionSequence(moodle, sectionId, cmid) {
  const [rows] = await moodle.execute(
    'SELECT sequence FROM mdl_course_sections WHERE id = ? LIMIT 1',
    [sectionId],
  );
  const sequence = String(rows[0]?.sequence || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  if (!sequence.includes(String(cmid))) {
    sequence.push(String(cmid));
    await moodle.execute(
      'UPDATE mdl_course_sections SET sequence = ?, timemodified = UNIX_TIMESTAMP() WHERE id = ?',
      [sequence.join(','), sectionId],
    );
  }
}

async function ensureGradeItem(
  moodle,
  courseId,
  itemtype,
  itemmodule,
  iteminstance,
  itemnumber,
  itemname,
  grademax,
) {
  const where =
    itemtype === 'course'
      ? 'courseid = ? AND itemtype = ?'
      : 'courseid = ? AND itemtype = ? AND itemmodule = ? AND iteminstance = ?';
  const params =
    itemtype === 'course' ? [courseId, itemtype] : [courseId, itemtype, itemmodule, iteminstance];
  const [rows] = await moodle.execute(
    `SELECT id FROM mdl_grade_items WHERE ${where} LIMIT 1`,
    params,
  );
  if (rows[0]?.id) {
    await moodle.execute(
      `UPDATE mdl_grade_items
          SET itemname = ?, grademax = ?, grademin = 0, gradepass = ?, needsupdate = 0, timemodified = UNIX_TIMESTAMP()
        WHERE id = ?`,
      [itemtype === 'course' ? null : itemname, grademax, grademax * 0.6, rows[0].id],
    );
    return { id: Number(rows[0].id), maxGrade: grademax };
  }
  const [sortRows] = await moodle.execute(
    'SELECT COALESCE(MAX(sortorder), 0) + 1 AS nextSort FROM mdl_grade_items WHERE courseid = ?',
    [courseId],
  );
  const [result] = await moodle.execute(
    `INSERT INTO mdl_grade_items (
      courseid, itemname, itemtype, itemmodule, iteminstance, itemnumber, gradetype, grademax, grademin,
      gradepass, multfactor, plusfactor, aggregationcoef, aggregationcoef2, sortorder, display,
      hidden, locked, locktime, needsupdate, weightoverride, timecreated, timemodified
    ) VALUES (?, ?, ?, ?, ?, ?, 1, ?, 0, ?, 1, 0, 0, 0, ?, 0, 0, 0, 0, 0, 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP())`,
    [
      courseId,
      itemtype === 'course' ? null : itemname,
      itemtype,
      itemmodule,
      iteminstance,
      itemnumber,
      grademax,
      grademax * 0.6,
      Number(sortRows[0]?.nextSort || 1),
    ],
  );
  return { id: Number(result.insertId), maxGrade: grademax };
}

async function seedGrades(app, moodle, course, enrolled, activitySet) {
  const gradeItems = await getGradableActivityItems(moodle, course.moodleCourseId, activitySet);
  const totalMax = gradeItems.reduce((sum, item) => sum + item.maxGrade, 0) || 100;
  let graded = 0;
  for (let i = 0; i < enrolled.length; i += 1) {
    const item = enrolled[i];

    let totalRawScore = 0;
    for (let j = 0; j < gradeItems.length; j += 1) {
      const gradeItem = gradeItems[j];
      const percent = 0.62 + ((Number(course.courseId) * 13 + i * 17 + j * 11) % 31) / 100;
      const score = Number(Math.min(gradeItem.maxGrade, gradeItem.maxGrade * percent).toFixed(5));
      totalRawScore += score;
      await upsertGradeGrade(
        moodle,
        gradeItem.gradeItemId,
        item.moodleUserId,
        score,
        gradeItem.maxGrade,
      );
    }

    const totalScore = Number(((totalRawScore / totalMax) * 100).toFixed(5));
    const gradeItemId = gradeItemIdForScore(totalScore);
    await upsertGradeGrade(moodle, activitySet.courseItem.id, item.moodleUserId, totalScore, 100);
    await app.execute(
      `UPDATE LLTENROLL
          SET LMS_FINALSCORE = ?,
              LMS_UPDATEUSER = ?,
              LMS_UPDATEDATE = NOW(),
              GRADEI_ID = ?,
              UPDATEUSER = ?,
              UPDATEDATE = NOW(),
              UPDATEPROG = ?
        WHERE ENROLL_ID = ?`,
      [totalScore, SEED_USER, gradeItemId, SEED_USER, SEED_USER, item.enrollId],
    );
    graded += 1;
  }
  return graded;
}

function gradeItemIdForScore(score) {
  if (score >= 80) return 1; // A
  if (score >= 75) return 2; // B+
  if (score >= 70) return 3; // B
  if (score >= 65) return 4; // C+
  if (score >= 60) return 5; // C
  if (score >= 55) return 6; // D+
  if (score >= 50) return 7; // D
  return 8; // F
}

async function getGradableActivityItems(moodle, moodleCourseId, activitySet) {
  const [rows] = await moodle.execute(
    `SELECT id, itemmodule, itemname, grademax
       FROM mdl_grade_items
      WHERE courseid = ?
        AND itemtype = 'mod'
        AND itemmodule IN ('assign', 'quiz')
        AND grademax > 0
      ORDER BY sortorder, id`,
    [moodleCourseId],
  );
  if (rows.length > 0) {
    return rows.map((row) => ({
      gradeItemId: Number(row.id),
      itemmodule: row.itemmodule,
      itemname: row.itemname,
      maxGrade: Number(row.grademax || 0),
    }));
  }
  return [
    {
      gradeItemId: activitySet.assign.gradeItemId,
      itemmodule: 'assign',
      itemname: 'งานประยุกต์ท้ายบท',
      maxGrade: activitySet.assign.maxGrade,
    },
    {
      gradeItemId: activitySet.quiz.gradeItemId,
      itemmodule: 'quiz',
      itemname: 'แบบทดสอบตรวจความเข้าใจ',
      maxGrade: activitySet.quiz.maxGrade,
    },
  ];
}

async function upsertGradeGrade(moodle, gradeItemId, moodleUserId, score, maxGrade) {
  const [rows] = await moodle.execute(
    'SELECT id FROM mdl_grade_grades WHERE itemid = ? AND userid = ? LIMIT 1',
    [gradeItemId, moodleUserId],
  );
  if (rows[0]?.id) {
    await moodle.execute(
      `UPDATE mdl_grade_grades
          SET rawgrade = ?, rawgrademax = ?, rawgrademin = 0, finalgrade = ?, timemodified = UNIX_TIMESTAMP(),
              aggregationstatus = 'used', aggregationweight = NULL
        WHERE id = ?`,
      [score, maxGrade, score, rows[0].id],
    );
  } else {
    await moodle.execute(
      `INSERT INTO mdl_grade_grades (
        itemid, userid, rawgrade, rawgrademax, rawgrademin, finalgrade, hidden, locked, locktime,
        exported, overridden, excluded, feedbackformat, informationformat, timecreated, timemodified,
        aggregationstatus, deductedmark
      ) VALUES (?, ?, ?, ?, 0, ?, 0, 0, 0, 0, 0, 0, 0, 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 'used', 0)`,
      [gradeItemId, moodleUserId, score, maxGrade, score],
    );
  }
}

async function repairAllUserMappings(app, moodle) {
  const [users] = await app.execute(
    `SELECT USER_ID AS userId, USER_USERNAME AS username, USER_EMAIL AS email,
            USER_FNAMETH AS firstNameTh, USER_LNAMETH AS lastNameTh,
            USER_FNAMEEN AS firstNameEn, USER_LNAMEEN AS lastNameEn,
            USER_TEL AS phone, STUDENTCODE AS studentCode, USER_CODE AS userCode, LMS_ID AS lmsId
       FROM LLTUMUSER
      WHERE USER_USERNAME IS NOT NULL AND USER_USERNAME <> ''
      ORDER BY USER_ID`,
  );
  let repaired = 0;
  for (const user of users) {
    const before = user.lmsId ? Number(user.lmsId) : null;
    const next = await ensureMoodleUser(app, moodle, user, 'student');
    if (before !== next) repaired += 1;
  }
  return repaired;
}

async function main() {
  const app = await mysql.createConnection(appDbConfig);
  const moodle = await mysql.createConnection(moodleDbConfig);

  try {
    const courses = await loadCourses(app);
    const teachers = await loadTeachers(app);
    const students = await loadStudentPool(app);
    if (teachers.length === 0) throw new Error('No LLL instructors found.');
    if (students.length === 0) throw new Error('No LLL students found.');

    const repairedUsers = await repairAllUserMappings(app, moodle);
    let totalCreatedEnrolls = 0;
    let totalGraded = 0;
    const summary = [];

    for (let index = 0; index < courses.length; index += 1) {
      const course = courses[index];
      await ensureCourseContent(app, course);
      const moodleCourseId = await ensureMoodleCourse(app, course);
      course.moodleCourseId = moodleCourseId;

      const teacher = teachers[index % teachers.length];
      await ensureTeacher(app, moodle, course, teacher);

      const activitySet = await ensureMoodleActivitySet(moodle, moodleCourseId);

      const [currentEnrollRows] = await app.execute(
        `SELECT e.ENROLL_ID AS enrollId, e.USER_ID AS userId, u.LMS_ID AS moodleUserId
           FROM LLTENROLL e
           JOIN LLTUMUSER u ON u.USER_ID = e.USER_ID
          WHERE e.OPENCLASS_ID = ?
          ORDER BY e.ENROLL_ID`,
        [course.openclassId],
      );
      const enrolled = [];
      for (const row of currentEnrollRows) {
        const student = students.find((s) => Number(s.userId) === Number(row.userId));
        if (!student) continue;
        const moodleUserId =
          row.moodleUserId || (await ensureMoodleUser(app, moodle, student, 'student'));
        await ensureMoodleEnrolment(moodle, moodleCourseId, moodleUserId, 5);
        enrolled.push({ enrollId: row.enrollId, moodleUserId: Number(moodleUserId) });
      }

      let cursor = (index * 7) % students.length;
      while (enrolled.length < MIN_ENROLLED_PER_COURSE) {
        const student = students[cursor % students.length];
        cursor += 1;
        if (enrolled.some((item) => Number(item.userId) === Number(student.userId))) continue;
        const result = await ensureEnrollment(app, moodle, course, student);
        enrolled.push({ ...result, userId: student.userId });
        totalCreatedEnrolls += 1;
      }

      const graded = await seedGrades(app, moodle, course, enrolled, activitySet);
      totalGraded += graded;
      summary.push({
        courseId: course.courseId,
        code: course.code,
        moodleCourseId,
        enrollments: enrolled.length,
        graded,
        teacher: teacher.email,
      });
    }

    console.log(
      JSON.stringify(
        {
          status: 'ok',
          courses: courses.length,
          repairedUsers,
          createdEnrollments: totalCreatedEnrolls,
          gradedRows: totalGraded,
          summary,
        },
        null,
        2,
      ),
    );
  } finally {
    await app.end();
    await moodle.end();
  }

  if (process.argv.includes('--export')) {
    await exportMoodleSeed();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
