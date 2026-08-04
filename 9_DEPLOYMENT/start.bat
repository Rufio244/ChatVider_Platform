@echo off
title Chat Vider — System Start
echo 🧠 กำลังเริ่มระบบ Chat Vider...

if not exist "node_modules" (
  echo 📦 ยังไม่ได้ติดตั้งแพ็กเกจ กำลังติดตั้ง...
  npm install
)

if not exist ".env" (
  echo 📋 สร้างไฟล์การตั้งค่า
  copy .env.example .env
  echo ⚠️  กรุณาเปิดไฟล์ .env แล้วกรอกข้อมูลก่อนเริ่มใหม่อีกครั้ง
  pause
  exit /B
)

if not exist "database_store" mkdir database_store
if not exist "backup_files" mkdir backup_files
if not exist "user_projects" mkdir user_projects

echo 🚀 เริ่มการทำงานที่พอร์ต 3000
node 4_PROCESSING_SERVER/server.js
pause

