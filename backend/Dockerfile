# ใช้ Python base image
FROM python:3.9

# ตั้งค่า Working Directory
WORKDIR /app

# คัดลอกไฟล์ที่จำเป็น
COPY requirements.txt requirements.txt

# ติดตั้ง dependencies
RUN pip install --no-cache-dir -r requirements.txt

# คัดลอกโค้ดทั้งหมด
COPY . .

# เปิดพอร์ต 8000
EXPOSE 8000

# รันคำสั่ง migration และเริ่มเซิร์ฟเวอร์
CMD ["sh", "-c", "python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]
