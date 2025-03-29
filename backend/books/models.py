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

    def __str__(self):
        return f"{self.reader.username} borrowed {self.book.title}"
