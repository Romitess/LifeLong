/* eslint-disable no-console */
const mysql = require('mysql2/promise');
const { loadEnv, optionalEnv, requiredEnv } = require('./load-env');

loadEnv();

async function main() {
  const app = await mysql.createConnection({
    host: requiredEnv('DB_HOST'),
    port: Number(optionalEnv('DB_PORT', 3306)),
    user: requiredEnv('DB_USER'),
    password: requiredEnv('DB_PASSWORD'),
    database: requiredEnv('DB_NAME'),
  });
  const moodle = await mysql.createConnection({
    host: optionalEnv('MOODLE_DB_HOST', '127.0.0.1'),
    port: Number(optionalEnv('MOODLE_DB_PORT', 3307)),
    user: optionalEnv('MOODLE_DB_USER', 'bn_moodle'),
    password: optionalEnv('MOODLE_DB_PASSWORD', 'moodle_password'),
    database: optionalEnv('MOODLE_DB_NAME', 'LLLv.2'),
  });

  try {
    const [duplicates] = await app.execute(`
      SELECT oc.LMS_ID AS lmsId,
             COUNT(*) AS count,
             GROUP_CONCAT(CONCAT(c.COSE_ID, ':', c.COSE_CODE) ORDER BY c.COSE_ID SEPARATOR ' | ') AS courses
        FROM LLTOPENCLASS oc
        JOIN LLTCOURSE c ON c.COSE_ID = oc.COSE_ID
       WHERE oc.LMS_ID IS NOT NULL
       GROUP BY oc.LMS_ID
      HAVING COUNT(*) > 1
       ORDER BY count DESC
    `);

    const [courses] = await app.execute(`
      SELECT c.COSE_ID AS courseId,
             c.COSE_CODE AS code,
             c.COSE_NAMETH AS name,
             oc.OPENCLASS_ID AS openclassId,
             oc.LMS_ID AS lmsId,
             (SELECT COUNT(*) FROM LLTENROLL e WHERE e.OPENCLASS_ID = oc.OPENCLASS_ID) AS enrolls,
             (SELECT COUNT(*) FROM LLTENROLL e WHERE e.OPENCLASS_ID = oc.OPENCLASS_ID AND e.LMS_FINALSCORE IS NOT NULL) AS graded
        FROM LLTCOURSE c
        JOIN LLTOPENCLASS oc ON oc.OPENCLASS_ID = (
          SELECT MAX(oc2.OPENCLASS_ID) FROM LLTOPENCLASS oc2 WHERE oc2.COSE_ID = c.COSE_ID
        )
       WHERE c.COSE_CODE IS NOT NULL AND c.COSE_CODE <> ''
       ORDER BY c.COSE_ID
    `);

    const missingMoodle = [];
    const mismatchedShortname = [];
    const missingActivities = [];
    const lowData = [];

    for (const course of courses) {
      const [moodleCourses] = await moodle.execute(
        'SELECT id, shortname FROM mdl_course WHERE id = ? LIMIT 1',
        [course.lmsId],
      );
      const moodleCourse = moodleCourses[0];
      if (!moodleCourse) {
        missingMoodle.push(course);
      } else if (moodleCourse.shortname !== course.code) {
        mismatchedShortname.push({ ...course, moodleShortname: moodleCourse.shortname });
      }

      const [activityRows] = await moodle.execute(
        `SELECT
           COALESCE(SUM(m.name = 'assign'), 0) AS assignCount,
           COALESCE(SUM(m.name = 'quiz'), 0) AS quizCount
         FROM mdl_course_modules cm
         JOIN mdl_modules m ON m.id = cm.module
        WHERE cm.course = ? AND cm.visible = 1 AND cm.deletioninprogress = 0`,
        [course.lmsId],
      );
      const activities = activityRows[0] || { assignCount: 0, quizCount: 0 };
      if (Number(activities.assignCount) < 1 || Number(activities.quizCount) < 1) {
        missingActivities.push({ ...course, ...activities });
      }
      if (Number(course.enrolls) < 1 || Number(course.graded) < 1) {
        lowData.push(course);
      }
    }

    const [duplicateUsers] = await app.execute(`
      SELECT LMS_ID AS lmsId,
             COUNT(*) AS count,
             GROUP_CONCAT(CONCAT(USER_ID, ':', USER_USERNAME) ORDER BY USER_ID SEPARATOR ' | ') AS users
        FROM LLTUMUSER
       WHERE LMS_ID IS NOT NULL
       GROUP BY LMS_ID
      HAVING COUNT(*) > 1
       ORDER BY count DESC
    `);

    console.log(
      JSON.stringify(
        {
          courses: courses.length,
          duplicateCourseLmsIds: duplicates,
          missingMoodle,
          mismatchedShortname,
          missingActivities,
          lowData,
          duplicateUserLmsIds: duplicateUsers,
        },
        null,
        2,
      ),
    );
  } finally {
    await app.end();
    await moodle.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
