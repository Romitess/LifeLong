const mysql = require('mysql2/promise');
const { loadEnv, requiredEnv, optionalEnv } = require('./load-env');

loadEnv();

const MOODLE_BASE_URL = requiredEnv('MOODLE_URL', 'MOODLE_BASE_URL').replace(/\/+$/, '');
const MOODLE_TOKEN = requiredEnv('MOODLE_TOKEN');

async function callMoodleApi(wsfunction, params) {
  params.set('wstoken', MOODLE_TOKEN);
  params.set('wsfunction', wsfunction);
  params.set('moodlewsrestformat', 'json');

  const response = await fetch(`${MOODLE_BASE_URL}/webservice/rest/server.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  const text = await response.text();
  const data = JSON.parse(text);

  if (data && typeof data === 'object' && data.exception) {
    throw new Error(
      `Moodle API Exception [${data.errorcode || 'unknown'}]: ${data.message || data.exception}`,
    );
  }

  return data;
}

async function getMoodleCourseByField(field, value) {
  const params = new URLSearchParams();
  params.set('field', field);
  params.set('value', String(value));
  const result = await callMoodleApi('core_course_get_courses_by_field', params);
  return result.courses?.[0] ?? null;
}

async function createMoodleCourse(course, categoryId) {
  for (const candidateCategoryId of [categoryId, 1]) {
    const params = new URLSearchParams();
    params.set('courses[0][fullname]', course.nameTh);
    params.set('courses[0][shortname]', course.code);
    params.set('courses[0][categoryid]', String(candidateCategoryId));
    params.set('courses[0][summary]', course.objective || '');
    params.set('courses[0][summaryformat]', '1');
    params.set('courses[0][visible]', '1');
    if (course.startDate) {
      params.set(
        'courses[0][startdate]',
        String(Math.floor(new Date(course.startDate).getTime() / 1000)),
      );
    }
    if (course.endDate) {
      params.set(
        'courses[0][enddate]',
        String(Math.floor(new Date(course.endDate).getTime() / 1000)),
      );
    }

    try {
      await callMoodleApi('core_course_create_courses', params);
      return getMoodleCourseByField('shortname', course.code);
    } catch (error) {
      if (candidateCategoryId === 1) throw error;
    }
  }

  return null;
}

async function updateMoodleCourse(courseId, course, categoryId) {
  for (const candidateCategoryId of [categoryId, 1]) {
    const params = new URLSearchParams();
    params.set('courses[0][id]', String(courseId));
    params.set('courses[0][fullname]', course.nameTh);
    params.set('courses[0][shortname]', course.code);
    params.set('courses[0][categoryid]', String(candidateCategoryId));
    params.set('courses[0][summary]', course.objective || '');
    params.set('courses[0][summaryformat]', '1');
    if (course.startDate) {
      params.set(
        'courses[0][startdate]',
        String(Math.floor(new Date(course.startDate).getTime() / 1000)),
      );
    }
    if (course.endDate) {
      params.set(
        'courses[0][enddate]',
        String(Math.floor(new Date(course.endDate).getTime() / 1000)),
      );
    }

    try {
      await callMoodleApi('core_course_update_courses', params);
      return;
    } catch (error) {
      if (candidateCategoryId === 1) throw error;
    }
  }
}

async function resolveMoodleCategoryId(conn, categoryId, subcategoryId) {
  if (subcategoryId) {
    const [subRows] = await conn.execute(
      'SELECT LMS_ID AS lmsId FROM LLTSUBCATEGORY WHERE SUBCATEGORY_ID = ? LIMIT 1',
      [subcategoryId],
    );
    if (subRows[0]?.lmsId) return Number(subRows[0].lmsId);
  }

  if (categoryId) {
    const [catRows] = await conn.execute(
      'SELECT LMS_ID AS lmsId FROM LLTCATEGORY WHERE CATEGORY_ID = ? LIMIT 1',
      [categoryId],
    );
    if (catRows[0]?.lmsId) return Number(catRows[0].lmsId);
  }

  return 1;
}

async function main() {
  const conn = await mysql.createConnection({
    host: requiredEnv('DB_HOST'),
    port: Number(optionalEnv('DB_PORT', 3306)),
    user: requiredEnv('DB_USER'),
    password: requiredEnv('DB_PASSWORD'),
    database: requiredEnv('DB_NAME'),
  });

  const [courses] = await conn.execute(`
    SELECT
      c.COSE_ID AS courseId,
      c.COSE_CODE AS code,
      c.COSE_NAMETH AS nameTh,
      c.COSE_OBJECTIVE AS objective,
      c.CATEGORY_ID AS categoryId,
      c.SUBCATEGORY_ID AS subcategoryId,
      c.COSE_STARTDATE AS startDate,
      c.COSE_ENDDATE AS endDate,
      oc.OPENCLASS_ID AS openclassId,
      oc.LMS_ID AS lmsId
    FROM LLTCOURSE c
    INNER JOIN LLTOPENCLASS oc ON oc.OPENCLASS_ID = (
      SELECT MIN(oc2.OPENCLASS_ID)
      FROM LLTOPENCLASS oc2
      WHERE oc2.COSE_ID = c.COSE_ID AND oc2.OPENCLASS_PUBLIC = 'Y'
    )
    WHERE c.COSE_STATUS = 'Y'
    ORDER BY c.COSE_ID ASC
  `);

  const summary = [];

  for (const course of courses) {
    const categoryId = await resolveMoodleCategoryId(conn, course.categoryId, course.subcategoryId);
    const expectedCourse = await getMoodleCourseByField('shortname', course.code);
    const mappedCourse = course.lmsId ? await getMoodleCourseByField('id', course.lmsId) : null;

    let finalCourse = null;
    let action = 'none';

    if (expectedCourse) {
      finalCourse = expectedCourse;
      action = course.lmsId === expectedCourse.id ? 'sync-existing-shortname' : 'remap-shortname';
      await updateMoodleCourse(expectedCourse.id, course, categoryId);
    } else if (mappedCourse && mappedCourse.shortname === course.code) {
      finalCourse = mappedCourse;
      action = 'sync-existing-mapped';
      await updateMoodleCourse(mappedCourse.id, course, categoryId);
    } else {
      finalCourse = await createMoodleCourse(course, categoryId);
      action = mappedCourse ? 'create-replace-stale' : 'create-missing';
    }

    if (!finalCourse?.id) {
      throw new Error(`Unable to resolve Moodle course for ${course.code}`);
    }

    await conn.execute(
      `UPDATE LLTOPENCLASS
       SET LMS_ID = ?, LMS_STATUS = 'Y', LMS_USER = 'REPAIR', LMS_DATE = NOW()
       WHERE OPENCLASS_ID = ?`,
      [finalCourse.id, course.openclassId],
    );

    summary.push({
      courseId: course.courseId,
      code: course.code,
      oldLmsId: course.lmsId,
      newLmsId: finalCourse.id,
      action,
    });
  }

  await conn.end();
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
