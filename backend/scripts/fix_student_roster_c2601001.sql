-- =====================================================================
-- Fix Student Roster Display - Add Enrollments to Course C2601001
-- =====================================================================
-- This script adds the 15 students to the course C2601001
-- so they appear in the Instructor Student Roster page

-- 1. Find course ID for C2601001
SELECT 
    'Finding Course C2601001' AS step,
    COSE_ID as course_id,
    COSE_CODE as course_code,
    COSE_NAME as course_name
FROM LLTCOURSE
WHERE COSE_CODE = 'C2601001';

-- 2. Get the IDs of our newly added students (s001_student through s015_student)
SELECT 
    'Finding Student IDs' AS step,
    USER_ID,
    USER_USERNAME as username,
    CONCAT(USER_FNAMETH, ' ', USER_LNAMETH) as name_th
FROM LLTUMUSER
WHERE USER_USERNAME LIKE 's%_student'
ORDER BY USER_ID;

-- =====================================================================
-- MAIN: Add Enrollments for Course C2601001
-- =====================================================================

-- Get the course ID dynamically
SET @courseId = (SELECT COSE_ID FROM LLTCOURSE WHERE COSE_CODE = 'C2601001' LIMIT 1);

-- Verify course exists
IF @courseId IS NULL THEN
    SELECT 'ERROR: Course C2601001 not found!' AS error;
ELSE
    -- Get student IDs
    SELECT 'Course ID:' AS info, @courseId;
    
    -- Insert enrollments for all 15 students
    INSERT INTO LLTENROLL (OPENCLASS_ID, COSE_ID, USER_ID, ENROLL_DATE, ENROLL_AMOUNT, ENROLL_BALANCE, ENROLL_PAYSTATUS, ENROLL_STATUS, CREATEUSER, CREATEDATE)
    SELECT 
        1 as OPENCLASS_ID,
        @courseId as COSE_ID,
        u.USER_ID,
        CURDATE() as ENROLL_DATE,
        2500 as ENROLL_AMOUNT,
        0 as ENROLL_BALANCE,
        'P' as ENROLL_PAYSTATUS,
        'A' as ENROLL_STATUS,
        'SYSTEM' as CREATEUSER,
        NOW() as CREATEDATE
    FROM LLTUMUSER u
    WHERE u.USER_USERNAME LIKE 's%_student'
    AND NOT EXISTS (
        -- Prevent duplicates
        SELECT 1 FROM LLTENROLL e 
        WHERE e.USER_ID = u.USER_ID 
        AND e.COSE_ID = @courseId
    );
    
    SELECT 
        'Enrollment added successfully!' AS result,
        COUNT(*) as total_enrolled
    FROM LLTENROLL
    WHERE COSE_ID = @courseId
    AND USER_ID IN (SELECT USER_ID FROM LLTUMUSER WHERE USER_USERNAME LIKE 's%_student');
END IF;

-- =====================================================================
-- VERIFICATION: Show enrolled students for C2601001
-- =====================================================================

SELECT 
    'Student Roster for C2601001' AS section;

SELECT 
    e.ENROLL_ID,
    u.USER_USERNAME as username,
    CONCAT(u.USER_FNAMETH, ' ', u.USER_LNAMETH) as name_th,
    CONCAT(u.USER_FNAMEEN, ' ', u.USER_LNAMEEN) as name_en,
    u.USER_EMAIL as email,
    u.USER_TEL as phone,
    e.ENROLL_DATE as enrolled_date,
    e.ENROLL_STATUS as status,
    c.COSE_CODE as course_code,
    c.COSE_NAME as course_name
FROM LLTENROLL e
JOIN LLTUMUSER u ON e.USER_ID = u.USER_ID
JOIN LLTCOURSE c ON e.COSE_ID = c.COSE_ID
WHERE c.COSE_CODE = 'C2601001'
ORDER BY e.ENROLL_DATE DESC, u.USER_USERNAME;

-- =====================================================================
-- Final Count
-- =====================================================================

SELECT 
    'Final Summary' AS section,
    COUNT(*) as total_students
FROM LLTENROLL e
JOIN LLTCOURSE c ON e.COSE_ID = c.COSE_ID
WHERE c.COSE_CODE = 'C2601001';
