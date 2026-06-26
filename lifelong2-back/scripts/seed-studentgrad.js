/**
 * seed-studentgrad.js
 *
 * Seed STUDENTGRAD ด้วยข้อมูลจำลองศิษย์เก่า BUU
 * รวมถึง users ที่มีสิทธิ์ศิษย์เก่าใน LLTPRIVILEGE อยู่แล้ว
 *
 * Usage: npm run seed:studentgrad
 * ⚠ DEV/TEST ONLY
 */

const mysql = require('mysql2/promise');
const { loadEnv } = require('./load-env');
loadEnv();

const FACULTIES = [
  { id: '10', name: 'คณะวิทยาศาสตร์', nameEng: 'Faculty of Science' },
  { id: '20', name: 'คณะวิศวกรรมศาสตร์', nameEng: 'Faculty of Engineering' },
  { id: '30', name: 'คณะมนุษยศาสตร์และสังคมศาสตร์', nameEng: 'Faculty of Humanities and Social Sciences' },
  { id: '40', name: 'คณะศึกษาศาสตร์', nameEng: 'Faculty of Education' },
];

const PROGRAMS = [
  { id: '1001', code: 'CS', name: 'วิทยาการคอมพิวเตอร์', nameEng: 'Computer Science', abbr: 'วท.บ.' },
  { id: '2001', code: 'EE', name: 'วิศวกรรมไฟฟ้า', nameEng: 'Electrical Engineering', abbr: 'วศ.บ.' },
  { id: '3001', code: 'TH', name: 'ภาษาไทย', nameEng: 'Thai Language', abbr: 'ศศ.บ.' },
];

const LEVELS = [
  { id: '01', name: 'ปริญญาตรี', nameEng: 'Bachelor' },
  { id: '02', name: 'ปริญญาโท', nameEng: 'Master' },
];

function randItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randYear() { return 2545 + Math.floor(Math.random() * 20); } // พ.ศ. 2545-2564
function finishDate(year) {
  const ad = year - 543;
  return new Date(ad, 4, 31); // 31 พ.ค.
}

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'lifelong2',
  });

  try {
    // 1. ดึง users ที่มีสิทธิ์ศิษย์เก่าจาก LLTPRIVILEGE
    const [alumniUsers] = await conn.execute(`
      SELECT u.USER_CITIZEN_ID, u.USER_FNAMETH, u.USER_LNAMETH
      FROM LLTPRIVILEGE p
      JOIN LLTUMUSER u ON u.USER_ID = p.USER_ID
      JOIN LLTTYPESTUDENT s ON s.STUTYPE_ID = p.STUTYPE_ID
      WHERE s.STUTYPE_NAME = 'ศิษย์เก่า' AND u.USER_CITIZEN_ID IS NOT NULL
    `);

    console.log(`พบ ${alumniUsers.length} users ที่มีสิทธิ์ศิษย์เก่า → seed เข้า STUDENTGRAD`);

    let inserted = 0;
    let studentId = 5500001;

    // 2. Seed users จาก LLTPRIVILEGE ก่อน
    for (const u of alumniUsers) {
      const [dup] = await conn.execute(
        'SELECT 1 FROM STUDENTGRAD WHERE CITIZENID = ? LIMIT 1',
        [u.USER_CITIZEN_ID],
      );
      if (dup.length > 0) {
        console.log(`  SKIP (ซ้ำ): ${u.USER_CITIZEN_ID}`);
        continue;
      }

      const fac = randItem(FACULTIES);
      const prog = randItem(PROGRAMS);
      const level = randItem(LEVELS);
      const year = randYear();

      await conn.execute(`
        INSERT INTO STUDENTGRAD
          (STUDENTID, STUDENTCODE, CAMPUSID, LEVELID, FACULTYID, DEPARTMENTID, PROGRAMID,
           PREFIXID, STUDENTNAME, STUDENTNAMEENG, STUDENTSURNAME, STUDENTSURNAMEENG,
           FINISHDATE, CITIZENID, STUDENTSTATUS,
           PREFIXNAME, PREFIXNAMEENG, CAMPUSNAME, CAMPUSNAMEENG,
           LEVELNAME, LEVELNAMEENG, FACULTYNAME, FACULTYNAMEENG,
           PROGRAMCODE, PROGRAMNAME, PROGRAMABB, PROGRAMNAMEENG,
           DEPARTMENTNAME, DEPARTMENTNAMEENG, DEPARTMENTABB, DEPARTMENTABBENG)
        VALUES (?,?,1,?,?,?,?,1,?,?,?,?,?,?,'จบการศึกษา',
                'นาย','Mr.','มหาวิทยาลัยบูรพา','Burapha University',
                ?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          studentId++, `${55 + Math.floor(Math.random() * 10)}${String(studentId).padStart(6,'0')}`,
          level.id, fac.id, fac.id, prog.id,
          u.USER_FNAMETH, u.USER_FNAMETH, u.USER_LNAMETH, u.USER_LNAMETH,
          finishDate(year), u.USER_CITIZEN_ID,
          level.name, level.nameEng, fac.name, fac.nameEng,
          prog.code, prog.name, prog.abbr, prog.nameEng,
          fac.name, fac.nameEng, prog.code, prog.code,
        ],
      );

      console.log(`  ✓ ${u.USER_FNAMETH} ${u.USER_LNAMETH} | citizenId: ${u.USER_CITIZEN_ID}`);
      inserted++;
    }

    // 3. Seed ศิษย์เก่าจำลองเพิ่ม 5 คน (ไม่มีใน LLTUMUSER — เพื่อทดสอบ lookup)
    console.log('\nSeed ศิษย์เก่าจำลองเพิ่ม 5 คน...');
    const extras = [
      { fn: 'สมชาย', ln: 'ใจดี' },
      { fn: 'สุดา', ln: 'รักเรียน' },
      { fn: 'วิชัย', ln: 'มานะ' },
      { fn: 'นภา', ln: 'สดใส' },
      { fn: 'ประสิทธิ์', ln: 'เก่งกล้า' },
    ];

    for (const ex of extras) {
      // gen citizenId unique
      let cid;
      let taken = true;
      while (taken) {
        const digits = [1 + Math.floor(Math.random() * 8)];
        for (let i = 1; i < 12; i++) digits.push(Math.floor(Math.random() * 10));
        const sum = digits.reduce((a, d, i) => a + d * (13 - i), 0);
        digits.push((11 - (sum % 11)) % 10);
        cid = digits.join('');
        const [r] = await conn.execute(
          'SELECT 1 FROM STUDENTGRAD WHERE CITIZENID = ? LIMIT 1', [cid],
        );
        taken = r.length > 0;
      }

      const fac = randItem(FACULTIES);
      const prog = randItem(PROGRAMS);
      const level = randItem(LEVELS);
      const year = randYear();

      await conn.execute(`
        INSERT INTO STUDENTGRAD
          (STUDENTID, STUDENTCODE, CAMPUSID, LEVELID, FACULTYID, DEPARTMENTID, PROGRAMID,
           PREFIXID, STUDENTNAME, STUDENTNAMEENG, STUDENTSURNAME, STUDENTSURNAMEENG,
           FINISHDATE, CITIZENID, STUDENTSTATUS,
           PREFIXNAME, PREFIXNAMEENG, CAMPUSNAME, CAMPUSNAMEENG,
           LEVELNAME, LEVELNAMEENG, FACULTYNAME, FACULTYNAMEENG,
           PROGRAMCODE, PROGRAMNAME, PROGRAMABB, PROGRAMNAMEENG,
           DEPARTMENTNAME, DEPARTMENTNAMEENG, DEPARTMENTABB, DEPARTMENTABBENG)
        VALUES (?,?,1,?,?,?,?,1,?,?,?,?,?,?,'จบการศึกษา',
                'นาย','Mr.','มหาวิทยาลัยบูรพา','Burapha University',
                ?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        studentId++, `${55 + Math.floor(Math.random() * 10)}${String(studentId).padStart(6,'0')}`,
        level.id, fac.id, fac.id, prog.id,
        ex.fn, ex.fn, ex.ln, ex.ln,
        finishDate(year), cid,
        level.name, level.nameEng, fac.name, fac.nameEng,
        prog.code, prog.name, prog.abbr, prog.nameEng,
        fac.name, fac.nameEng, prog.code, prog.code,
      ]);

      console.log(`  ✓ ${ex.fn} ${ex.ln} | citizenId: ${cid}`);
      inserted++;
    }

    const [[{ n }]] = await conn.execute('SELECT COUNT(*) AS n FROM STUDENTGRAD');
    console.log(`\nDone. STUDENTGRAD มีทั้งหมด ${n} rows (เพิ่ม ${inserted} rows)`);

  } finally {
    await conn.end();
  }
}

main().catch(err => { console.error('Seed failed:', err.message); process.exit(1); });
