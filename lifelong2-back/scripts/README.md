# 📚 วิธีเพิ่มข้อมูลนักเรียนจริง

> ฉันได้สร้างชุดข้อมูลนักเรียน 15 คน พร้อมจำนวนหลักสูตรต่างๆ สำหรับทั้ง Backend และ Moodle Database

## 🎯 ที่ทำ

### ✅ สิ่งที่เพิ่มขึ้นมา

**Backend Database (lifelong2):**

- ✓ 15 บัญชีผู้ใช้ใน `LLT_AUTH_USERS`
- ✓ 15 โปรไฟล์นักเรียนใน `LLTUMUSER` (พร้อมข้อมูลสมบูรณ์)
- ✓ ตัวอย่างการลงทะเบียน (enrollment) ใน `LLTENROLL`

**Moodle Database (LLLv.2):**

- ✓ 15 ผู้ใช้ Moodle ใน `mdl_user`
- ✓ Enrollment ในหลักสูตร ใน `mdl_user_enrolments`
- ✓ บทบาท (Role) ใน `mdl_role_assignments`

---

## 📂 ไฟล์ที่สร้างขึ้น

```
scripts/
├── add_student_data.sql              # SQL สำหรับ Backend DB
├── add_moodle_student_data.sql       # SQL สำหรับ Moodle DB
├── add_student_data.py               # Python script (recommended)
├── add_student_data.bat              # Windows batch script
└── verify_student_data.sql           # Script ตรวจสอบข้อมูล

STUDENT_DATA_IMPORT.md                # Documentation (งาน README)
```

---

## 🚀 วิธีใช้ (3 ตัวเลือก)

### ตัวเลือก 1️⃣ : ใช้ Python (⭐ แนะนำ)

**ข้อกำหนด:**

- Python 3.6+
- MySQL connector: `pip install mysql-connector-python`

**ขั้นตอน:**

```bash
# 1. ไปที่ directory backend
cd c:\Users\ntpkim\lifelong\lifelong2-back

# 2. ติดตั้ง dependency (ถ้ายังไม่ได้)
pip install mysql-connector-python

# 3. รัน script
python scripts/add_student_data.py
```

**ผลลัพธ์:**

```
✓ Connected to lifelong2 database
✓ Connected to LLLv.2 database
✓ Added 15 users to LLT_AUTH_USERS
✓ Added 15 user profiles to LLTUMUSER
✓ Enrolled 5 students in course
✓ Added 15 users to mdl_user
✓ Enrolled 15 students in course
✓ SUCCESS: Student data added to both databases!
```

---

### ตัวเลือก 2️⃣ : ใช้ Adminer (Web UI)

**Adminer URLs:**

- Backend: http://localhost:8081
- Moodle: http://localhost:8888

**ขั้นตอน Backend:**

1. เปิด http://localhost:8081
2. ใส่ข้อมูล:
   ```
   Server: db
   Username: root
   Password: password
   Database: lifelong2
   ```
3. กด "Login"
4. ไปที่ "SQL command"
5. คัดลอก content จาก `scripts/add_student_data.sql` ทั้งหมด
6. วาง (paste) และ Execute

**ขั้นตอน Moodle:**

1. เปิด http://localhost:8888
2. ใส่ข้อมูล:
   ```
   Server: moodle_mariadb
   Username: bn_moodle
   Password: moodle_password
   Database: LLLv.2
   ```
3. กด "Login"
4. ไปที่ "SQL command"
5. คัดลอก content จาก `scripts/add_moodle_student_data.sql` ทั้งหมด
6. วาง (paste) และ Execute

---

### ตัวเลือก 3️⃣ : ใช้ MySQL Command Line

**Requirements:**

- MySQL client ติดตั้ง

**ขั้นตอน:**

```bash
# Backend Database
cd c:\Users\ntpkim\lifelong\lifelong2-back
mysql -h localhost -u root -ppassword lifelong2 < scripts/add_student_data.sql

# Moodle Database
mysql -h localhost -P 3307 -u bn_moodle -pmoodle_password "LLLv.2" < scripts/add_moodle_student_data.sql
```

---

## ✅ การตรวจสอบว่าสำเร็จ

### ด้วย Adminer:

1. **Backend (http://localhost:8081):**
   - คลิก Database → lifelong2
   - ค้นหาตาราง `LLT_AUTH_USERS`
   - Filter: `WHERE ROLE = 'Student' AND USERNAME LIKE 's%_student'`
   - ควรเห็น 15 บ้านลัคท์

2. **Moodle (http://localhost:8888):**
   - คลิก Database → LLLv.2
   - ค้นหาตาราง `mdl_user`
   - ค้นหา username ที่ขึ้นต้นด้วย 's%\_student'
   - ควรเห็น 15 บ้านลัคท์

### ด้วย SQL Query:

```bash
# Backend
mysql -h localhost -u root -ppassword lifelong2 < scripts/verify_student_data.sql

# Moodle
mysql -h localhost -P 3307 -u bn_moodle -pmoodle_password "LLLv.2" < scripts/verify_student_data.sql
```

---

## 👥 ข้อมูลนักเรียน (15 คน)

| #   | Username     | ชื่อ-นามสกุล      | โปรแกรม     | Email                     |
| --- | ------------ | ----------------- | ----------- | ------------------------- |
| 1   | s001_student | สมชาย ปัญญาดี     | IT          | student001@university.edu |
| 2   | s002_student | นิศา กิจวัฒนา     | IT          | student002@university.edu |
| 3   | s003_student | ธนาวิ ศรีสุวรรณ   | IT          | student003@university.edu |
| 4   | s004_student | กนกวรรณ เจริงศิริ | IT          | student004@university.edu |
| 5   | s005_student | วิชิต สถาปัตย์    | IT          | student005@university.edu |
| 6   | s006_student | อรสา บุตรดี       | Business    | student006@university.edu |
| 7   | s007_student | พชร ชัยสุข        | Business    | student007@university.edu |
| 8   | s008_student | ศศิกา นวลแฉ       | Business    | student008@university.edu |
| 9   | s009_student | สิริพร อ่อมนวล    | Business    | student009@university.edu |
| 10  | s010_student | เมธา มงคลวงค์     | Design      | student010@university.edu |
| 11  | s011_student | พรพิมล สายัญญา    | Design      | student011@university.edu |
| 12  | s012_student | อังศุมาลย์ พลงาม  | Design      | student012@university.edu |
| 13  | s013_student | สุรชาติ มณฑากิจ   | Engineering | student013@university.edu |
| 14  | s014_student | จรูญ ศรีมงคล      | Engineering | student014@university.edu |
| 15  | s015_student | ประเสริฐ สันติมา  | Engineering | student015@university.edu |

**Password สำหรับทั้งหมด:** `Password@123`

---

## 🔒 การลบหรือรีเซ็ตข้อมูล

### ลบนักเรียนทั้งหมด:

```sql
-- Backend
DELETE FROM LLTENROLL WHERE USER_ID IN (
    SELECT USER_ID FROM LLT_AUTH_USERS WHERE USERNAME LIKE 's%_student'
);
DELETE FROM LLTUMUSER WHERE USER_USERNAME LIKE 's%_student';
DELETE FROM LLT_AUTH_USERS WHERE USERNAME LIKE 's%_student';

-- Moodle
DELETE FROM mdl_user_enrolments WHERE userid IN (
    SELECT id FROM mdl_user WHERE username LIKE 's%_student'
);
DELETE FROM mdl_role_assignments WHERE userid IN (
    SELECT id FROM mdl_user WHERE username LIKE 's%_student'
);
DELETE FROM mdl_user WHERE username LIKE 's%_student';
```

### รีเซ็ต Docker (ลบทั้งหมด):

```bash
cd c:\Users\ntpkim\lifelong\lifelong2-back
docker compose down -v  # ลบข้อมูลทั้งหมด
docker compose up -d    # สร้าง containers ใหม่
```

---

## 🛠️ Troubleshooting

### ❌ Error: "Cannot connect to database"

```bash
# ตรวจสอบว่า Docker ทำงาน
docker ps

# ตรวจสอบบันทึก
docker logs lll_db
docker logs moodle_mariadb
```

### ❌ Error: "Permission denied"

- ตรวจสอบ username/password ในไฟล์ script
- ตรวจสอบ port (Backend: 3306, Moodle: 3307)

### ❌ Data ไม่ปรากฏ

- รันคำสั่ง verify: `verify_student_data.sql`
- ตรวจสอบว่า SQL execute สำเร็จ (ไม่มี error)
- ลอง refresh page ของ web application

---

## 📋 สรุปโครงสร้าง

```
lifelong2-back/
├── scripts/
│   ├── add_student_data.sql           (15 นักเรียน - Backend)
│   ├── add_moodle_student_data.sql    (15 นักเรียน - Moodle)
│   ├── add_student_data.py            (Automation script)
│   ├── add_student_data.bat           (Windows batch)
│   └── verify_student_data.sql        (Verification queries)
│
├── STUDENT_DATA_IMPORT.md             (Detailed documentation)
└── ...
```

---

## 📞 ตัวอย่างข้อมูล

**Backend Tables:**

- `LLT_AUTH_USERS`: บัญชีเข้าสู่ระบบ
- `LLTUMUSER`: ข้อมูล profile + เบอร์ + ที่อยู่
- `LLTENROLL`: การลงทะเบียนหลักสูตร

**Moodle Tables:**

- `mdl_user`: ผู้ใช้ Moodle LMS
- `mdl_user_enrolments`: ลงทะเบียนในหลักสูตร
- `mdl_role_assignments`: บทบาท (Student role)

---

## ✨ สิ่งต่อไป

หลังจากเพิ่มข้อมูลแล้ว:

1. **ลอง login** ด้วยบัญชีนักเรียน:
   - Username: `s001_student`
   - Password: `Password@123`

2. **ตรวจสอบ courses** ที่นักเรียนลงทะเบียน

3. **เพิ่มเติม enrollments** ตามต้องการ

4. **ปรับแต่ง** ข้อมูล username/email หากต้องการ

---

**สร้างเสร็จแล้ว! 🎉**

สามารถจากไปยังเอกสารอื่น: `STUDENT_DATA_IMPORT.md`
