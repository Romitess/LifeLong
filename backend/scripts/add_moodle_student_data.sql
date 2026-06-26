-- =====================================================================
-- Add Realistic Student Data to Moodle Database (LLLv.2)
-- =====================================================================
-- This script adds 15 students to Moodle LMS with course enrollments

-- =====================================================================
-- PART 1: Add Students to mdl_user (Moodle Users Table)
-- =====================================================================
-- Note: Moodle uses MD5 hashes for passwords
-- Password hash should be generated from the local seed password.

-- First, check current user count
SELECT 'Current Moodle Users:' AS info;
SELECT COUNT(*) as total_users, MAX(id) as last_user_id FROM mdl_user;

-- Get admin and course info
SELECT 'Available Courses:' AS info;
SELECT id, fullname FROM mdl_course WHERE id > 1 LIMIT 5;

-- =====================================================================
-- Insert new students (mdl_user table)
-- Password: <STUDENT_SEED_PASSWORD> (MD5 will be handled, using placeholder)
-- =====================================================================
INSERT INTO mdl_user (auth, confirmed, policyagreed, deleted, suspended, mnethostid, username, email, firstname, lastname, mailformat, maildigest, maildisplay, autosubscribe, trackforums, timecreated, timemodified, firstaccess, lastaccess, lastlogin, currentlogin, lastip, secret, timezone, lang, calendartype, theme, description) VALUES

-- IT Program Students (5 students)
('manual', 1, 0, 0, 0, 1, 's001_student', 'student001@university.edu', 'สมชาย', 'ปัญญาดี', 1, 0, 1, 1, 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0, 0, 0, 0, '', '', 'UTC', 'en', 'gregorian', '', ''),
('manual', 1, 0, 0, 0, 1, 's002_student', 'student002@university.edu', 'นิศา', 'กิจวัฒนา', 1, 0, 1, 1, 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0, 0, 0, 0, '', '', 'UTC', 'en', 'gregorian', '', ''),
('manual', 1, 0, 0, 0, 1, 's003_student', 'student003@university.edu', 'ธนาวิ', 'ศรีสุวรรณ', 1, 0, 1, 1, 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0, 0, 0, 0, '', '', 'UTC', 'en', 'gregorian', '', ''),
('manual', 1, 0, 0, 0, 1, 's004_student', 'student004@university.edu', 'กนกวรรณ', 'เจริงศิริ', 1, 0, 1, 1, 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0, 0, 0, 0, '', '', 'UTC', 'en', 'gregorian', '', ''),
('manual', 1, 0, 0, 0, 1, 's005_student', 'student005@university.edu', 'วิชิต', 'สถาปัตย์', 1, 0, 1, 1, 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0, 0, 0, 0, '', '', 'UTC', 'en', 'gregorian', '', ''),

-- Business Program Students (4 students)
('manual', 1, 0, 0, 0, 1, 's006_student', 'student006@university.edu', 'อรสา', 'บุตรดี', 1, 0, 1, 1, 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0, 0, 0, 0, '', '', 'UTC', 'en', 'gregorian', '', ''),
('manual', 1, 0, 0, 0, 1, 's007_student', 'student007@university.edu', 'พชร', 'ชัยสุข', 1, 0, 1, 1, 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0, 0, 0, 0, '', '', 'UTC', 'en', 'gregorian', '', ''),
('manual', 1, 0, 0, 0, 1, 's008_student', 'student008@university.edu', 'ศศิกา', 'นวลแฉ', 1, 0, 1, 1, 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0, 0, 0, 0, '', '', 'UTC', 'en', 'gregorian', '', ''),
('manual', 1, 0, 0, 0, 1, 's009_student', 'student009@university.edu', 'สิริพร', 'อ่อมนวล', 1, 0, 1, 1, 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0, 0, 0, 0, '', '', 'UTC', 'en', 'gregorian', '', ''),

-- Design Program Students (3 students)
('manual', 1, 0, 0, 0, 1, 's010_student', 'student010@university.edu', 'เมธา', 'มงคลวงค์', 1, 0, 1, 1, 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0, 0, 0, 0, '', '', 'UTC', 'en', 'gregorian', '', ''),
('manual', 1, 0, 0, 0, 1, 's011_student', 'student011@university.edu', 'พรพิมล', 'สายัญญา', 1, 0, 1, 1, 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0, 0, 0, 0, '', '', 'UTC', 'en', 'gregorian', '', ''),
('manual', 1, 0, 0, 0, 1, 's012_student', 'student012@university.edu', 'อังศุมาลย์', 'พลงาม', 1, 0, 1, 1, 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0, 0, 0, 0, '', '', 'UTC', 'en', 'gregorian', '', ''),

-- Engineering Program Students (3 students)
('manual', 1, 0, 0, 0, 1, 's013_student', 'student013@university.edu', 'สุรชาติ', 'มณฑากิจ', 1, 0, 1, 1, 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0, 0, 0, 0, '', '', 'UTC', 'en', 'gregorian', '', ''),
('manual', 1, 0, 0, 0, 1, 's014_student', 'student014@university.edu', 'จรูญ', 'ศรีมงคล', 1, 0, 1, 1, 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0, 0, 0, 0, '', '', 'UTC', 'en', 'gregorian', '', ''),
('manual', 1, 0, 0, 0, 1, 's015_student', 'student015@university.edu', 'ประเสริฐ', 'สันติมา', 1, 0, 1, 1, 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0, 0, 0, 0, '', '', 'UTC', 'en', 'gregorian', '', '');

-- =====================================================================
-- PART 2: Enroll Students in Courses
-- =====================================================================
-- Get student user IDs and course IDs
SET @course_id = 2; -- Adjust based on actual course IDs
SET @student_role_id = 5; -- Standard student role in Moodle

-- Create temporary table to get new student IDs
CREATE TEMPORARY TABLE new_student_ids AS
SELECT id, username FROM mdl_user 
WHERE username LIKE 's%_student' 
ORDER BY id DESC LIMIT 15;

-- Enroll students in courses (mdl_user_enrolments)
INSERT INTO mdl_user_enrolments (enrolid, userid, status, timestart, timeend, timecreated, timemodified, modifieruserid)
SELECT 
    (SELECT id FROM mdl_enrol WHERE courseid = 2 AND enrol = 'manual' LIMIT 1) as enrolid,
    nsi.id,
    0 as status,
    UNIX_TIMESTAMP() as timestart,
    0 as timeend,
    UNIX_TIMESTAMP(),
    UNIX_TIMESTAMP(),
    2 -- admin user
FROM new_student_ids nsi;

-- Assign student role in courses (mdl_role_assignments)
-- This requires matching to enrollment entries
INSERT INTO mdl_role_assignments (roleid, contextid, userid, timemodified, modifieruserid)
SELECT 
    5 as roleid, -- Student role
    ctx.id,
    nsi.id,
    UNIX_TIMESTAMP(),
    2
FROM new_student_ids nsi
JOIN mdl_context ctx ON ctx.instanceid = 2 AND ctx.contextlevel = 50
LIMIT 15;

-- =====================================================================
-- VERIFICATION QUERIES
-- =====================================================================

SELECT '=== New Moodle Students ===' AS verification;
SELECT id, username, firstname, lastname, email, confirmed, timecreated 
FROM mdl_user 
WHERE username LIKE 's%_student'
ORDER BY id DESC LIMIT 15;

SELECT '=== Student Enrollments ===' AS verification;
SELECT 
    u.username, 
    u.firstname, 
    u.lastname, 
    c.fullname as course,
    ue.timestart
FROM mdl_user_enrolments ue
JOIN mdl_user u ON ue.userid = u.id
JOIN mdl_enrol e ON ue.enrolid = e.id
JOIN mdl_course c ON e.courseid = c.id
WHERE u.username LIKE 's%_student'
ORDER BY u.id DESC;

-- Drop temporary table
DROP TEMPORARY TABLE IF EXISTS new_student_ids;
