FROM node:20

WORKDIR /app

# คัดลอกไฟล์ package.json (ไม่คัดลอก yarn.lock จาก Windows เพื่อให้สร้างใหม่ตาม Linux)
COPY package.json ./

# (ตัวเลือก) คัดลอก .yarnrc ถ้ามี เพื่อบังคับ ignore-platform
COPY .yarnrc ./

# ติดตั้ง dependencies โดยข้าม optional dependencies
RUN yarn install --ignore-optional

# (ตัวเลือก) ติดตั้งโมดูลที่จำเป็นโดยตรง
RUN yarn add --dev @rollup/rollup-linux-x64-gnu

# คัดลอกโค้ดทั้งหมด
COPY . .

# สร้างโปรเจกต์ด้วย Vite
RUN yarn build

EXPOSE 5173

CMD ["yarn", "dev"]
