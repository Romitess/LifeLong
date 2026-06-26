-- =====================================================================
-- Quick Test: Verify Student Data Import
-- =====================================================================
-- Run this in Adminer or MySQL to verify data was added successfully

-- =========================
-- BACKEND DATABASE CHECKS
-- =========================

SELECT '=== BACKEND DATABASE: LLT_AUTH_USERS ===' AS section;
SELECT COUNT(*) as total_student_accounts FROM LLT_AUTH_USERS 
WHERE ROLE = 'Student' AND USERNAME LIKE 's%_student';

SELECT 'Sample student accounts:' AS detail;
SELECT USER_ID, USERNAME, EMAIL, ROLE, CREATEDATE FROM LLT_AUTH_USERS 
WHERE ROLE = 'Student' AND USERNAME LIKE 's%_student'
ORDER BY USER_ID DESC
LIMIT 5;

SELECT '' AS spacing;
SELECT '=== BACKEND DATABASE: LLTUMUSER ===' AS section;
SELECT COUNT(*) as total_student_profiles FROM LLTUMUSER 
WHERE USER_USERNAME LIKE 's%_student';

SELECT 'Sample student profiles:' AS detail;
SELECT USER_ID, 
       CONCAT(USER_FNAMETH, ' ', USER_LNAMETH) AS ชื่อไทย,
       CONCAT(USER_FNAMEEN, ' ', USER_LNAMEEN) AS ชื่ออังกฤษ,
       USER_TEL AS เบอร์,
       USER_EMAIL AS อีเมล,
       USER_STATUS AS สถานะ
FROM LLTUMUSER 
WHERE USER_USERNAME LIKE 's%_student'
ORDER BY USER_ID DESC
LIMIT 5;

SELECT '' AS spacing;
SELECT '=== BACKEND DATABASE: LLTENROLL ===' AS section;
SELECT COUNT(*) as total_enrollments FROM LLTENROLL 
WHERE USER_ID IN (SELECT USER_ID FROM LLT_AUTH_USERS 
                  WHERE USERNAME LIKE 's%_student');

SELECT 'Student enrollments:' AS detail;
SELECT 
    e.ENROLL_ID,
    au.USERNAME,
    CONCAT(lu.USER_FNAMETH, ' ', lu.USER_LNAMETH) AS ชื่อ,
    c.COSE_NAME AS หลักสูตร,
    e.ENROLL_DATE AS วันลงทะเบียน,
    CASE 
        WHEN e.ENROLL_STATUS = 'A' THEN 'Active'
        WHEN e.ENROLL_STATUS = 'S' THEN 'Suspended'
        WHEN e.ENROLL_STATUS = 'C' THEN 'Completed'
        ELSE e.ENROLL_STATUS
    END AS สถานะ
FROM LLTENROLL e
JOIN LLT_AUTH_USERS au ON e.USER_ID = au.USER_ID
JOIN LLTUMUSER lu ON au.USER_ID = lu.USER_ID
JOIN LLTCOURSE c ON e.COSE_ID = c.COSE_ID
WHERE au.USERNAME LIKE 's%_student'
LIMIT 10;

-- =========================
-- MOODLE DATABASE CHECKS
-- =========================

SELECT '' AS spacing;
SELECT '=== MOODLE DATABASE: mdl_user ===' AS section;
SELECT COUNT(*) as total_moodle_students FROM mdl_user 
WHERE username LIKE 's%_student' AND deleted = 0;

SELECT 'Sample Moodle students:' AS detail;
SELECT id, username, 
       CONCAT(firstname, ' ', lastname) AS ชื่อ,
       email,
       confirmed,
       FROM_UNIXTIME(timecreated) AS สร้างเมื่อ
FROM mdl_user 
WHERE username LIKE 's%_student' AND deleted = 0
ORDER BY id DESC
LIMIT 5;

SELECT '' AS spacing;
SELECT '=== MOODLE DATABASE: mdl_user_enrolments ===' AS section;
SELECT COUNT(*) as total_moodle_enrollments FROM mdl_user_enrolments ue
WHERE ue.userid IN (SELECT id FROM mdl_user WHERE username LIKE 's%_student');

SELECT 'Student course enrollments:' AS detail;
SELECT 
    u.username,
    CONCAT(u.firstname, ' ', u.lastname) AS ชื่อ,
    c.fullname AS course,
    CASE 
        WHEN ue.status = 0 THEN 'Active'
        WHEN ue.status = 1 THEN 'Suspended'
        ELSE 'Other'
    END AS สถานะ,
    FROM_UNIXTIME(ue.timestart) AS เริ่มเมื่อ
FROM mdl_user_enrolments ue
JOIN mdl_user u ON ue.userid = u.id
JOIN mdl_enrol e ON ue.enrolid = e.id
JOIN mdl_course c ON e.courseid = c.id
WHERE u.username LIKE 's%_student'
LIMIT 10;

SELECT '' AS spacing;
SELECT '=== SUMMARY ===' AS section;
SELECT 
    (SELECT COUNT(*) FROM LLT_AUTH_USERS WHERE ROLE = 'Student' AND USERNAME LIKE 's%_student') AS Backend_Auth_Users,
    (SELECT COUNT(*) FROM LLTUMUSER WHERE USER_USERNAME LIKE 's%_student') AS Backend_User_Profiles,
    (SELECT COUNT(*) FROM LLTENROLL WHERE USER_ID IN (SELECT USER_ID FROM LLT_AUTH_USERS WHERE USERNAME LIKE 's%_student')) AS Backend_Enrollments,
    (SELECT COUNT(*) FROM mdl_user WHERE username LIKE 's%_student' AND deleted = 0) AS Moodle_Users,
    (SELECT COUNT(*) FROM mdl_user_enrolments WHERE userid IN (SELECT id FROM mdl_user WHERE username LIKE 's%_student')) AS Moodle_Enrollments;

SELECT '' AS spacing;
SELECT '✓ Verification complete!' AS result;
