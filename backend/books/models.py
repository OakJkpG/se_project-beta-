from django.db import models
from django.contrib.auth.models import User
from datetime import timedelta
from django.utils import timezone
from .storages import PublicMediaStorage, PrivateMediaStorage

class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name

class Book(models.Model):
    publisher = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="published_books"
    )
    title = models.CharField(max_length=200)
    description = models.TextField()
    cover_image = models.URLField(max_length=200, blank=True, null=True)  # เพิ่ม field นี้
    pdf_file = models.FileField(storage=PrivateMediaStorage(), upload_to='', blank=True, null=True)
    lending_period = models.PositiveIntegerField(default=14)  # จำนวนวันให้ยืม
    max_borrowers = models.PositiveIntegerField(default=1)    # จำนวนคนที่สามารถยืมได้พร้อมกัน
    tags = models.ManyToManyField('Tag', through='BookTag', blank=True)
    borrow_count = models.PositiveIntegerField(default=0)      # สำหรับสถิติการยืม

    def remaining_borrows(self):
        return self.max_borrowers - self.borrows.filter(returned_at__isnull=True).count()

    @property
    def is_available(self):
        return self.remaining_borrows() > 0

    def is_borrowed_by_user(self, user):
        """Check if the book is currently borrowed by specific user"""
        return self.borrows.filter(
            reader=user,
            returned_at__isnull=True
        ).exists()

    def __str__(self):
        return self.title

class BookTag(models.Model):
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.book.title} - {self.tag.name}"

class BookBorrow(models.Model):
    book = models.ForeignKey(
        Book, on_delete=models.CASCADE, related_name="borrows"
    )
    reader = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="borrowed_books"
    )
    borrow_date = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField()
    returned_at = models.DateTimeField(null=True, blank=True) # เพิ่ม field returned_at

    @property
    def is_returned(self):
        return self.returned_at is not None
    
    def save(self, *args, **kwargs):
        if not self.pk:
            self.due_date = timezone.now() + timedelta(days=self.book.lending_period)
        super().save(*args, **kwargs)

    def get_countdown(self):
        """Calculate countdown to due date"""
        if self.returned_at:
            return None
        
        now = timezone.now()
        time_left = self.due_date - now
        
        # Convert to total seconds
        seconds_left = time_left.total_seconds()
        
        if seconds_left <= 0:
            return "Overdue"
            
        # Calculate days, hours, minutes
        days = int(seconds_left // (24 * 3600))
        hours = int((seconds_left % (24 * 3600)) // 3600)
        minutes = int((seconds_left % 3600) // 60)
        
        return {
            'days': days,
            'hours': hours,
            'minutes': minutes,
            'total_seconds': seconds_left
        }

    def is_overdue(self):
        """Check if the book is overdue"""
        if self.returned_at:
            return False
        return timezone.now() > self.due_date

    def auto_return(self):
        """Automatically return the book"""
        if not self.returned_at and self.is_overdue():
            self.returned_at = timezone.now()
            self.save()
            
            # Update book's borrow count
            self.book.borrow_count = max(0, self.book.borrow_count - 1)
            self.book.save()
            
            return True
        return False

    def __str__(self):
        return f"{self.reader.username} borrowed {self.book.title}"
