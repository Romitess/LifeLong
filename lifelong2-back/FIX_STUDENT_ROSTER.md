# 🔧 Fix Student Roster - Display Students on Instructor Page

## ❌ ปัญหา

หน้า Instructor Student Roster ไม่แสดงรายชื่อนักเรียน (0 enrolled) แม้ว่าได้เพิ่มข้อมูลนักเรียนแล้ว

**สาเหตุ:** ข้อมูล enrollment (LLTENROLL) ยังไม่ได้เชื่อมโยงกับ course `C2601001`

---

## ✅ วิธีแก้ไข

### ตัวเลือก 1️⃣: Python Script (แนะนำ)

**ข้อกำหนด:**

- Python 3.6+
- `mysql-connector-python` ติดตั้งแล้ว

**ขั้นตอน:**

```bash
cd c:\Users\ntpkim\lifelong\lifelong2-back

# ครั้งแรกติดตั้ง dependency
pip install mysql-connector-python

# รัน script
python scripts/fix_student_roster.py
```

**ผลลัพธ์:**

```
✓ Connected to lifelong2 database
1. Finding course C2601001...
   ✓ Found: C2601001 - Introduction to Data Science (ID: X)
2. Checking for student data...
   ✓ Found 15 students to enroll
4. Adding student enrollments...
   ✓ Added 15 new enrollments
5. Verification...
   ✓ Total students enrolled: 15
✓ SUCCESS: Student enrollments added to C2601001!
```

---

### ตัวเลือก 2️⃣: ใช้ Adminer Web UI

1. เปิด http://localhost:8081
2. เข้าสู่ระบบ:
   - Server: `db`
   - Username: `root`
   - Password: `password`
   - Database: `lifelong2`

3. ไปที่ "SQL command"
4. คัดลอกและวาง (paste) content จากไฟล์:
   ```
   scripts/fix_student_roster_c2601001.sql
   ```
5. กด Execute

---

### ตัวเลือก 3️⃣: ใช้ MySQL Command Line

```bash
cd c:\Users\ntpkim\lifelong\lifelong2-back
mysql -h localhost -u root -ppassword lifelong2 < scripts/fix_student_roster_c2601001.sql
```

---

## ✨ ตรวจสอบผลลัพธ์

### 1. ตรวจสอบใน Database

```sql
SELECT
    e.ENROLL_ID,
    u.USER_USERNAME,
    CONCAT(u.USER_FNAMETH, ' ', u.USER_LNAMETH) as name,
    c.COSE_CODE,
    e.ENROLL_DATE
FROM LLTENROLL e
JOIN LLTUMUSER u ON e.USER_ID = u.USER_ID
JOIN LLTCOURSE c ON e.COSE_ID = c.COSE_ID
WHERE c.COSE_CODE = 'C2601001'
LIMIT 5;
```

**ผลลัพธ์ที่คาดหวัง:** 15 แถว (นักเรียน)

### 2. ตรวจสอบใน Web UI

1. เปิด http://localhost:3000
2. Login เป็น Instructor: `instructor_test` / `password123`
3. ไปที่ Student Roster
4. เลือก Course: `C2601001 ุ Introduction to Data Science`
5. **ควรเห็น:**
   - ✓ "ลงทะเบียนแล้ว: **15** คน"
   - ✓ "จำนวนที่นั่ง: 40 คน"
   - ✓ ความคืบหน้าเฉลี่ย: 0%
   - ✓ ตารางแสดง 15 นักเรียน

---

## 📊 ข้อมูลที่เพิ่มขึ้น

### ตาราง LLTENROLL

```
ENROLL_ID (AUTO)
OPENCLASS_ID: 1
COSE_ID: <C2601001's ID>
USER_ID: <Student ID> ✕ 15
ENROLL_DATE: 2026-05-21
ENROLL_AMOUNT: 2500
ENROLL_BALANCE: 0
ENROLL_PAYSTATUS: 'P' (Paid)
ENROLL_STATUS: 'A' (Active)
```

### นักเรียนที่ลงทะเบียน

- s001_student ถึง s015_student
- ทั้งหมด 15 คน
- จากหลายสาขา (IT, Business, Design, Engineering)

---

## 🔄 API Flow

เมื่อ Instructor เข้าหน้า Student Roster:

1. Frontend เรียก: `/api/instructor/courses/{courseId}/learners?email=...`
2. Backend query: `LLTENROLL` table
3. ได้รับ: 15 นักเรียนที่ลงทะเบียน
4. แสดงในตาราง

---

## 📝 บันทึก

- ข้อมูลนักเรียนต้องเพิ่มด้วย `add_student_data.py` ก่อน
- ถ้ายังไม่ได้เพิ่ม ให้รัน:

  ```bash
  python scripts/add_student_data.py
  ```

- หาก Instructor ไม่เห็นนักเรียน:
  - ตรวจสอบว่า Instructor เป็น owner ของ course C2601001
  - ใน database ตรวจสอบ: `LLTCOURSE` → `CREATEUSER` = instructor_test@example.com

---

## 🛠️ Troubleshooting

### ❌ ผลลัพธ์: "Course C2601001 not found!"

- ตรวจสอบ: `SELECT * FROM LLTCOURSE WHERE COSE_CODE = 'C2601001';`
- หาก course ไม่มี ให้ทำการสร้าง หรือ ใช้ course ID อื่น

### ❌ ผลลัพธ์: "No students found!"

- ต้องรัน `add_student_data.py` ก่อน
- ตรวจสอบ: `SELECT * FROM LLTUMUSER WHERE USER_USERNAME LIKE 's%_student';`

### ❌ Web UI ยังไม่เห็นนักเรียน

- Refresh browser (Ctrl+F5)
- Clear browser cache
- ตรวจสอบ backend server ทำงานอยู่

### ❌ Error Database

- ตรวจสอบการเชื่อมต่อ MySQL:
  ```bash
  mysql -h localhost -u root -ppassword -e "SELECT 1;"
  ```
- ตรวจสอบ port 3306 เปิดอยู่

---

## 📁 ไฟล์ที่เกี่ยวข้อง

```
scripts/
├── add_student_data.py              # ← เพิ่มข้อมูลนักเรียนก่อน
├── fix_student_roster.py            # ← เพิ่ม enrollment ให้ C2601001
├── fix_student_roster_c2601001.sql  # ← SQL script
└── README.md
```

---

**พร้อม! 🎉**

เรียกใช้ `fix_student_roster.py` และนักเรียนจะปรากฏบนหน้า Student Roster
