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
if "%BACKEND_HOST%"=="" set BACKEND_HOST=localhost
if "%BACKEND_PORT%"=="" set BACKEND_PORT=3306
if "%BACKEND_USER%"=="" set BACKEND_USER=
if "%BACKEND_PASSWORD%"=="" set BACKEND_PASSWORD=
if "%BACKEND_DB%"=="" set BACKEND_DB=

REM Moodle DB connection details
if "%MOODLE_HOST%"=="" set MOODLE_HOST=localhost
if "%MOODLE_PORT%"=="" set MOODLE_PORT=3307
if "%MOODLE_USER%"=="" set MOODLE_USER=
if "%MOODLE_PASSWORD%"=="" set MOODLE_PASSWORD=
if "%MOODLE_DB%"=="" set MOODLE_DB=

if "%BACKEND_USER%"=="" (
    echo ERROR: BACKEND_USER is required
    exit /b 1
)
if "%BACKEND_DB%"=="" (
    echo ERROR: BACKEND_DB is required
    exit /b 1
)
if "%MOODLE_USER%"=="" (
    echo ERROR: MOODLE_USER is required
    exit /b 1
)
if "%MOODLE_DB%"=="" (
    echo ERROR: MOODLE_DB is required
    exit /b 1
)

echo ======================================================
echo 1. ADDING STUDENTS TO BACKEND DATABASE
echo ======================================================

REM Execute backend SQL script
echo Adding students to LLT_AUTH_USERS and LLTUMUSER...
set MYSQL_PWD=%BACKEND_PASSWORD%
mysql -h %BACKEND_HOST% -P %BACKEND_PORT% -u %BACKEND_USER% %BACKEND_DB% < add_student_data.sql
set MYSQL_PWD=

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
set MYSQL_PWD=%MOODLE_PASSWORD%
mysql -h %MOODLE_HOST% -P %MOODLE_PORT% -u %MOODLE_USER% %MOODLE_DB% < add_moodle_student_data.sql
set MYSQL_PWD=

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
echo Default password for all students: configured by the seed data
echo.
echo You can now access the system with student accounts:
echo  - s001_student (สมชาย ปัญญาดี)
echo  - s002_student (นิศา กิจวัฒนา)
echo  - ... and 13 more students
echo.
