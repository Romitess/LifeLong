#!/usr/bin/env python3
"""
Script to add realistic student data to both Moodle and Backend databases
"""
import mysql.connector
from mysql.connector import Error
import sys
from datetime import datetime
import hashlib

# Database configurations
BACKEND_DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'password',  # Change if different
    'database': 'lifelong2',
    'port': 3306
}

MOODLE_DB_CONFIG = {
    'host': 'localhost',
    'user': 'bn_moodle',
    'password': 'moodle_password',  # Change if different
    'database': 'LLLv.2',
    'port': 3307
}

# Student data
STUDENTS = [
    # IT Program
    {'fname_th': 'สมชาย', 'lname_th': 'ปัญญาดี', 'fname_en': 'Somchai', 'lname_en': 'Panyadee', 'email': 'student001@university.edu', 'tel': '0812345601'},
    {'fname_th': 'นิศา', 'lname_th': 'กิจวัฒนา', 'fname_en': 'Nisa', 'lname_en': 'Kitvattana', 'email': 'student002@university.edu', 'tel': '0812345602'},
    {'fname_th': 'ธนาวิ', 'lname_th': 'ศรีสุวรรณ', 'fname_en': 'Thanavee', 'lname_en': 'Srisuwanna', 'email': 'student003@university.edu', 'tel': '0812345603'},
    {'fname_th': 'กนกวรรณ', 'lname_th': 'เจริงศิริ', 'fname_en': 'Kanokwan', 'lname_en': 'Charoengsiri', 'email': 'student004@university.edu', 'tel': '0812345604'},
    {'fname_th': 'วิชิต', 'lname_th': 'สถาปัตย์', 'fname_en': 'Wichit', 'lname_en': 'Sathapat', 'email': 'student005@university.edu', 'tel': '0812345605'},
    
    # Business Program
    {'fname_th': 'อรสา', 'lname_th': 'บุตรดี', 'fname_en': 'Oranisa', 'lname_en': 'Bootdee', 'email': 'student006@university.edu', 'tel': '0812345606'},
    {'fname_th': 'พชร', 'lname_th': 'ชัยสุข', 'fname_en': 'Phachard', 'lname_en': 'Chaisuk', 'email': 'student007@university.edu', 'tel': '0812345607'},
    {'fname_th': 'ศศิกา', 'lname_th': 'นวลแฉ', 'fname_en': 'Sasika', 'lname_en': 'Nonchae', 'email': 'student008@university.edu', 'tel': '0812345608'},
    {'fname_th': 'สิริพร', 'lname_th': 'อ่อมนวล', 'fname_en': 'Siriporn', 'lname_en': 'Omnual', 'email': 'student009@university.edu', 'tel': '0812345609'},
    
    # Design Program
    {'fname_th': 'เมธา', 'lname_th': 'มงคลวงค์', 'fname_en': 'Metta', 'lname_en': 'Mongkolwong', 'email': 'student010@university.edu', 'tel': '0812345610'},
    {'fname_th': 'พรพิมล', 'lname_th': 'สายัญญา', 'fname_en': 'Porpimon', 'lname_en': 'Sayanya', 'email': 'student011@university.edu', 'tel': '0812345611'},
    {'fname_th': 'อังศุมาลย์', 'lname_th': 'พลงาม', 'fname_en': 'Angsumalee', 'lname_en': 'Phlongam', 'email': 'student012@university.edu', 'tel': '0812345612'},
    
    # Engineering Program
    {'fname_th': 'สุรชาติ', 'lname_th': 'มณฑากิจ', 'fname_en': 'Surachai', 'lname_en': 'Mondakij', 'email': 'student013@university.edu', 'tel': '0812345613'},
    {'fname_th': 'จรูญ', 'lname_th': 'ศรีมงคล', 'fname_en': 'Charoon', 'lname_en': 'Srimongkhon', 'email': 'student014@university.edu', 'tel': '0812345614'},
    {'fname_th': 'ประเสริฐ', 'lname_th': 'สันติมา', 'fname_en': 'Prasert', 'lname_en': 'Santima', 'email': 'student015@university.edu', 'tel': '0812345615'},
]

PASSWORD = 'Password@123'

def hash_password(password):
    """Generate MD5 hash for password"""
    return hashlib.md5(password.encode()).hexdigest()

def connect_db(config):
    """Create database connection"""
    try:
        connection = mysql.connector.connect(**config)
        if connection.is_connected():
            print(f"✓ Connected to {config['database']} database")
            return connection
    except Error as e:
        print(f"✗ Error connecting to {config['database']}: {e}")
        sys.exit(1)

def add_backend_students(connection):
    """Add students to backend database"""
    print("\n" + "="*60)
    print("Adding Students to Backend Database (lifelong2)")
    print("="*60)
    
    cursor = connection.cursor()
    password_hash = hash_password(PASSWORD)
    
    try:
        # Add to LLT_AUTH_USERS
        print("\n1. Adding to LLT_AUTH_USERS...")
        for i, student in enumerate(STUDENTS, 1):
            username = f"s{i:03d}_student"
            cursor.execute("""
                INSERT INTO LLT_AUTH_USERS (USERNAME, EMAIL, PASSWORD, ROLE, CREATEUSER, CREATEDATE)
                VALUES (%s, %s, %s, %s, %s, NOW())
            """, (username, student['email'], password_hash, 'Student', 'SYSTEM'))
        
        connection.commit()
        print(f"   ✓ Added {len(STUDENTS)} users to LLT_AUTH_USERS")
        
        # Add to LLTUMUSER
        print("\n2. Adding to LLTUMUSER...")
        cursor.execute("SELECT USER_ID FROM LLT_AUTH_USERS WHERE ROLE='Student' ORDER BY USER_ID DESC LIMIT 1")
        last_user_id = cursor.fetchone()[0]
        start_user_id = last_user_id - len(STUDENTS) + 1
        
        for i, student in enumerate(STUDENTS):
            user_id = start_user_id + i
            cursor.execute("""
                INSERT INTO LLTUMUSER (USER_ID, USER_FNAMETH, USER_LNAMETH, USER_FNAMEEN, USER_LNAMEEN, 
                                       USER_TEL, USER_USERNAME, USER_EMAIL, USER_PASSWORD, USER_STATUS, 
                                       CREATEUSER, CREATEDATE)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
            """, (user_id, student['fname_th'], student['lname_th'], student['fname_en'], 
                  student['lname_en'], student['tel'], f"s{i+1:03d}_student", student['email'], 
                  password_hash, '1', 'SYSTEM'))
        
        connection.commit()
        print(f"   ✓ Added {len(STUDENTS)} user profiles to LLTUMUSER")
        
        # Get first course ID for enrollment example
        cursor.execute("SELECT COSE_ID FROM LLTCOURSE LIMIT 1")
        result = cursor.fetchone()
        
        if result:
            first_course_id = result[0]
            print(f"\n3. Sample Enrollment (Course ID: {first_course_id})...")
            
            # Enroll first 5 students in first course
            for i in range(min(5, len(STUDENTS))):
                user_id = start_user_id + i
                cursor.execute("""
                    INSERT INTO LLTENROLL (OPENCLASS_ID, COSE_ID, USER_ID, ENROLL_DATE, 
                                          ENROLL_AMOUNT, ENROLL_BALANCE, ENROLL_PAYSTATUS, 
                                          ENROLL_STATUS, CREATEUSER, CREATEDATE)
                    VALUES (%s, %s, %s, CURDATE(), %s, %s, %s, %s, %s, NOW())
                """, (1, first_course_id, user_id, 2500, 0, 'P', 'A', 'SYSTEM'))
            
            connection.commit()
            print(f"   ✓ Enrolled {min(5, len(STUDENTS))} students in course")
        
        # Verification
        print("\n4. Verification:")
        cursor.execute("SELECT COUNT(*) FROM LLT_AUTH_USERS WHERE ROLE='Student' AND USERNAME LIKE 's%_student'")
        count = cursor.fetchone()[0]
        print(f"   ✓ Total Student Users: {count}")
        
        cursor.execute("SELECT COUNT(*) FROM LLTUMUSER WHERE USER_USERNAME LIKE 's%_student'")
        count = cursor.fetchone()[0]
        print(f"   ✓ Total Student Profiles: {count}")
        
    except Error as e:
        print(f"✗ Error adding backend students: {e}")
        connection.rollback()
        return False
    finally:
        cursor.close()
    
    return True

def add_moodle_students(connection):
    """Add students to Moodle database"""
    print("\n" + "="*60)
    print("Adding Students to Moodle Database (LLLv.2)")
    print("="*60)
    
    cursor = connection.cursor()
    
    try:
        # Add to mdl_user
        print("\n1. Adding to mdl_user...")
        current_time = int(datetime.now().timestamp())
        
        for i, student in enumerate(STUDENTS, 1):
            username = f"s{i:03d}_student"
            cursor.execute("""
                INSERT INTO mdl_user 
                (auth, confirmed, policyagreed, deleted, suspended, mnethostid, username, email, 
                 firstname, lastname, mailformat, maildigest, maildisplay, autosubscribe, 
                 trackforums, timecreated, timemodified, timezone, lang)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, ('manual', 1, 0, 0, 0, 1, username, student['email'], 
                  student['fname_en'], student['lname_en'], 1, 0, 1, 1, 0, 
                  current_time, current_time, 'UTC', 'en'))
        
        connection.commit()
        print(f"   ✓ Added {len(STUDENTS)} users to mdl_user")
        
        # Get student user IDs
        cursor.execute("""
            SELECT id FROM mdl_user 
            WHERE username LIKE 's%_student' 
            ORDER BY id DESC LIMIT %s
        """, (len(STUDENTS),))
        
        student_ids = [row[0] for row in cursor.fetchall()]
        print(f"   ✓ Student IDs range: {min(student_ids)} - {max(student_ids)}")
        
        # Enroll in course (example - enroll in course ID 2)
        print("\n2. Setting up course enrollments...")
        cursor.execute("SELECT id FROM mdl_enrol WHERE courseid = 2 AND enrol = 'manual' LIMIT 1")
        result = cursor.fetchone()
        
        if result:
            enrol_id = result[0]
            for student_id in student_ids:
                cursor.execute("""
                    INSERT INTO mdl_user_enrolments 
                    (enrolid, userid, status, timestart, timeend, timecreated, timemodified, modifieruserid)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """, (enrol_id, student_id, 0, current_time, 0, current_time, current_time, 2))
            
            connection.commit()
            print(f"   ✓ Enrolled {len(student_ids)} students in course")
        
        # Verification
        print("\n3. Verification:")
        cursor.execute("SELECT COUNT(*) FROM mdl_user WHERE username LIKE 's%_student'")
        count = cursor.fetchone()[0]
        print(f"   ✓ Total Moodle Students: {count}")
        
        cursor.execute("""
            SELECT COUNT(*) FROM mdl_user_enrolments ue
            JOIN mdl_user u ON ue.userid = u.id
            WHERE u.username LIKE 's%_student'
        """)
        count = cursor.fetchone()[0]
        print(f"   ✓ Total Enrollments: {count}")
        
    except Error as e:
        print(f"✗ Error adding Moodle students: {e}")
        connection.rollback()
        return False
    finally:
        cursor.close()
    
    return True

def main():
    print("\n" + "="*60)
    print("STUDENT DATA IMPORT SCRIPT")
    print("="*60)
    
    # Connect to Backend DB
    backend_conn = connect_db(BACKEND_DB_CONFIG)
    
    # Connect to Moodle DB
    moodle_conn = connect_db(MOODLE_DB_CONFIG)
    
    # Add students
    success_backend = add_backend_students(backend_conn)
    success_moodle = add_moodle_students(moodle_conn)
    
    # Cleanup
    backend_conn.close()
    moodle_conn.close()
    
    # Summary
    print("\n" + "="*60)
    if success_backend and success_moodle:
        print("✓ SUCCESS: Student data added to both databases!")
        print(f"  - {len(STUDENTS)} students added")
        print(f"  - Password for all: {PASSWORD}")
        print("="*60)
        return 0
    else:
        print("✗ FAILED: Error during import")
        print("="*60)
        return 1

if __name__ == '__main__':
    sys.exit(main())
