


const MOODLE_BASE_URL = 'http://127.0.0.1:8080';
const MOODLE_TOKEN = 'eb35bf7b1a0759d905b520853b7ed5b2';

async function testMoodle(wsfunction, params = {}) {
    const url = new URL(`${MOODLE_BASE_URL}/webservice/rest/server.php`);
    url.searchParams.append('wstoken', MOODLE_TOKEN);
    url.searchParams.append('wsfunction', wsfunction);
    url.searchParams.append('moodlewsrestformat', 'json');
    
    for (const [key, value] of Object.entries(params)) {
        url.searchParams.append(key, value);
    }

    console.log(`Testing function: ${wsfunction}`);
    try {
        const response = await fetch(url.toString(), { method: 'POST' });
        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
    }
}

async function run() {
    console.log('--- Site Info ---');
    await testMoodle('core_webservice_get_site_info');
    
    console.log('\n--- Create Course Test (Dry Run/Minimal) ---');
    // This might fail if we don't provide all params, but we want to see the exception type
    await testMoodle('core_course_create_courses', {
        'courses[0][fullname]': 'Test Course',
        'courses[0][shortname]': 'test01',
        'courses[0][categoryid]': '1'
    });
}

run();
