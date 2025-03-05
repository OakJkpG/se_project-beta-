from django.shortcuts import render, get_object_or_404, redirect
from .db_config import book_collection
from .models import Book
from .forms import BookForm
from bson import ObjectId

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

def login_page(request):
    return render(request, 'pages/login.html')

def signup(request):
    return render(request, 'pages/signup.html')

def account_reader(request):
    # ดึงข้อมูลหนังสือทั้งหมดจาก MongoDB
    books = book_collection.find()  # ตรวจสอบว่ามีข้อมูลใน collection หรือไม่

    # แปลง ObjectId เป็น string
    book_list = []
    for book in books:
        book['id'] = str(book['_id'])  # แปลง ObjectId เป็น string และเก็บใน 'id'
        del book['_id']  # ลบ '_id' ออก
        book_list.append(book)
    return render(request, "pages/account_reader.html", {"books": book_list})

def account_publisher(request):
    # ดึงข้อมูลหนังสือทั้งหมดจาก MongoDB
    books = book_collection.find()  # ตรวจสอบว่ามีข้อมูลใน collection หรือไม่

    # แปลง ObjectId เป็น string
    book_list = []
    for book in books:
        book['id'] = str(book['_id'])  # แปลง ObjectId เป็น string และเก็บใน 'id'
        del book['_id']  # ลบ '_id' ออก
        book_list.append(book)

    return render(request, "pages/account_publisher.html", {"books": book_list})

def edit_book(request):
    return render(request, 'pages/edit_book.html')

def book(request, book_id):
    # ดึงข้อมูลหนังสือจาก MongoDB โดยใช้ book_id
    book = book_collection.find_one({"_id": ObjectId(book_id)})

    if book:
        book['id'] = str(book['_id'])  # แปลง ObjectId เป็น string และเก็บใน 'id'
        del book['_id']  # ลบ '_id' ออก
        return render(request, 'pages/book.html', {'book': book})
    else:
        return render(request, 'pages/book_not_found.html')  # ถ้าหาไม่พบ


# เพิ่มหนังสือใหม่
def add_book(request):
    if request.method == 'POST':
        title = request.POST.get('title')
        description = request.POST.get('description')
        image_url = request.POST.get('image_url')

        # เพิ่มหนังสือใหม่ไปยัง MongoDB
        book_collection.insert_one({
            "title": title,
            "description": description,
            "image_url": image_url,
            "status": "available"  # ใช้ status เพื่อติดตามสถานะของหนังสือ
        })
        return redirect('account_publisher')  # ไปหน้า Publisher

    return render(request, 'pages/add_book.html')

def remove_book(request, book_id):
    # ลบหนังสือจาก MongoDB
    book_collection.delete_one({"_id": ObjectId(book_id)})
    return redirect('account_publisher')  # ไปหน้า publisher หลังจากลบ