# books/tasks.py
from celery import shared_task
from django.utils import timezone
from books.models import BookBorrow
from django.core.mail import send_mail

@shared_task
def check_expired_borrows():
    expired_borrows = BookBorrow.objects.filter(due_date__lt=timezone.now(), returned=False)
    for borrow in expired_borrows:
        borrow.returned = True
        borrow.save()
        # เพิ่มจำนวน remaining_borrows ของหนังสือ
        borrow.book.remaining_borrows += 1
        borrow.book.save()

@shared_task
def notify_due_date():
    soon_to_expire = BookBorrow.objects.filter(
        due_date__range=[timezone.now(), timezone.now() + timezone.timedelta(days=1)],
        returned=False
    )
    for borrow in soon_to_expire:
        send_mail(
            'Your borrowing period is about to expire',
            f'Dear {borrow.reader.username}, your borrowing period for "{borrow.book.title}" will expire on {borrow.due_date}.',
            'noreply@bookhub.com',
            [borrow.reader.email],
            fail_silently=False,
        )