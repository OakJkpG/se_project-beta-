# admin_dashboard/views.py
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.auth.views import LoginView
from django.contrib import messages
from django.core.mail import send_mail
from django.contrib.auth.models import User
from books.models import Book, Tag
from django.urls import reverse
from django.contrib.auth import logout as auth_logout
from django.views.decorators.http import require_POST
from supabase import create_client, Client
from urllib.parse import urlparse
from django.conf import settings
# ฟังก์ชันตรวจสอบว่า user เป็น admin (superuser)
supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
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
    all_tags = Tag.objects.all().order_by('name')
    publisher_count = User.objects.filter(
        profile__user_type='publisher',
        is_active=True  # Make sure to count only approved publishers
    ).count()
    context = {
        'all_users': all_users,
        'all_books': all_books,
        'pending_publishers': pending_publishers,
        'all_tags': all_tags,
        'publisher_count': publisher_count,
    }

    return render(request, 'admin_dashboard/dashboard.html', context)

# View สำหรับ approve publisher registration
@login_required
@user_passes_test(is_admin)
def approve_publisher(request, user_id):
    publisher = get_object_or_404(User, id=user_id, profile__user_type='publisher', is_active=False)
    publisher.is_active = True
    publisher.save()

    html_message = f"""
    <div style="font-family: 'Prompt', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #ffffff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #ff6b00; margin-bottom: 15px; font-size: 28px;">BookHub</h1>
            <div style="width: 50px; height: 3px; background-color: #ff6b00; margin: 0 auto 20px;"></div>
            <h2 style="color: #333; font-size: 24px; margin-bottom: 10px;">การลงทะเบียนได้รับการอนุมัติแล้ว</h2>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
            <p style="color: #333; font-size: 16px; margin-bottom: 15px;">สวัสดีคุณ {publisher.username},</p>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
                ยินดีด้วย! การลงทะเบียนผู้พิมพ์ของคุณได้รับการอนุมัติแล้ว 
                ตอนนี้คุณสามารถเข้าสู่ระบบและเริ่มเพิ่มหนังสือของคุณได้
            </p>
        </div>

        <div style="text-align: center; margin: 35px 0;">
            <a href="https://se-bookhub.vercel.app/login" 
               style="background-color: #ff6b00; 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 5px;
                      display: inline-block;
                      font-weight: bold;
                      font-size: 16px;">
                เข้าสู่ระบบ
            </a>
        </div>

        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

        <div style="text-align: center;">
            <p style="color: #666; font-size: 14px; margin: 5px 0;">
                ขอแสดงความนับถือ<br>
                <strong style="color: #ff6b00;">ทีมงาน BookHub</strong>
            </p>
        </div>
    </div>
    """

    send_mail(
        '✨ ยินดีด้วย! การลงทะเบียนของคุณได้รับการอนุมัติแล้ว',
        'การลงทะเบียนผู้พิมพ์ของคุณได้รับการอนุมัติแล้ว',
        'BookHub <bookhub.noreply@gmail.com>',
        [publisher.email],
        fail_silently=False,
        html_message=html_message
    )
    messages.success(request, f"Publisher {publisher.email} approved.")
    return redirect('admin_dashboard')

# View สำหรับ reject publisher registration
@login_required
@user_passes_test(is_admin)
def reject_publisher(request, user_id):
    publisher = get_object_or_404(User, id=user_id, profile__user_type='publisher', is_active=False)
    publisher_email = publisher.email
    username = publisher.username

    html_message = f"""
    <div style="font-family: 'Prompt', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #ffffff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #ff6b00; margin-bottom: 15px; font-size: 28px;">BookHub</h1>
            <div style="width: 50px; height: 3px; background-color: #ff6b00; margin: 0 auto 20px;"></div>
            <h2 style="color: #333; font-size: 24px; margin-bottom: 10px;">ผลการพิจารณาการลงทะเบียน</h2>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
            <p style="color: #333; font-size: 16px; margin-bottom: 15px;">สวัสดีคุณ {username},</p>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
                ขออภัย การลงทะเบียนผู้พิมพ์ของคุณไม่ผ่านการพิจารณา 
                หากคุณมีข้อสงสัยเพิ่มเติม สามารถติดต่อเราได้ที่อีเมล bookhub.noreply@gmail.com
            </p>
        </div>

        <div style="background-color: #fff3e0; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #ff9800;">
            <p style="color: #e65100; margin: 0; font-size: 14px;">
                <strong>หมายเหตุ:</strong><br>
                คุณสามารถลงทะเบียนใหม่ได้หลังจาก 30 วัน โดยกรุณาตรวจสอบและปรับปรุงข้อมูลให้ครบถ้วน
            </p>
        </div>

        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

        <div style="text-align: center;">
            <p style="color: #666; font-size: 14px; margin: 5px 0;">
                ขอแสดงความนับถือ<br>
                <strong style="color: #ff6b00;">ทีมงาน BookHub</strong>
            </p>
        </div>
    </div>
    """

    publisher.delete()
    send_mail(
        'การลงทะเบียนของคุณไม่ผ่านการพิจารณา',
        'ขออภัย การลงทะเบียนผู้พิมพ์ของคุณไม่ผ่านการพิจารณา',
        'BookHub <bookhub.noreply@gmail.com>',
        [publisher_email],
        fail_silently=False,
        html_message=html_message
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
    if book.cover_image:
        # แปลง URL เป็น path สำหรับ Supabase
        parsed_url = urlparse(book.cover_image)
        file_path = parsed_url.path.replace("storage/v1/object/public/Bookhub_media/", "")  # ลบส่วนเกินออก
        bucket_name = "Bookhub_media"  # Bucket สำหรับ cover_image

                # ตรวจสอบว่า path ไม่มีส่วนที่ซ้ำซ้อนและไม่มี '/' เกินมา
        if not file_path.startswith("covers/"):
            file_path = f"{file_path.lstrip('/')}"

                

        response = supabase.storage.from_(bucket_name).remove([file_path])
                

        # ลบไฟล์ pdf_file ถ้ามี
        if book.pdf_file.name:
                file_path = book.pdf_file.name  # ใช้ชื่อไฟล์ตรงๆ
                bucket_name = "Bookhub_pdf"  # Bucket สำหรับ pdf_file

                

                response = supabase.storage.from_(bucket_name).remove([f"pdfs/{file_path}"])

        # ลบหนังสือ
        book.delete()
    messages.success(request, f"Book {book_title} deleted.")
    return redirect('admin_dashboard')

# View สำหรับลบแท็ก
@login_required
@user_passes_test(is_admin)
@require_POST
def delete_tag(request, tag_id):
    try:
        tag = get_object_or_404(Tag, id=tag_id)
        
        if tag.book_set.count() > 0:
            messages.error(request, f'Cannot delete tag "{tag.name}" because it is being used by {tag.book_set.count()} books.')
            return redirect('admin_dashboard')
        
        tag_name = tag.name
        tag.delete()
        messages.success(request, f'Tag "{tag_name}" has been deleted successfully.')
        
    except Exception as e:
        messages.error(request, f'Error deleting tag: {str(e)}')
    
    return redirect('admin_dashboard')

# Custom logout view
@login_required
def custom_logout(request):
    auth_logout(request)
    response = redirect('admin_login')
    response.delete_cookie('sessionid')
    return response