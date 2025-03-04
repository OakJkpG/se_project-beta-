from django.shortcuts import render, get_object_or_404, redirect

def main(request):
    return render(request, 'pages/main.html')

def home(request):
    return render(request, 'pages/home.html')

def book(request, book_id):
    # สำหรับตอนนี้ส่งข้อมูลแบบ static
    context = {'book_id': book_id}
    return render(request, 'pages/book.html', context)

def login_page(request):
    return render(request, 'pages/login.html')

def signup(request):
    return render(request, 'pages/signup.html')

def account_reader(request):
    return render(request, 'pages/account_reader.html')

def account_publisher(request):
    return render(request, 'pages/account_publisher.html')

def edit_book(request):
    return render(request, 'pages/edit_book.html')

def add_book(request):
    return render(request, 'pages/add_book.html')

