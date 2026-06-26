# เพิ่มข้อมูลนักเรียน - Student Data Import

## 📋 ข้อมูลนักเรียนที่ถูกเพิ่ม (15 Students)

### โปรแกรม IT (5 คน)

| Username     | ชื่อ-นามสกุล      | Email                     | เบอร์      |
| ------------ | ----------------- | ------------------------- | ---------- |
| s001_student | สมชาย ปัญญาดี     | student001@university.edu | 0812345601 |
| s002_student | นิศา กิจวัฒนา     | student002@university.edu | 0812345602 |
| s003_student | ธนาวิ ศรีสุวรรณ   | student003@university.edu | 0812345603 |
| s004_student | กนกวรรณ เจริงศิริ | student004@university.edu | 0812345604 |
| s005_student | วิชิต สถาปัตย์    | student005@university.edu | 0812345605 |

### โปรแกรม Business (4 คน)

| Username     | ชื่อ-นามสกุล   | Email                     | เบอร์      |
| ------------ | -------------- | ------------------------- | ---------- |
| s006_student | อรสา บุตรดี    | student006@university.edu | 0812345606 |
| s007_student | พชร ชัยสุข     | student007@university.edu | 0812345607 |
| s008_student | ศศิกา นวลแฉ    | student008@university.edu | 0812345608 |
| s009_student | สิริพร อ่อมนวล | student009@university.edu | 0812345609 |

### โปรแกรม Design (3 คน)

| Username     | ชื่อ-นามสกุล     | Email                     | เบอร์      |
| ------------ | ---------------- | ------------------------- | ---------- |
| s010_student | เมธา มงคลวงค์    | student010@university.edu | 0812345610 |
| s011_student | พรพิมล สายัญญา   | student011@university.edu | 0812345611 |
| s012_student | อังศุมาลย์ พลงาม | student012@university.edu | 0812345612 |

### โปรแกรม Engineering (3 คน)

| Username     | ชื่อ-นามสกุล     | Email                     | เบอร์      |
| ------------ | ---------------- | ------------------------- | ---------- |
| s013_student | สุรชาติ มณฑากิจ  | student013@university.edu | 0812345613 |
| s014_student | จรูญ ศรีมงคล     | student014@university.edu | 0812345614 |
| s015_student | ประเสริฐ สันติมา | student015@university.edu | 0812345615 |

---

## 🔑 ข้อมูลเข้าสู่ระบบ

**รหัสผ่านเดียวกันสำหรับทั้งหมด:**

```
Password@123
```

---

## 📁 ไฟล์ที่สร้างขึ้น

### 1. **add_student_data.sql**

- SQL script สำหรับเพิ่มข้อมูลนักเรียนลงใน Backend Database
- เพิ่มลงตาราง: `LLT_AUTH_USERS`, `LLTUMUSER`, `LLTENROLL`
- สามารถใช้ได้กับ MySQL/MariaDB tools

### 2. **add_moodle_student_data.sql**

- SQL script สำหรับเพิ่มข้อมูลนักเรียนลงใน Moodle Database
- เพิ่มลงตาราง: `mdl_user`, `mdl_user_enrolments`, `mdl_role_assignments`
- เชื่อมโยงนักเรียนกับหลักสูตร

### 3. **add_student_data.py**

- Python script สำหรับเชื่อมต่อและเพิ่มข้อมูล
- จัดการข้อมูลให้ถูกต้องในทั้งสองฐานข้อมูล

### 4. **add_student_data.bat**

- Batch script สำหรับ Windows
- รันคำสั่งต่างๆ โดยอัตโนมัติ

---

## 🚀 วิธีใช้

### ตัวเลือก 1: ใช้ Python Script (แนะนำ)

```bash
cd c:\Users\ntpkim\lifelong\backend
python scripts/add_student_data.py
```

**ข้อกำหนดเบื้องต้น:**

- Python 3.6+ ติดตั้งแล้ว
- `mysql-connector-python` ติดตั้งแล้ว:
  ```bash
  pip install mysql-connector-python
  ```

### ตัวเลือก 2: ใช้ MySQL Command Line

```bash
# Backend Database
mysql -h localhost -u root -ppassword lifelong2 < scripts/add_student_data.sql

# Moodle Database
mysql -h localhost -u bn_moodle -pmoodle_password -P 3307 LLLv.2 < scripts/add_moodle_student_data.sql
```

### ตัวเลือก 3: ใช้ Adminer Web Interface

1. เปิด http://localhost:8081 (Backend DB)
   - Server: `db`
   - Username: `root`
   - Password: `password`
   - Database: `lifelong2`
   - วาง SQL จากไฟล์ `add_student_data.sql`

2. เปิด http://localhost:8888 (Moodle)
   - Server: `moodle_mariadb`
   - Username: `bn_moodle`
   - Password: `moodle_password`
   - Database: `LLLv.2`
   - วาง SQL จากไฟล์ `add_moodle_student_data.sql`

---

## ✅ การตรวจสอบ

### ตรวจสอบใน Backend Database

```sql
-- ตรวจสอบจำนวนนักเรียน
SELECT COUNT(*) FROM LLT_AUTH_USERS WHERE ROLE='Student' AND USERNAME LIKE 's%_student';

-- ดูรายชื่อนักเรียน
SELECT USER_ID, CONCAT(USER_FNAMETH, ' ', USER_LNAMETH) AS Name, USER_EMAIL
FROM LLTUMUSER
WHERE USER_USERNAME LIKE 's%_student'
ORDER BY USER_ID;

-- ตรวจสอบการลงทะเบียน
SELECT e.ENROLL_ID, au.USERNAME, c.COSE_NAME, e.ENROLL_STATUS
FROM LLTENROLL e
JOIN LLT_AUTH_USERS au ON e.USER_ID = au.USER_ID
JOIN LLTCOURSE c ON e.COSE_ID = c.COSE_ID
WHERE au.USERNAME LIKE 's%_student'
LIMIT 10;
```

### ตรวจสอบใน Moodle Database

```sql
-- ตรวจสอบจำนวนนักเรียน Moodle
SELECT COUNT(*) FROM mdl_user WHERE username LIKE 's%_student';

-- ดูรายชื่อนักเรียน
SELECT id, username, firstname, lastname, email
FROM mdl_user
WHERE username LIKE 's%_student'
ORDER BY id;

-- ตรวจสอบการลงทะเบียนหลักสูตร
SELECT u.username, u.firstname, u.lastname, c.fullname
FROM mdl_user_enrolments ue
JOIN mdl_user u ON ue.userid = u.id
JOIN mdl_enrol e ON ue.enrolid = e.id
JOIN mdl_course c ON e.courseid = c.id
WHERE u.username LIKE 's%_student'
ORDER BY u.username;
```

---

## 📊 ข้อมูลที่เพิ่มเข้าไป

### Backend Database (lifelong2) - 3 ตาราง

#### 1. LLT_AUTH_USERS (Authentication)

- **15 บัญชีผู้ใช้** สำหรับเข้าสู่ระบบ
- Username: `s001_student` ถึง `s015_student`
- ROLE: `Student`

#### 2. LLTUMUSER (User Master)

- **15 โปรไฟล์นักเรียน** พร้อมข้อมูลเพิ่มเติม
- ชื่อไทยและอังกฤษ
- เบอร์ติดต่อ
- เชื่อมโยงกับ LMS User ID

#### 3. LLTENROLL (Enrollment)

- **ตัวอย่าง enrollment** เพื่อแสดงการลงทะเบียนหลักสูตร
- สามารถเพิ่มเติมหรือปรับแต่งได้ตามต้องการ

### Moodle Database (LLLv.2) - 3 ตาราง

#### 1. mdl_user

- **15 ผู้ใช้ Moodle LMS**
- สถานะผ่านการยืนยัน (confirmed)
- ข้อมูล profile ที่สมบูรณ์

#### 2. mdl_user_enrolments

- **ลงทะเบียนในหลักสูตร**
- เชื่อมโยงนักเรียนกับ courses
- สถานะ active

#### 3. mdl_role_assignments

- **บทบาท (Role)** ในหลักสูตร
- Role ID 5 = Student role

---

## 🔐 ความปลอดภัย

> ⚠️ **หมายเหตุ:**
>
> - รหัสผ่านนี้คือตัวอย่างเท่านั้น
> - สำหรับการใช้งาน Production ควรเปลี่ยนเป็นรหัสผ่านแข็งแรง
> - ไม่ควร commit รหัสผ่านเข้า Git
> - ใช้ environment variables สำหรับข้อมูลที่ลับ

---

## 🔄 การแก้ไขหรือลบข้อมูล

### ลบนักเรียนทั้งหมด

```sql
-- Backend Database
DELETE FROM LLTENROLL WHERE USER_ID IN (
    SELECT USER_ID FROM LLT_AUTH_USERS WHERE USERNAME LIKE 's%_student'
);
DELETE FROM LLTUMUSER WHERE USER_USERNAME LIKE 's%_student';
DELETE FROM LLT_AUTH_USERS WHERE USERNAME LIKE 's%_student';

-- Moodle Database
DELETE FROM mdl_user_enrolments WHERE userid IN (
    SELECT id FROM mdl_user WHERE username LIKE 's%_student'
);
DELETE FROM mdl_role_assignments WHERE userid IN (
    SELECT id FROM mdl_user WHERE username LIKE 's%_student'
);
DELETE FROM mdl_user WHERE username LIKE 's%_student';
```

### อัปเดตรหัสผ่าน

```sql
-- Backend Database
UPDATE LLT_AUTH_USERS SET PASSWORD = MD5('NewPassword@123')
WHERE USERNAME LIKE 's%_student';

UPDATE LLTUMUSER SET USER_PASSWORD = MD5('NewPassword@123')
WHERE USER_USERNAME LIKE 's%_student';

-- Moodle Database
UPDATE mdl_user SET password = MD5('NewPassword@123')
WHERE username LIKE 's%_student';
```

---

## 📞 ช่วยเหลือ

หากมีปัญหา:

1. **ตรวจสอบ Docker ทำงาน:**

   ```bash
   docker ps
   ```

2. **ตรวจสอบการเชื่อมต่อฐานข้อมูล:**
   - Backend: `mysql -h localhost -u root -ppassword -e "SELECT 1;"`
   - Moodle: `mysql -h localhost -P 3307 -u bn_moodle -pmoodle_password -e "SELECT 1;"`

3. **ดูบันทึก Docker:**

   ```bash
   docker logs lll_db
   docker logs moodle_mariadb
   ```

4. **รีเซ็ตฐานข้อมูล:**
   ```bash
   docker compose down -v
   docker compose up -d
   ```

---

## 📝 บันทึกเพิ่มเติม

- ข้อมูลทั้งหมดเป็นตัวอย่างเพื่อการพัฒนาและทดสอบ
- สามารถปรับแต่ง username, email, หรือข้อมูล personal ได้ตามต้องการ
- ลงทะเบียนหลักสูตร (enrollment) เป็นตัวอย่างเท่านั้น สามารถเพิ่มเติมได้
- สำหรับข้อมูลนักเรียนจริง ให้ใช้ข้อมูลจากระบบจดทะเบียนของสถาบัน

---

**สร้างโดย:** Copilot  
**วันที่:** 2026-05-21
