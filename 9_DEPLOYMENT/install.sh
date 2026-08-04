#!/bin/bash
echo "🧠 กำลังติดตั้งระบบ Chat Vider..."

echo "✅ ติดตั้งแพ็กเกจที่ต้องใช้"
npm install

echo "✅ สร้างโครงสร้างโฟลเดอร์"
mkdir -p database_store backup_files user_projects extensions exports

if [ ! -f .env ]; then
  echo "📋 สร้างไฟล์การตั้งค่า .env จากแบบอย่าง"
  cp .env.example .env
  echo "⚠️  กรุณาเปิดไฟล์ .env แล้วกรอกข้อมูลให้ครบถ้วนก่อนเริ่มใช้งาน"
fi

echo ""
echo "✅ ติดตั้งครบถ้วน!"
echo "👉 เริ่มทำงาน: npm start"
echo "👉 หรือใช้ Docker: docker compose up -d"

