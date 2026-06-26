const fs = require('fs');
const path = require('path');

// Configuration
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

function getEnvVar(name) {
  const match = envContent.match(new RegExp(`${name}=(.*)`));
  return match ? match[1].trim() : null;
}

const MOODLE_BASE_URL = getEnvVar('MOODLE_BASE_URL') || 'http://localhost:8080';
const MOODLE_TOKEN = getEnvVar('MOODLE_TOKEN');
const MOODLE_TEST_PASSWORD = getEnvVar('MOODLE_TEST_PASSWORD') || getEnvVar('SEED_USER_PASSWORD');

if (!MOODLE_TOKEN) {
  console.error('❌ ERROR: MOODLE_TOKEN not found in .env');
  process.exit(1);
}

if (!MOODLE_TEST_PASSWORD) {
  console.error('❌ ERROR: MOODLE_TEST_PASSWORD or SEED_USER_PASSWORD must be set in .env');
  process.exit(1);
}

const USER_DATA = {
  username: 'teach',
  password: MOODLE_TEST_PASSWORD,
  firstname: 'Teach',
  lastname: 'LLL',
  email: 'teach@go.buu.ac.th',
};


async function callMoodleApi(wsfunction, params = {}) {
  const url = new URL(`${MOODLE_BASE_URL}/webservice/rest/server.php`);
  const searchParams = new URLSearchParams();
  searchParams.append('wstoken', MOODLE_TOKEN);
  searchParams.append('wsfunction', wsfunction);
  searchParams.append('moodlewsrestformat', 'json');

  for (const [key, value] of Object.entries(params)) {
    searchParams.append(key, value);
  }

  const response = await fetch(url, {
    method: 'POST',
    body: searchParams,
  });

  const data = await response.json();
  if (data.exception) {
    throw new Error(`Moodle API Exception: ${data.message || data.exception}`);
  }
  return data;
}

async function main() {
  console.log('--- Mocking Moodle User ---');

  try {
    // 1. Create User
    console.log(`Creating user: ${USER_DATA.username}...`);
    const createParams = {
      'users[0][username]': USER_DATA.username,
      'users[0][password]': USER_DATA.password,
      'users[0][firstname]': USER_DATA.firstname,
      'users[0][lastname]': USER_DATA.lastname,
      'users[0][email]': USER_DATA.email,
    };

    let userId;
    try {
      const users = await callMoodleApi('core_user_create_users', createParams);
      userId = users[0].id;
      console.log(`User created with ID: ${userId}`);
    } catch (err) {
      if (err.message.includes('username already exists') || err.message.includes('Username already exists')) {
        console.log('User already exists, fetching existing user ID...');
        const searchRes = await callMoodleApi('core_user_get_users', {
          'criteria[0][key]': 'username',
          'criteria[0][value]': USER_DATA.username,
        });
        userId = searchRes.users[0].id;
        console.log(`Found existing user ID: ${userId}`);
      } else {
        throw err;
      }
    }

    // 2. Get all courses
    console.log('Fetching courses...');
    const courses = await callMoodleApi('core_course_get_courses');
    // Filter out the site course (id: 1 usually)
    const filteredCourses = courses.filter(c => c.id !== 1);
    console.log(`Found ${filteredCourses.length} courses.`);

    // 3. Enrol user in courses as teacher (roleid 3)
    console.log(`Enrolling user ID ${userId} in courses...`);
    for (const course of filteredCourses) {
      try {
        await callMoodleApi('enrol_manual_enrol_users', {
          'enrolments[0][roleid]': 3, // Teacher role
          'enrolments[0][userid]': userId,
          'enrolments[0][courseid]': course.id,
        });
        console.log(`  Enrolled in: ${course.fullname} (${course.shortname})`);
      } catch (err) {
        console.log(`  Skipped enrollment for ${course.fullname}: ${err.message}`);
      }
    }

    console.log('\n--- Done! ---');
    console.log(`Username: ${USER_DATA.username}`);
    console.log(`Password: ${USER_DATA.password}`);
    console.log(`Moodle URL: ${MOODLE_BASE_URL}`);

    console.log('\n--- Next Steps for LLL Website ---');
    console.log('To make these courses appear as owned by this user on the LLL website,');
    console.log('run the following SQL in your phpMyAdmin:');
    console.log(`UPDATE LLTCOURSE SET CREATEUSER = '${USER_DATA.email}';`);

  } catch (error) {
    console.error('An error occurred:', error.message);
  }
}

main();
