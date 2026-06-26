#!/usr/bin/env python3
"""
Script to add student enrollments to C2601001 course
This will fix the Student Roster display on the Instructor page
Required env vars: PYTHON_BACKEND_DB_PASSWORD
"""
import mysql.connector
from mysql.connector import Error
import sys
import os

# Add utils directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'utils'))
from env_validator import get_env

# Database configuration
DB_CONFIG = {
    'host': get_env('PYTHON_BACKEND_DB_HOST', fallback='localhost'),
    'user': get_env('PYTHON_BACKEND_DB_USER', fallback='root'),
    'password': get_env('PYTHON_BACKEND_DB_PASSWORD', sensitive=True),
    'database': get_env('PYTHON_BACKEND_DB_NAME', fallback='lifelong2'),
    'port': int(get_env('PYTHON_BACKEND_DB_PORT', fallback='3306'))
}

def connect_db():
    """Create database connection"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        if connection.is_connected():
            print(f"✓ Connected to {DB_CONFIG['database']} database")
            return connection
    except Error as e:
        print(f"✗ Error connecting to database: {e}")
        sys.exit(1)

def main():
    print("\n" + "="*70)
    print("FIX STUDENT ROSTER - Add Student Enrollments to C2601001")
    print("="*70 + "\n")
    
    connection = connect_db()
    cursor = connection.cursor()
    
    try:
        # Step 1: Find course C2601001
        print("1. Finding course C2601001...")
        cursor.execute("""
            SELECT COSE_ID, COSE_CODE, COSE_NAME 
            FROM LLTCOURSE 
            WHERE COSE_CODE = 'C2601001'
        """)
        result = cursor.fetchone()
        
        if not result:
            print("   ✗ ERROR: Course C2601001 not found!")
            cursor.close()
            connection.close()
            return False
        
        course_id, course_code, course_name = result
        print(f"   ✓ Found: {course_code} - {course_name} (ID: {course_id})")
        
        # Step 2: Check if students exist
        print("\n2. Checking for student data...")
        cursor.execute("""
            SELECT COUNT(*) 
            FROM LLTUMUSER 
            WHERE USER_USERNAME LIKE 's%_student'
        """)
        student_count = cursor.fetchone()[0]
        print(f"   ✓ Found {student_count} students to enroll")
        
        if student_count == 0:
            print("   ✗ ERROR: No students found! Please run add_student_data.py first")
            cursor.close()
            connection.close()
            return False
        
        # Step 3: Check existing enrollments
        print("\n3. Checking existing enrollments...")
        cursor.execute("""
            SELECT COUNT(*) 
            FROM LLTENROLL e
            JOIN LLTCOURSE c ON e.COSE_ID = c.COSE_ID
            WHERE c.COSE_CODE = 'C2601001'
        """)
        existing_count = cursor.fetchone()[0]
        print(f"   ℹ Current enrollments: {existing_count}")
        
        # Step 4: Add new enrollments
        print("\n4. Adding student enrollments...")
        cursor.execute("""
            INSERT INTO LLTENROLL (OPENCLASS_ID, COSE_ID, USER_ID, ENROLL_DATE, 
                                   ENROLL_AMOUNT, ENROLL_BALANCE, ENROLL_PAYSTATUS, 
                                   ENROLL_STATUS, CREATEUSER, CREATEDATE)
            SELECT 
                1,
                c.COSE_ID,
                u.USER_ID,
                CURDATE(),
                2500,
                0,
                'P',
                'A',
                'SYSTEM',
                NOW()
            FROM LLTUMUSER u
            JOIN LLTCOURSE c ON c.COSE_CODE = 'C2601001'
            WHERE u.USER_USERNAME LIKE 's%_student'
            AND NOT EXISTS (
                SELECT 1 FROM LLTENROLL e 
                WHERE e.USER_ID = u.USER_ID 
                AND e.COSE_ID = c.COSE_ID
            )
        """)
        
        new_count = cursor.rowcount
        connection.commit()
        print(f"   ✓ Added {new_count} new enrollments")
        
        # Step 5: Verify
        print("\n5. Verification...")
        cursor.execute("""
            SELECT COUNT(*) 
            FROM LLTENROLL e
            JOIN LLTCOURSE c ON e.COSE_ID = c.COSE_ID
            WHERE c.COSE_CODE = 'C2601001'
        """)
        total_enrolled = cursor.fetchone()[0]
        print(f"   ✓ Total students enrolled: {total_enrolled}")
        
        # Step 6: Show sample enrolled students
        print("\n6. Sample enrolled students:")
        cursor.execute("""
            SELECT 
                u.USER_USERNAME,
                CONCAT(u.USER_FNAMETH, ' ', u.USER_LNAMETH) as name_th,
                u.USER_EMAIL,
                e.ENROLL_DATE
            FROM LLTENROLL e
            JOIN LLTUMUSER u ON e.USER_ID = u.USER_ID
            JOIN LLTCOURSE c ON e.COSE_ID = c.COSE_ID
            WHERE c.COSE_CODE = 'C2601001'
            ORDER BY e.ENROLL_DATE DESC
            LIMIT 5
        """)
        
        for row in cursor.fetchall():
            username, name_th, email, enroll_date = row
            print(f"   • {username} - {name_th} ({email})")
        
        print("\n" + "="*70)
        print("✓ SUCCESS: Student enrollments added to C2601001!")
        print("="*70)
        print("\nNext steps:")
        print("1. Refresh the Instructor page (localhost:3000/#/instructor/students)")
        print("2. Select course C2601001")
        print("3. You should now see the enrolled students in the Student Roster")
        print()
        
        return True
        
    except Error as e:
        print(f"✗ Error: {e}")
        connection.rollback()
        return False
    finally:
        cursor.close()
        connection.close()

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
