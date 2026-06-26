-- =====================================================================
-- Add Realistic Student Data to Backend Database (lifelong2)
-- =====================================================================
-- This script adds:
-- 1. Student accounts in LLT_AUTH_USERS
-- 2. Student profiles in LLTUMUSER
-- 3. Enrollment records in LLTENROLL

-- First, get the list of courses available
SELECT 'Available Courses:' AS info;
SELECT COSE_ID, COSE_NAME FROM LLTCOURSE LIMIT 5;

-- =====================================================================
-- PART 1: Add Students to LLT_AUTH_USERS (Backend Auth Table)
-- =====================================================================

INSERT INTO LLT_AUTH_USERS (USERNAME, EMAIL, PASSWORD, ROLE, CREATEUSER, CREATEDATE) VALUES
-- Group 1: IT Program Students
('s001_student', 'student001@university.edu', MD5('Password@123'), 'Student', 'SYSTEM', NOW()),
('s002_student', 'student002@university.edu', MD5('Password@123'), 'Student', 'SYSTEM', NOW()),
('s003_student', 'student003@university.edu', MD5('Password@123'), 'Student', 'SYSTEM', NOW()),
('s004_student', 'student004@university.edu', MD5('Password@123'), 'Student', 'SYSTEM', NOW()),
('s005_student', 'student005@university.edu', MD5('Password@123'), 'Student', 'SYSTEM', NOW()),
-- Group 2: Business Program Students
('s006_student', 'student006@university.edu', MD5('Password@123'), 'Student', 'SYSTEM', NOW()),
('s007_student', 'student007@university.edu', MD5('Password@123'), 'Student', 'SYSTEM', NOW()),
('s008_student', 'student008@university.edu', MD5('Password@123'), 'Student', 'SYSTEM', NOW()),
('s009_student', 'student009@university.edu', MD5('Password@123'), 'Student', 'SYSTEM', NOW()),
-- Group 3: Design Program Students
('s010_student', 'student010@university.edu', MD5('Password@123'), 'Student', 'SYSTEM', NOW()),
('s011_student', 'student011@university.edu', MD5('Password@123'), 'Student', 'SYSTEM', NOW()),
('s012_student', 'student012@university.edu', MD5('Password@123'), 'Student', 'SYSTEM', NOW()),
-- Group 4: Engineering Program Students
('s013_student', 'student013@university.edu', MD5('Password@123'), 'Student', 'SYSTEM', NOW()),
('s014_student', 'student014@university.edu', MD5('Password@123'), 'Student', 'SYSTEM', NOW()),
('s015_student', 'student015@university.edu', MD5('Password@123'), 'Student', 'SYSTEM', NOW());

-- =====================================================================
-- PART 2: Add Student Profiles in LLTUMUSER (Student Master Data)
-- =====================================================================

INSERT INTO LLTUMUSER (USER_FNAMETH, USER_LNAMETH, USER_FNAMEEN, USER_LNAMEEN, USER_TEL, USER_USERNAME, USER_EMAIL, USER_PASSWORD, USER_STATUS, CREATEUSER, CREATEDATE, LMS_ID) VALUES
-- IT Program
('สมชาย', 'ปัญญาดี', 'Somchai', 'Panyadee', '0812345601', 's001_student', 'student001@university.edu', MD5('Password@123'), '1', 'SYSTEM', NOW(), 3),
('นิศา', 'กิจวัฒนา', 'Nisa', 'Kitvattana', '0812345602', 's002_student', 'student002@university.edu', MD5('Password@123'), '1', 'SYSTEM', NOW(), 4),
('ธนาวิ', 'ศรีสุวรรณ', 'Thanavee', 'Srisuwanna', '0812345603', 's003_student', 'student003@university.edu', MD5('Password@123'), '1', 'SYSTEM', NOW(), 5),
('กนกวรรณ', 'เจริงศิริ', 'Kanokwan', 'Charoengsiri', '0812345604', 's004_student', 'student004@university.edu', MD5('Password@123'), '1', 'SYSTEM', NOW(), 6),
('วิชิต', 'สถาปัตย์', 'Wichit', 'Sathapat', '0812345605', 's005_student', 'student005@university.edu', MD5('Password@123'), '1', 'SYSTEM', NOW(), 7),
-- Business Program
('อรสา', 'บุตรดี', 'Oranisa', 'Bootdee', '0812345606', 's006_student', 'student006@university.edu', MD5('Password@123'), '1', 'SYSTEM', NOW(), 8),
('พชร', 'ชัยสุข', 'Phachard', 'Chaisuk', '0812345607', 's007_student', 'student007@university.edu', MD5('Password@123'), '1', 'SYSTEM', NOW(), 9),
('ศศิกา', 'นวลแฉ', 'Sasika', 'Nonchae', '0812345608', 's008_student', 'student008@university.edu', MD5('Password@123'), '1', 'SYSTEM', NOW(), 10),
('สิริพร', 'อ่อมนวล', 'Siriporn', 'Omnual', '0812345609', 's009_student', 'student009@university.edu', MD5('Password@123'), '1', 'SYSTEM', NOW(), 11),
-- Design Program
('เมธา', 'มงคลวงค์', 'Metta', 'Mongkolwong', '0812345610', 's010_student', 'student010@university.edu', MD5('Password@123'), '1', 'SYSTEM', NOW(), 12),
('พรพิมล', 'สายัญญา', 'Porpimon', 'Sayanya', '0812345611', 's011_student', 'student011@university.edu', MD5('Password@123'), '1', 'SYSTEM', NOW(), 13),
('อังศุมาลย์', 'พลงาม', 'Angsumalee', 'Phlongam', '0812345612', 's012_student', 'student012@university.edu', MD5('Password@123'), '1', 'SYSTEM', NOW(), 14),
-- Engineering Program
('สุรชาติ', 'มณฑากิจ', 'Surachai', 'Mondakij', '0812345613', 's013_student', 'student013@university.edu', MD5('Password@123'), '1', 'SYSTEM', NOW(), 15),
('จรูญ', 'ศรีมงคล', 'Charoon', 'Srimongkhon', '0812345614', 's014_student', 'student014@university.edu', MD5('Password@123'), '1', 'SYSTEM', NOW(), 16),
('ประเสริฐ', 'สันติมา', 'Prasert', 'Santima', '0812345615', 's015_student', 'student015@university.edu', MD5('Password@123'), '1', 'SYSTEM', NOW(), 17);

-- =====================================================================
-- PART 3: Add Enrollment Records in LLTENROLL
-- =====================================================================
-- Note: Adjust COSE_ID and OPENCLASS_ID based on actual courses in database
-- You may need to modify these IDs to match your actual course IDs

INSERT INTO LLTENROLL (OPENCLASS_ID, COSE_ID, USER_ID, ENROLL_DATE, ENROLL_AMOUNT, ENROLL_BALANCE, ENROLL_PAYSTATUS, ENROLL_STATUS, CREATEUSER, CREATEDATE) 
SELECT 1, COSE_ID, au.USER_ID, CURDATE(), 2500, 0, 'P', 'A', 'SYSTEM', NOW()
FROM LLT_AUTH_USERS au
JOIN LLTCOURSE c ON c.COSE_ID >= 1
WHERE au.USERNAME = 's001_student'
LIMIT 3;

-- Add more enrollments for other students
-- Modify these queries based on your actual course structure
-- This is a template - adjust COSE_ID and OPENCLASS_ID as needed

-- Example enrollment pattern:
-- Each student enrolls in 2-4 courses
-- Different groups of students take different courses

-- =====================================================================
-- VERIFICATION QUERIES
-- =====================================================================

-- Check newly added students
SELECT '=== New Students in LLT_AUTH_USERS ===' AS verification;
SELECT USER_ID, USERNAME, EMAIL, ROLE, CREATEDATE FROM LLT_AUTH_USERS 
WHERE USERNAME LIKE 's%_student' 
ORDER BY USER_ID DESC LIMIT 15;

-- Check student profiles
SELECT '=== New Student Profiles in LLTUMUSER ===' AS verification;
SELECT USER_ID, CONCAT(USER_FNAMETH, ' ', USER_LNAMETH) AS Name_TH, USER_EMAIL, USER_STATUS 
FROM LLTUMUSER 
WHERE USER_USERNAME LIKE 's%_student'
ORDER BY USER_ID DESC LIMIT 15;

-- Check enrollments (if any were added)
SELECT '=== Enrollments ===' AS verification;
SELECT e.ENROLL_ID, au.USERNAME, c.COSE_NAME, e.ENROLL_DATE, e.ENROLL_STATUS
FROM LLTENROLL e
JOIN LLT_AUTH_USERS au ON e.USER_ID = au.USER_ID
JOIN LLTCOURSE c ON e.COSE_ID = c.COSE_ID
WHERE au.USERNAME LIKE 's%_student'
LIMIT 20;
