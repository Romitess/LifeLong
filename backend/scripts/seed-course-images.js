const mysql = require('mysql2/promise');
const { loadEnv } = require('./load-env');

loadEnv();

const imageByCode = {
  C2605001:
    'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80',
  C2505002:
    'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1200&q=80',
  C2505003:
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
  C2606001:
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80',
  C2606002:
    'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80',
  C2601101:
    'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80',
  C2601102:
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
  C2601103:
    'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80',
  C2601104:
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
  C2601105:
    'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?auto=format&fit=crop&w=1200&q=80',
  C2603001:
    'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1200&q=80',
  C2603002:
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80',
  C2604001:
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
  C2604002:
    'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
  C2504003:
    'https://images.unsplash.com/photo-1528697203043-733dafdaa316?auto=format&fit=crop&w=1200&q=80',
  C2601001:
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
  C2601002:
    'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80',
  C2601003:
    'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=1200&q=80',
  C2601004:
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80',
  C2601005:
    'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80',
  C2601106:
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
  TST001:
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
};

const imageByKeyword = [
  [
    /python|programming|เขียนโปรแกรม/i,
    'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80',
  ],
  [
    /react|web application|เว็บ/i,
    'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1200&q=80',
  ],
  [
    /sql|database|ฐานข้อมูล/i,
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
  ],
  [
    /exercise|ออกกำลังกาย/i,
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80',
  ],
  [
    /nutrition|โภชนาการ/i,
    'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80',
  ],
  [
    /math|คณิต/i,
    'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80',
  ],
  [
    /statistics|สถิติ|data science|ข้อมูล/i,
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
  ],
  [
    /biology|ชีววิทยา/i,
    'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=1200&q=80',
  ],
  [
    /ecology|environment|สิ่งแวดล้อม|นิเวศ/i,
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80',
  ],
  [
    /astronomy|ดาราศาสตร์/i,
    'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80',
  ],
  [
    /physics|ฟิสิกส์|engineering|วิศวกรรม|autocad|เขียนแบบ/i,
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
  ],
  [
    /chemistry|เคมี/i,
    'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?auto=format&fit=crop&w=1200&q=80',
  ],
  [
    /thai language|ภาษาไทย|creative writing|เขียนเชิงสร้างสรรค์/i,
    'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
  ],
  [
    /culture|วัฒนธรรม/i,
    'https://images.unsplash.com/photo-1528697203043-733dafdaa316?auto=format&fit=crop&w=1200&q=80',
  ],
];

const imageByCategory = {
  2: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
  3: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80',
  6: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80',
  7: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80',
  8: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
};

const defaultImageUrl =
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80';

function getCourseImageUrl(course) {
  const code = course.COSE_CODE?.trim();
  if (code && imageByCode[code]) return imageByCode[code];

  const searchableTitle = `${course.COSE_NAMETH ?? ''} ${course.COSE_NAMEEN ?? ''}`.trim();
  const keywordMatch = imageByKeyword.find(([pattern]) => pattern.test(searchableTitle));
  if (keywordMatch) return keywordMatch[1];

  if (course.CATEGORY_ID && imageByCategory[course.CATEGORY_ID]) {
    return imageByCategory[course.CATEGORY_ID];
  }

  return defaultImageUrl;
}

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'lifelong2',
  });

  const [courses] = await connection.execute(
    `SELECT COSE_ID, COSE_CODE, COSE_NAMETH, COSE_NAMEEN, CATEGORY_ID, COSE_IMAGE_URL
     FROM LLTCOURSE
     ORDER BY COSE_ID`,
  );

  let updated = 0;
  for (const course of courses) {
    if (course.COSE_IMAGE_URL && String(course.COSE_IMAGE_URL).trim()) continue;

    await connection.execute(
      `UPDATE LLTCOURSE
       SET COSE_IMAGE_URL = ?, UPDATEUSER = 'SEED_COURSE_IMAGES', UPDATEDATE = NOW()
       WHERE COSE_ID = ?`,
      [getCourseImageUrl(course), course.COSE_ID],
    );
    updated += 1;
  }

  await connection.end();
  console.log(`Seeded course images for ${updated} course(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
