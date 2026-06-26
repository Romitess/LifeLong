@echo off
REM =====================================================================
REM Script to add student data to both databases
REM Usage: add_student_data.bat
REM =====================================================================

echo.
echo ======================================================
echo ADDING STUDENT DATA TO DATABASES
echo ======================================================
echo.

REM Check if Docker is running
echo Checking Docker status...
docker ps > nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not running or not installed
    exit /b 1
)

echo ✓ Docker is running
echo.

REM Backend DB connection details
set BACKEND_HOST=localhost
set BACKEND_PORT=3306
set BACKEND_USER=root
set BACKEND_PASSWORD=password
set BACKEND_DB=lifelong2

REM Moodle DB connection details
set MOODLE_HOST=localhost
set MOODLE_PORT=3307
set MOODLE_USER=bn_moodle
set MOODLE_PASSWORD=moodle_password
set MOODLE_DB=LLLv.2

echo ======================================================
echo 1. ADDING STUDENTS TO BACKEND DATABASE
echo ======================================================

REM Execute backend SQL script
echo Adding students to LLT_AUTH_USERS and LLTUMUSER...
mysql -h %BACKEND_HOST% -u %BACKEND_USER% -p%BACKEND_PASSWORD% %BACKEND_DB% < add_student_data.sql

if errorlevel 1 (
    echo ERROR: Failed to add students to backend database
    exit /b 1
)

echo ✓ Backend database updated successfully
echo.

echo ======================================================
echo 2. ADDING STUDENTS TO MOODLE DATABASE
echo ======================================================

REM Execute moodle SQL script
echo Adding students to Moodle...
mysql -h %MOODLE_HOST% -u %MOODLE_USER% -p%MOODLE_PASSWORD% %MOODLE_DB% < add_moodle_student_data.sql

if errorlevel 1 (
    echo ERROR: Failed to add students to Moodle database
    exit /b 1
)

echo ✓ Moodle database updated successfully
echo.

echo ======================================================
echo ✓ SUCCESS: Student data has been added!
echo ======================================================
echo.
echo Added 15 students to both databases:
echo  - Backend: LLT_AUTH_USERS and LLTUMUSER tables
echo  - Moodle: mdl_user and course enrollments
echo.
echo Default password for all students: Password@123
echo.
echo You can now access the system with student accounts:
echo  - s001_student (สมชาย ปัญญาดี)
echo  - s002_student (นิศา กิจวัฒนา)
echo  - ... and 13 more students
echo.
