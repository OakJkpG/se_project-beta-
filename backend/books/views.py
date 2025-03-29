# books/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics, permissions
from .models import Book, BookBorrow
from .serializers import BookSerializer, BookBorrowSerializer
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta
from django.http import FileResponse
from django.http import HttpResponse
from .models import Tag
from .serializers import TagSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from django.conf import settings
from .storages import PrivateMediaStorage
from supabase import create_client
import logging

logger = logging.getLogger(__name__)

# สร้าง Supabase Client
supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

def home(request):
    return HttpResponse("Welcome to Books API!")

class TagListView(generics.ListAPIView):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticated]

class BookListView(generics.ListAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [permissions.IsAuthenticated]

class BookDetailView(generics.RetrieveAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [permissions.IsAuthenticated]

class BorrowBookView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        if hasattr(user, 'profile') and user.profile.user_type != 'reader':
            return Response({"error": "Only readers can borrow books."},
                            status=status.HTTP_403_FORBIDDEN)
        book_id = request.data.get('book_id')
        book = get_object_or_404(Book, id=book_id)
        if not book.is_available:
            return Response({"error": "Book is not available."},
                            status=status.HTTP_400_BAD_REQUEST)
        borrow = BookBorrow.objects.create(reader=request.user, book=book)
        book.borrow_count += 1
        book.save()
        return Response({'message': 'Book borrowed successfully!', 'borrow_id': borrow.id},
                        status=status.HTTP_201_CREATED)

class ReturnBookView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, borrow_id):
        try:
            # Fetch the borrow record
            borrow = BookBorrow.objects.select_related('book').get(
                id=borrow_id,
                reader=request.user,
                returned_at__isnull=True  # Ensure the book hasn't already been returned
            )

            # Mark the book as returned
            borrow.returned_at = timezone.now()
            borrow.save()

            # Update the book's borrow count
            book = borrow.book
            if book.borrow_count > 0:
                book.borrow_count -= 1
                book.save()

            return Response({
                'status': 'success',
                'message': 'Book returned successfully'
            }, status=status.HTTP_200_OK)

        except BookBorrow.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Borrow record not found or already returned'
            }, status=status.HTTP_404_NOT_FOUND)

class AddBookView(generics.CreateAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        serializer.save(publisher=self.request.user)

class RemoveBookView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, book_id):
        user = request.user
        book = get_object_or_404(Book, id=book_id, publisher=user)
        book.delete()
        return Response({"message": "Book removed successfully."},
                        status=status.HTTP_200_OK)

class ReaderAccountView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if hasattr(user, 'profile') and user.profile.user_type != 'reader':
            return Response({"error": "Not authorized."},
                            status=status.HTTP_403_FORBIDDEN)
        borrowed = BookBorrow.objects.filter(reader=user)
        borrow_serializer = BookBorrowSerializer(borrowed, many=True)
        data = {
            "user": {
                "name": user.username,
                "email": user.email,
                "role": user.profile.user_type,
                "registered_at": user.date_joined,
                "borrow_count": borrowed.count(),
            },
            "borrowed_books": borrow_serializer.data
        }
        return Response(data, status=status.HTTP_200_OK)

class PublisherAccountView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.profile.user_type != 'publisher':
            return Response({"error": "Not authorized."},
                            status=status.HTTP_403_FORBIDDEN)
        published_books = Book.objects.filter(publisher=user)
        serializer = BookSerializer(published_books, many=True)
        data = {
            "user": {
                "name": user.first_name,
                "email": user.email,
                "role": user.profile.user_type,
                "registered_at": user.date_joined,
                "book_count": published_books.count(),
                "profile_image": "",  # เพิ่ม field รูปโปรไฟล์หากมี
            },
            "published_books": serializer.data
        }
        return Response(data, status=status.HTTP_200_OK)

class ReadBookView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, borrow_id):
        try:
            # ตรวจสอบว่าการยืมนี้เป็นของผู้ใช้ที่ล็อกอินอยู่
            borrow_entry = get_object_or_404(BookBorrow, id=borrow_id, reader=request.user)

            # ตรวจสอบว่าเวลายืมหมดอายุหรือไม่
            if borrow_entry.due_date < timezone.now():
                return Response({"error": "Borrowing period has expired."}, status=status.HTTP_403_FORBIDDEN)

            # ตรวจสอบว่าหนังสือมีไฟล์ PDF หรือไม่
            book = borrow_entry.book
            if not book.pdf_file:
                return Response({"error": "PDF file not found for this book."}, status=status.HTTP_404_NOT_FOUND)

            # สร้าง Signed URL สำหรับไฟล์ PDF
            file_name = book.pdf_file.name
            file_path = f"pdfs/{file_name}" if not file_name.startswith('pdfs/') else file_name

            response = supabase.storage.from_("Bookhub_pdf").create_signed_url(
                path=file_path,
                expires_in=3600  # URL valid for 1 hour
            )

            if not response or not response.get("signedURL"):
                return Response({"error": "Failed to generate signed URL."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return Response({"signed_url": response["signedURL"]}, status=status.HTTP_200_OK)

        except BookBorrow.DoesNotExist:
            return Response({"error": "Borrow record not found."}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            # จัดการข้อผิดพลาดทั่วไป
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class EditBookView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, book_id):
        try:
            # Get book and verify ownership
            book = Book.objects.get(id=book_id, publisher=request.user)
            
            # Update book with partial data
            serializer = BookSerializer(
                book,
                data=request.data,
                partial=True  # Allow partial updates
            )
            
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except Book.DoesNotExist:
            return Response(
                {"detail": "Book not found or you don't have permission to edit it"},
                status=status.HTTP_404_NOT_FOUND
            )