# AEGIS — Personal Protection

เว็บไซต์ HTML/CSS/JavaScript และ Bootstrap สำหรับ GitHub Pages ไม่ต้องติดตั้งแพ็กเกจหรือ build

## เผยแพร่

1. สร้าง repository ใน GitHub แล้วนำไฟล์และโฟลเดอร์ทั้งหมดจากแฟ้มนี้ใส่ไว้ที่ระดับบนสุดของ repository ให้เห็น index.html อยู่ด้านนอก ไม่ซ้อนไว้ในโฟลเดอร์อีกชั้น
2. หากใช้ไฟล์ ZIP ให้แตกไฟล์ก่อนอัปโหลด ไม่อัปโหลด ZIP เป็นหน้าเว็บ
3. เปิด Settings → Pages เลือก Deploy from a branch → main → /(root) แล้ว Save
4. เปิด URL ที่ GitHub แสดงหลังเผยแพร่สำเร็จ

## เปิดในเครื่อง

เปิด index.html ด้วยเบราว์เซอร์ หรือใช้ Live Server

## ไฟล์หลัก

- index.html — หน้าแรก
- guards.html — รายชื่อบอดี้การ์ดและแบ่งชุดละ 9 คน
- about.html — เกี่ยวกับบริษัทและทีมผู้จัดทำ
- assets/js/data.js — ข้อมูลบอดี้การ์ดและแพ็กเกจ เปลี่ยนชื่อ รูป ประสบการณ์ และพื้นที่บริการที่นี่
- assets/css/style.css — รูปแบบหลัก
- assets/images/team-suits — ภาพทีมชุดสูท
- assets/js/kaito-egg.js — ฉากลับเมื่อกดรูปคุโระบะ ไคโตะ

ไฟล์ Bootstrap ฟอนต์ รูป GIF และวิดีโอที่เว็บใช้อยู่ใน assets แล้ว ส่วนลิงก์ Resume ของสมาชิกเปิดเว็บไซต์ของสมาชิกตามเดิม

แบบฟอร์มและหน้า QR เป็นการแสดงผลในเบราว์เซอร์ ไม่มีระบบรับจองหรือรับชำระเงินผ่านเซิร์ฟเวอร์

## ใบอนุญาต

Bootstrap: assets/vendor/LICENSE-bootstrap.txt
Noto Sans Thai: assets/fonts/OFL.txt
