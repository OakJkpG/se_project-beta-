from django.shortcuts import render, get_object_or_404, redirect
from .db_config import book_collection,user_collection
from .models import Book
from .forms import BookForm
from bson import ObjectId
from datetime import datetime
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate, login
from django.contrib.admin.views.decorators import staff_member_required

User = get_user_model()

def main(request):
    return render(request, 'pages/main.html')

def home(request):
    books = book_collection.find()

    # แปลง _id ให้เป็น string และเก็บใน id
    book_list = []
    for book in books:
        book['id'] = str(book['_id'])  # แปลง ObjectId เป็น string และเก็บใน 'id'
        del book['_id']  # ลบ '_id' ออก
        book_list.append(book)

    return render(request, 'pages/home.html', {'books': book_list})

def login_view(request):
    if request.method == "POST":
        username = request.POST.get('username')
        password = request.POST.get('password')

        # ตรวจสอบข้อมูลผู้ใช้ใน MongoDB
        user = user_collection.find_one({"username": username, "password": password})

        if user:
            # ตั้งค่า session
            request.session['username'] = username
            request.session['role'] = user.get('role')  # เก็บ role ไว้ใน session
            next_url = request.GET.get('next', 'home')  # ถ้ามี next parameter ให้ redirect ไปที่นั้น
            return redirect(next_url)  # หรือไปยังหน้า home หากไม่มี next
        else:
            error_message = "Username หรือ Password ไม่ถูกต้อง"
            return render(request, 'pages/login.html', {"error": error_message})

    return render(request, "pages/login.html")


def logout_view(request):
    # ล้างข้อมูล session ทั้งหมด
    request.session.flush()
    return redirect('login')

def signup(request):
    if request.method == "POST":
        role = request.POST.get("role")
        username = request.POST.get("username")
        password = request.POST.get("password")
        password2 = request.POST.get("password2")

        # ตรวจสอบรหัสผ่านให้ตรงกัน
        if password != password2:
            error_message = "รหัสผ่านไม่ตรงกัน"
            # ระบุ tab ที่ต้องการให้ active โดยส่งผ่าน query parameter
            form_type = role  # reader หรือ publisher
            return render(request, "pages/signup.html", {"error": error_message, "form": form_type})
        
        # กรณีสำหรับ publisher เพิ่มการตรวจสอบ idcard ด้วย
        if role == "publisher" and not request.POST.get("idcard"):
            error_message = "กรุณากรอกรหัสปชช. ให้ครบถ้วน"
            return render(request, "pages/signup.html", {"error": error_message, "form": role})
        
        registration_date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        borrowed_books = []

        user_data = {
            "username": username,
            "password": password,  # ในระบบจริงควรแฮชรหัสผ่านก่อนบันทึก
            "role": role,
            "registration_date": registration_date,
            "borrowed_books": borrowed_books,
        }
        
        if role == "publisher":
            user_data["idcard"] = request.POST.get("idcard")
        
        # ตรวจสอบว่า username มีในระบบอยู่แล้วหรือไม่
        if user_collection.find_one({"username": username}):
            error_message = "Username นี้มีอยู่ในระบบแล้ว"
            return render(request, "pages/signup.html", {"error": error_message, "form": role})
        
        user_collection.insert_one(user_data)
        return redirect("login")
        
    return render(request, "pages/signup.html")


def account_reader(request):
    # ตรวจสอบว่ามี username ใน session หรือไม่
    username = request.session.get('username')
    if not username:
        return redirect('login')
    
    # ค้นหาข้อมูลผู้ใช้จาก MongoDB
    user = user_collection.find_one({"username": username, "role": "reader"})
    if not user:
        return redirect('login')
    
    # ดึงข้อมูลที่ต้องการส่งไปยัง template
    registration_date = user.get("registration_date", "N/A")
    borrowed_books_ids = user.get("borrowed_books", [])
    borrowed_count = len(borrowed_books_ids)
    
    # ดึงรายละเอียดหนังสือที่ถูกยืมจาก book_collection
    borrowed_books = []
    for book_id in borrowed_books_ids:
        book = book_collection.find_one({"_id": ObjectId(book_id)})
        if book:
            book['id'] = str(book['_id'])  # แปลง ObjectId เป็น string
            del book['_id']
            borrowed_books.append(book)
    
    # สร้าง dictionary context สำหรับส่งข้อมูล
    context = {
        "user": user,
        "registration_date": registration_date,
        "borrowed_count": borrowed_count,
        "books": borrowed_books,
    }
    
    # ส่งข้อมูล context ไปยังเทมเพลต account_reader.html
    return render(request, "pages/account_reader.html", context)


def account_publisher(request):
    # ตรวจสอบว่า user login หรือไม่
    username = request.session.get("username")
    if not username:
        return redirect("login")

    # ดึงข้อมูลผู้ใช้จากฐานข้อมูล MongoDB
    user = user_collection.find_one({"username": username, "role": "publisher"})
    if not user:
        return redirect("login")

    # ดึงรายการหนังสือที่ลงทะเบียนไว้โดย Publisher
    publisher_books = list(book_collection.find({"publisher": username}))

    # แปลง `_id` ของ MongoDB ให้กลายเป็น string เพื่อใช้ใน Django template
    for book in publisher_books:
        book["id"] = str(book["_id"])

    # ส่ง context ไปยัง template
    context = {
        "user": user,
        "registration_date": user.get("registration_date", "N/A"),
        "book_count": len(publisher_books),
        "books": publisher_books,
    }
    return render(request, "pages/account_publisher.html", context)

def borrow_book(request, book_id):
    # ตรวจสอบ username จาก session
    username = request.session.get('username')
    if not username:
        return redirect('login')
    
    # ดึงข้อมูลผู้ใช้จาก MongoDB
    user = user_collection.find_one({"username": username})
    if not user or user.get("role") != "reader":
        messages.error(request, "เฉพาะ Reader เท่านั้นที่สามารถยืมหนังสือได้")
        return redirect("book", book_id=book_id)
    
    # ดึงข้อมูลหนังสือจาก MongoDB โดยแปลง book_id เป็น ObjectId
    book = book_collection.find_one({"_id": ObjectId(book_id)})
    if not book:
        messages.error(request, "ไม่พบหนังสือ")
        return redirect("home")
    
    # ตรวจสอบว่า user ยังไม่ได้ยืมหนังสือนี้หรือไม่
    if book_id not in user.get("borrowed_books", []):
        borrowed_books = user.get("borrowed_books", [])
        borrowed_books.append(book_id)
        user_collection.update_one(
            {"username": user["username"]},
            {"$set": {"borrowed_books": borrowed_books}}
        )
        messages.success(request, f"คุณยืมหนังสือ '{book['title']}' เรียบร้อยแล้ว!")
    
    next_url = request.GET.get('next', 'account_reader')
    return redirect(next_url)

def edit_book(request, book_id):
    # ค้นหาหนังสือจาก MongoDB
    book = book_collection.find_one({"_id": ObjectId(book_id)})

    if not book:
        return redirect("account_publisher")  # ถ้าหาไม่เจอให้กลับไปที่หน้า account

    if request.method == "POST":
        # รับค่าที่แก้ไขจากฟอร์ม
        new_title = request.POST["title"]
        new_category = request.POST["category"]
        new_description = request.POST["description"]
        new_image_url = request.POST["image_url"]

        # อัปเดตข้อมูลหนังสือใน MongoDB
        book_collection.update_one(
            {"_id": ObjectId(book_id)},
            {
                "$set": {
                    "title": new_title,
                    "category": new_category,
                    "description": new_description,
                    "image_url": new_image_url,
                }
            }
        )

        return redirect("account_publisher")  # กลับไปหน้า Account

    return render(request, "pages/edit_book.html", {"book": book})

def book(request, book_id):
    # ดึงข้อมูลผู้ใช้จาก session
    username = request.session.get('username')
    if username:
        # ดึงข้อมูลผู้ใช้จาก MongoDB
        user = user_collection.find_one({"username": username})
    else:
        user = None

    # ดึงข้อมูลหนังสือจาก MongoDB
    book = book_collection.find_one({"_id": ObjectId(book_id)})

    if book:
        book['id'] = str(book['_id'])  # แปลง ObjectId เป็น string และเก็บใน 'id'
        del book['_id']  # ลบ '_id' ออก
        return render(request, 'pages/book.html', {'book': book, 'user': user})
    else:
        return render(request, 'pages/book_not_found.html')  # ถ้าหาไม่พบ



# เพิ่มหนังสือใหม่
def add_book(request):
    # ตรวจสอบว่า user login หรือไม่
    username = request.session.get("username")
    if not username:
        return redirect("login")

    if request.method == "POST":
        title = request.POST["title"]
        description = request.POST["description"]
        image_url = request.POST["image_url"]

        # เพิ่มข้อมูลหนังสือใหม่ลงใน MongoDB
        new_book = {
            "title": title,
            "description": description,
            "image_url": image_url,
            "publisher": username,  # เชื่อมกับ Publisher ที่เพิ่มหนังสือ
            "added_date": datetime.now(),
        }
        book_collection.insert_one(new_book)

        return redirect("account_publisher")

    return render(request, "pages/add_book.html")

def remove_book(request, book_id):
    # ลบหนังสือจาก MongoDB
    book_collection.delete_one({"_id": ObjectId(book_id)})
    return redirect('account_publisher')  # ไปหน้า publisher หลังจากลบ

def return_book(request, book_id):
    # ตรวจสอบว่ามี username ใน session หรือไม่
    username = request.session.get('username')
    if not username:
        return redirect('login')
    
    # ดึงข้อมูลผู้ใช้จาก MongoDB
    user = user_collection.find_one({"username": username})
    if not user or user.get("role") != "reader":
        messages.error(request, "คุณไม่มีสิทธิ์คืนหนังสือ")
        return redirect("account_reader")
    
    # ตรวจสอบว่าหนังสืออยู่ใน borrowed_books ของผู้ใช้หรือไม่
    borrowed_books = user.get("borrowed_books", [])
    if book_id in borrowed_books:
        # ถอน book_id ออกจาก borrowed_books
        user_collection.update_one(
            {"username": username},
            {"$pull": {"borrowed_books": book_id}}
        )
        messages.success(request, "คืนหนังสือเรียบร้อยแล้ว!")
    else:
        messages.error(request, "หนังสือดังกล่าวไม่อยู่ในบัญชีของคุณ")
    
    return redirect("account_reader")

@staff_member_required
def custom_admin(request):
    # ดึงรายชื่อ user ทั้งหมด (reader และ publisher) จาก MongoDB
    users = list(user_collection.find())
    
    # แยกประเภทผู้ใช้ออกเป็น reader และ publisher
    readers = [user for user in users if user.get("role") == "reader"]
    publishers = [user for user in users if user.get("role") == "publisher"]
    
    # ดึงรายการหนังสือทั้งหมด
    books_cursor = book_collection.find()
    books = []
    for book in books_cursor:
        book['id'] = str(book['_id'])  # แปลง ObjectId เป็น string
        del book['_id']
        books.append(book)
    
    context = {
        "readers": readers,
        "publishers": publishers,
        "books": books,
    }
    return render(request, "pages/custom_admin.html", context)