# Handoff: Image → UUID + Platform Gateway

## สถานะ

**โค้ด upload (จังหวะ add/edit/delete) เสร็จแล้ว** — ทุก path ที่อัปรูปใหม่ใช้ UUID + ส่งขึ้น gateway แล้ว:

- course (`POST/PATCH /admin/courses`, `POST /moodle/courses`)
- cert-signer (`/admin/cert-signers`)
- cert-template (`/admin/cert-templates`)
- system / slideshow (`POST /admin/slideshow/image`)
- profile / page-builder (`POST /images/upload`)

ทั้งหมด stage เป็นไฟล์ UUID ชั่วคราว แล้ว `uploadByCategory` → gateway (gateway gen UUID ของตัวเองอีกชั้น) แล้วลบ temp ทิ้ง
ส่วน **CBS เป็น PDF ไม่ใช่รูป** → ยัง local + ตั้งชื่อ `timestamp-name` (นอก scope งานนี้)
ส่วน **profile** ยังไม่ทำ — ไว้ทำทีหลัง (migration ไม่แตะ profile อยู่แล้ว)

## Migration ไฟล์ local เดิม → gateway

ไฟล์: `scripts/migrate-platform-gateway-images.ts` (typecheck ผ่าน)
สแกน DB 4 ตาราง (LLTCOURSE / LLTSLIDESHOW / LLTTEMPLATECERTIFICATE / LLTSIGNCERTIFICATE)
หา source ที่เป็น local แล้วอัปขึ้น gateway + อัปเดต URL ใน DB

- **ไม่ลบไฟล์ local** — copy ไป temp แล้วอัป, ลบแค่ temp → ของเดิมอยู่ครบจน test เสร็จค่อยลบเอง
- **idempotent** — ข้าม row ที่เป็น gateway url แล้ว / external / หาไฟล์ local ไม่เจอ / ไม่ใช่รูป
- บนเครื่องตอนนี้มีจริง: `uploads/courses/*.png` (53) + `uploads/system/homepicture1,2.png`
  cert-signers / cert-templates โฟลเดอร์ว่าง → row พวกนั้นจะถูก skip (missing-local)

### วิธีรัน

```bash
# 1) dry-run ดูก่อนว่าจะทำอะไร (เฉพาะ course)
npm run migrate:platform-gateway-images -- --only=course

# 2) ลงมือจริง
npm run migrate:platform-gateway-images -- --only=course --apply

# ไม่ใส่ --only = ทำทุก category (รวม homepicture/system ด้วย)
```

### homepicture (LLTSLIDESHOW id 11, 12)

อยู่ใน DB จริง (ไม่ใช่แค่หน้าเว็บ) — `uploads/system/homepicture1.png`, `homepicture2.png`
ถ้าอยากให้เป็น UUID เหมือนกันหมด: รัน `--only=course,system --apply`
หมายเหตุ: `lifelong2-front/src/assets/homepicture*.png` เป็น static asset ของ build (fallback) คนละชุดกับใน DB — อันนั้นไม่ต้องแตะ

## หลัง test ผ่าน

ลบไฟล์ local เองได้: `uploads/courses/`, `uploads/system/` (และ `uploaded_file/` temp)

## Future TODO (ยังไม่ทำตอนนี้)

- [ ] **CBS PDF → UUID** — ตอนนี้ `uploads/course-cbs/*.pdf` ตั้งชื่อ `timestamp-name.pdf`
      (`buildCbsFilename` / `createCbsFilename` ใน `admin-courses.controller.ts` + `lltcourse.controller.ts`)
      อนาคตเปลี่ยนเป็น UUID ให้เหมือน flow รูป
- [ ] **CBS PDF เก็บบน gateway?** — ตอนนี้ยังเก็บ local + serve ผ่าน BACKEND_PUBLIC_URL
      **ต้องคุยกับทีมก่อน** ว่าจะย้ายขึ้น gateway เหมือนรูปไหม (ยังไม่ตัดสินใจ)
- [ ] **profile images** — ยังไม่ได้ทำ migration ฝั่ง profile (flow upload ใหม่ใช้ gateway แล้ว)
- [ ] cert-signer / cert-template — flow ใหม่ขึ้น gateway แล้ว, ไม่มีไฟล์ local ค้าง (โฟลเดอร์ว่าง) → ไม่ต้อง migrate

## Checklist สถานะปัจจุบัน (อัปเดต)

- [x] โค้ด CRUD upload รูป (course/cert-signer/cert-template/system) → gateway + UUID + ลบ temp local
- [x] migration script พร้อม (`--only=` filter, ไม่ลบ local, idempotent, typecheck ผ่าน)
- [ ] **ยังไม่ได้รัน `--apply`** → course/system ยัง**ไม่ได้**อยู่บน gateway → **ห้ามลบ local**
- [ ] เทสต์หลัง apply
- [ ] ลบ local หลังเทสต์ผ่าน
