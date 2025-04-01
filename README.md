# SE-BookHub

- **SE-BookHub** เป็นระบบจัดการหนังสือออนไลน์ที่พัฒนาด้วย Django (Backend) และ React (Frontend) โดยมีการเชื่อมต่อกับฐานข้อมูล PostgreSQL และใช้ Supabase สำหรับการจัดเก็บไฟล์

โปรเจกต์นี้ใช้ **Client-Server Architecture** เป็นหลัก เนื่องจากมีการแยกส่วนระหว่าง Frontend (React) และ Backend (Django REST Framework) ซึ่งสื่อสารกันผ่าน API โดยมีลักษณะดังนี้:

1. **Client-Server Architecture**
- Frontend (Client):
พัฒนาโดยใช้ React ซึ่งทำหน้าที่เป็น client-side application
ส่งคำขอ (HTTP requests) ไปยัง Backend ผ่าน REST API
แสดงผลข้อมูลที่ได้รับจาก Backend ให้กับผู้ใช้

- Backend (Server):
พัฒนาโดยใช้ Django REST Framework ซึ่งทำหน้าที่เป็น server-side application
จัดการคำขอจาก Frontend เช่น การยืมหนังสือ, การคืนหนังสือ, และการจัดการบัญชีผู้ใช้
เชื่อมต่อกับฐานข้อมูล (PostgreSQL) เพื่อจัดการข้อมูล
ตัวอย่างการทำงาน:

2. **MVC (Model-View-Controller)**
ในส่วนของ Backend (Django REST Framework) ใช้ MVC Pattern:

- Model:
จัดการข้อมูลในฐานข้อมูล เช่น Book, BookBorrow, User
- View:
จัดการคำขอ HTTP และส่งข้อมูลไปยัง Frontend เช่น BorrowBookView, ReturnBookView
Controller (Serializer):
แปลงข้อมูลระหว่าง Model และ JSON เช่น BookSerializer, UserSerializer

- Client-Server:
Frontend (React) และ Backend (Django REST Framework) สื่อสารกันผ่าน REST API

---

## **System Architecture**

- **Frontend**: พัฒนาโดยใช้ React และ Vite พร้อมการ deploy บน Vercel
- **Backend**: พัฒนาโดยใช้ Django และ Django REST Framework พร้อมการ deploy บน Render
- **Database**: ใช้ PostgreSQL บน Supabase
- **Storage**: ใช้ Supabase Storage สำหรับจัดเก็บไฟล์ เช่น รูปภาพและ PDF

---

## **Frontend**

### **Tech Stack**
- **Framework**: React
- **Build Tool**: Vite
- **Routing**: React Router
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Deployment**: Vercel

### **Features**
- หน้าเว็บสำหรับผู้ใช้ Reader และ Publisher
- ระบบ Authentication (Login/Signup)
- ระบบรีเซ็ตรหัสผ่าน
- ระบบอ่านหนังสือ (PDF Viewer)
- ระบบจัดการบัญชีผู้ใช้
- ระบบค้นหาและแสดงรายละเอียดหนังสือ

---

## **Backend**

### **Tech Stack**
- **Framework**: Django + Django REST Framework
- **Authentication**: Token-based Authentication
- **CORS**: รองรับการเชื่อมต่อกับ Frontend ผ่าน `django-cors-headers`
- **Static Files**: ใช้ Whitenoise สำหรับ static files ใน production
- **Deployment**: Render

### **Features**
- RESTful API สำหรับการจัดการผู้ใช้, หนังสือ, และแท็ก
- ระบบรีเซ็ตรหัสผ่านผ่านอีเมล
- ระบบจัดการไฟล์ (เช่น รูปภาพปกหนังสือ) บน Supabase Storage
- ระบบจัดการผู้ใช้ (Reader/Publisher/Admin)
- ระบบจัดการแท็กในหน้า Admin Dashboard

---

## **Database**

### **Tech Stack**
- **Database**: PostgreSQL
- **Hosting**: Supabase
- **ORM**: Django ORM

### **Schema Overview**
- **Users**: จัดเก็บข้อมูลผู้ใช้ เช่น ชื่อ, อีเมล, ประเภทผู้ใช้ (Reader/Publisher)
- **Books**: จัดเก็บข้อมูลหนังสือ เช่น ชื่อ, ผู้แต่ง, หมวดหมู่, รูปภาพปก, และไฟล์ PDF
- **Tags**: จัดเก็บแท็กที่เกี่ยวข้องกับหนังสือ
- **PasswordReset**: จัดเก็บ token สำหรับการรีเซ็ตรหัสผ่าน

---

## **Setup Instructions**

### **Backend**
1. Clone repository:
   - git clone https://github.com/likelessly/SE-BookHub.git
   - cd se-bookhub/backend
   - python -m venv venv
   - venv\Scripts\activate
   
3. Install Requirements:
   - pip install -r requirements.txt
   
4. Set up .env file
   
5. Runations:
   - python manage.py migrate
   
6. Start thelopment server:
   - python manage.py runserver
   
### **Frontend**
1. Navigate to the frontend directory:
   - cd ../frontend:
   - npm install
   - npm run dev
   
#### **Backend**
- Deploy on Render
- Configure environment variables in Render's dashboard

#### **Frontend**
- Deploy on Vercel
- Configure environment variables in Vercel's dashboard

