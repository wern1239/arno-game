# Football Prediction — Setup Guide

## ขั้นตอนการตั้งค่า

### 1. ตั้งค่า Database (Railway)

1. ไปที่ https://railway.app → New Project → PostgreSQL
2. คัดลอก `DATABASE_URL` จาก Connect tab

### 2. อัปเดต .env

```
DATABASE_URL="postgresql://..."   ← ใส่ค่าจาก Railway
NEXTAUTH_SECRET="random-secret-ยาวๆ-เปลี่ยนด้วย"
NEXTAUTH_URL="https://your-domain.vercel.app"
```

### 3. สร้าง Database Tables

```bash
npx prisma db push
```

### 4. สร้าง Admin User

```bash
npm run db:seed
```

Default: `admin` / `admin123` — **เปลี่ยนรหัสผ่านด้วย!**

### 5. Deploy ไป Vercel

```bash
# ติดตั้ง Vercel CLI
npm i -g vercel

# Deploy
vercel

# ตั้งค่า Environment Variables ใน Vercel Dashboard:
# DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL
```

## ระบบคะแนน

| ผลทาย | คะแนน |
|-------|-------|
| ถูกทิศทาง (W/D/L) | +3 |
| ถูกสกอร์ตรง | +5 |
| ผิด | 0 |

## การใช้งาน Admin

1. Login ด้วย `admin` / `admin123`
2. กด **ADMIN** ที่ navbar
3. เพิ่มแมตช์: ชื่อทีม, วันเวลา, สัปดาห์ที่
4. หลังแมตช์จบ: กด "อัปเดต" → ใส่สกอร์ → เลือก "จบแล้ว" → บันทึก
5. ระบบจะคำนวณคะแนนให้อัตโนมัติ
