# admin_dashboard/views.py
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.auth.views import LoginView
from django.contrib import messages
from django.core.mail import send_mail
from django.contrib.auth.models import User
from books.models import Book
from django.urls import reverse
from django.contrib.auth import logout as auth_logout

# ฟังก์ชันตรวจสอบว่า user เป็น admin (superuser)
def is_admin(user):
    return user.is_superuser

class AdminLoginView(LoginView):
    template_name = 'admin_dashboard/login.html'

    def get_success_url(self):
        return reverse('admin_dashboard')

# Dashboard สำหรับ admin
@login_required
@user_passes_test(is_admin)
def admin_dashboard(request):
    all_users = User.objects.all()
    all_books = Book.objects.all()
    pending_publishers = User.objects.filter(profile__user_type='publisher', is_active=False)

    context = {
        'all_users': all_users,
        'all_books': all_books,
        'pending_publishers': pending_publishers,
    }

    return render(request, 'admin_dashboard/dashboard.html', context)

# View สำหรับ approve publisher registration
@login_required
@user_passes_test(is_admin)
def approve_publisher(request, user_id):
    publisher = get_object_or_404(User, id=user_id, profile__user_type='publisher', is_active=False)
    publisher.is_active = True
    publisher.save()
    send_mail(
         'Publisher Registration Approved',
         'Your publisher registration has been approved by admin.',
         'noreply@bookhub.com',
         [publisher.email],
         fail_silently=True,
    )
    messages.success(request, f"Publisher {publisher.email} approved.")
    return redirect('admin_dashboard')

# View สำหรับ reject publisher registration
@login_required
@user_passes_test(is_admin)
def reject_publisher(request, user_id):
    publisher = get_object_or_404(User, id=user_id, profile__user_type='publisher', is_active=False)
    publisher_email = publisher.email
    publisher.delete()
    send_mail(
         'Publisher Registration Rejected',
         'Your publisher registration has been rejected by admin.',
         'noreply@bookhub.com',
         [publisher_email],
         fail_silently=True,
    )
    messages.success(request, f"Publisher {publisher_email} rejected and removed.")
    return redirect('admin_dashboard')

# View สำหรับลบผู้ใช้
@login_required
@user_passes_test(is_admin)
def delete_user(request, user_id):
    user = get_object_or_404(User, id=user_id)
    user_email = user.email
    user.delete()
    messages.success(request, f"User {user_email} deleted.")
    return redirect('admin_dashboard')

# View สำหรับลบหนังสือ
@login_required
@user_passes_test(is_admin)
def delete_book(request, book_id):
    book = get_object_or_404(Book, id=book_id)
    book_title = book.title
    book.delete()
    messages.success(request, f"Book {book_title} deleted.")
    return redirect('admin_dashboard')

# Custom logout view
@login_required
def custom_logout(request):
    auth_logout(request)
    response = redirect('admin_login')
    response.delete_cookie('sessionid')
    return response