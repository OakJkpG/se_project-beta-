Backend: Django + Django REST Framework
ใช้ Django REST Framework สร้าง REST API
รองรับ CORS ให้เชื่อมต่อกับ Frontend
ใช้ PostgreSQL หรือ SQLite เป็น Database

Frontend: React + Vite
ใช้ React Router จัดการหน้าเว็บ
ใช้ Axios เรียก API จาก Backend
ออกแบบ Component-based

Database: PostgreSQL
รองรับการจัดการข้อมูลหลายตาราง เช่น ผู้ใช้ & หนังสือ
ใช้ Django ORM จัดการ Database

BookHub/
│── backend/             
│   ├── bookhub/         
│   ├── books/           
│   ├── users/
│   ├── venv/                  
│   ├── manage.py        
│   ├── requirements.txt 
│   ├── .env             
│   ├── Dockerfile       
│   └── Procfile          
│
│── frontend/            
│   ├── src/             
│   │   ├── pages/       
│   │   │   ├── Home.jsx 
│   │   │   ├── Books.jsx
│   │   ├── api.js       
│   │   ├── App.jsx      
│   │   ├── main.jsx     
│   │   ├── index.css    
│   ├── public/
│   ├── node_modules/
│   ├── .gitignore
│   ├── eslint.config.js       
│   ├── index.html  
│   ├── package-lock.json       
│   ├── package.json            
│   └── vite.config.js   
│── README.md            
└── .gitignore           