# วิธี Activate LLL Theme ใน Moodle

## 1. เพิ่ม hosts file (ครั้งแรกครั้งเดียว)

เปิด `C:\Windows\System32\drivers\etc\hosts` ด้วย Administrator แล้วเพิ่ม:

```
127.0.0.1  lll.localhost
127.0.0.1  moodle.localhost
```

## 2. รัน Docker

```bash
cd lifelong2-back/moodle-docker
docker compose up -d
```

รอ Moodle start ประมาณ 2-3 นาที (ครั้งแรกนานกว่านั้น)

## 3. Update LLL_BASE_URL ใน lll-header.js

เปิดไฟล์ `moodle-theme/javascript/lll-header.js` บรรทัดที่ 18:

```js
// Dev:
var LLL_BASE_URL = 'http://localhost:9000';

// Production:
var LLL_BASE_URL = 'https://yourdomain.com';
```

## 4. Activate theme ใน Moodle Admin

1. เปิด `http://moodle.localhost/` หรือ `http://localhost:8080/`
2. Login: admin / Moodle123!
3. ไปที่ **Site administration → Appearance → Themes → Theme selector**
4. กด **Change theme** เลือก **LLL Theme**
5. ถ้าไม่เห็น theme → ไปที่ **Site administration → Development → Purge all caches** แล้วลองใหม่

## 5. Clear Moodle cache หลังแก้ไข CSS/JS

```bash
docker exec -it <moodle_container> bash -c "php admin/cli/purge_caches.php"
```

หรือผ่าน Admin UI: **Site administration → Development → Purge all caches**

## URL สรุป

| Service     | Dev URL                     |
|-------------|----------------------------|
| LLL App     | http://lll.localhost/       |
| Moodle      | http://moodle.localhost/    |
| phpMyAdmin  | http://localhost:8888/      |
