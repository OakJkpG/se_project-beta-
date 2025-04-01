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
from django.core.files.storage import default_storage
from urllib.parse import urlparse

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
            return Response(
                {"error": "Only readers can borrow books."},
                status=status.HTTP_403_FORBIDDEN
            )

        book_id = request.data.get('book_id')
        book = get_object_or_404(Book, id=book_id)

        # ตรวจสอบว่าผู้ใช้ยืมหนังสือเล่มนี้อยู่หรือไม่
        if book.is_borrowed_by_user(user):
            return Response(
                {
                    "error": "You have already borrowed this book and haven't returned it yet.",
                    "status": "ALREADY_BORROWED"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if not book.is_available:
            return Response(
                {"error": "Book is not available for borrowing."},
                status=status.HTTP_400_BAD_REQUEST
            )

        borrow = BookBorrow.objects.create(reader=user, book=book)
        book.borrow_count += 1
        book.save()

        return Response(
            {'message': 'Book borrowed successfully!', 'borrow_id': borrow.id},
            status=status.HTTP_201_CREATED
        )

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

        # ลบไฟล์ cover_image ถ้ามี
        if book.cover_image:
            try:
                # แปลง URL เป็น path สำหรับ Supabase
                parsed_url = urlparse(book.cover_image)
                file_path = parsed_url.path.replace("storage/v1/object/public/Bookhub_media/", "")  # ลบส่วนเกินออก
                bucket_name = "Bookhub_media"  # Bucket สำหรับ cover_image

                # ตรวจสอบว่า path ไม่มีส่วนที่ซ้ำซ้อนและไม่มี '/' เกินมา
                if not file_path.startswith("covers/"):
                    file_path = f"{file_path.lstrip('/')}"

                # Debug: ตรวจสอบ path และ bucket
                logger.info(f"Attempting to delete cover image: bucket={bucket_name}, file_path={file_path}")

                response = supabase.storage.from_(bucket_name).remove([file_path])
                if isinstance(response, list) and response and "error" in response[0]:
                    logger.error(f"Error deleting cover image: {response[0]['error']}")
                else:
                    logger.info(f"Cover image deleted successfully: {file_path}")
            except Exception as e:
                logger.error(f"Error deleting cover image: {e}")

        # ลบไฟล์ pdf_file ถ้ามี
        if book.pdf_file:
            try:
                file_path = book.pdf_file.name  # ใช้ชื่อไฟล์ตรงๆ
                bucket_name = "Bookhub_pdf"  # Bucket สำหรับ pdf_file

                # Debug: ตรวจสอบ path และ bucket
                logger.info(f"Attempting to delete PDF file: bucket={bucket_name}, file_path=pdfs/{file_path}")

                response = supabase.storage.from_(bucket_name).remove([f"pdfs/{file_path}"])
                if isinstance(response, list) and response and "error" in response[0]:
                    logger.error(f"Error deleting PDF file: {response[0]['error']}")
                else:
                    logger.info(f"PDF file deleted successfully: pdfs/{file_path}")
            except Exception as e:
                logger.error(f"Error deleting PDF file: {e}")

        # ลบหนังสือ
        book.delete()

        return Response({"message": "Book and associated files removed successfully."},
                        status=status.HTTP_200_OK)

class ReaderAccountView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if hasattr(user, 'profile') and user.profile.user_type != 'reader':
            return Response({"error": "Not authorized."},
                            status=status.HTTP_403_FORBIDDEN)
        
        # เปลี่ยนจาก borrowed = BookBorrow.objects.filter(reader=user)
        # เป็นการquery เฉพาะหนังสือที่ยังไม่ได้คืน (returned_at is None)
        borrowed = BookBorrow.objects.filter(
            reader=user,
            returned_at__isnull=True  # เพิ่มเงื่อนไขนี้
        )
        
        # นับจำนวนหนังสือที่ยืมทั้งหมด (รวมที่คืนแล้ว)
        total_borrowed = BookBorrow.objects.filter(reader=user).count()
        
        borrow_serializer = BookBorrowSerializer(borrowed, many=True)
        data = {
            "user": {
                "name": user.username,
                "email": user.email,
                "role": user.profile.user_type,
                "registered_at": user.date_joined,
                "borrow_count": total_borrowed,  # แสดงจำนวนหนังสือที่เคยยืมทั้งหมด
                "active_borrows": borrowed.count(),  # เพิ่มจำนวนหนังสือที่ยังไม่ได้คืน
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
    parser_classes = [MultiPartParser, FormParser]

    def delete_file_from_supabase(self, file_url, bucket_name):
        """Helper method to delete file from Supabase"""
        try:
            parsed_url = urlparse(file_url)
            file_path = parsed_url.path.replace(f"storage/v1/object/public/{bucket_name}/", "")
            file_path = file_path.lstrip('/')
            
            logger.info(f"Attempting to delete file: bucket={bucket_name}, file_path={file_path}")
            
            response = supabase.storage.from_(bucket_name).remove([file_path])
            if isinstance(response, list) and response and "error" in response[0]:
                logger.error(f"Error deleting file: {response[0]['error']}")
            else:
                logger.info(f"File deleted successfully: {file_path}")
                
        except Exception as e:
            logger.error(f"Error deleting file: {e}")

    def put(self, request, book_id):
        try:
            # Get the book to update
            book = get_object_or_404(Book, id=book_id, publisher=request.user)
            
            # Extract data from request
            data = request.data.copy()
            logger.info(f"Received data for book update: {data.keys()}")
            
            # Handle cover image
            if 'cover_image' in data and data['cover_image']:
                if isinstance(data['cover_image'], str) and data['cover_image'] != book.cover_image:
                    # Delete old cover image if exists and different from new one
                    if book.cover_image:
                        self.delete_file_from_supabase(book.cover_image, "Bookhub_media")
                    book.cover_image = data['cover_image']
            
            # Handle PDF file
            if 'pdf_file' in data and data['pdf_file']:
                if isinstance(data['pdf_file'], str) and data['pdf_file'] != book.pdf_file.url:
                    # Delete old PDF if exists and different from new one
                    if book.pdf_file:
                        self.delete_file_from_supabase(book.pdf_file.url, "Bookhub_pdf")
                    book.pdf_file = data['pdf_file']
            
            # Handle text fields
            if 'title' in data:
                book.title = data['title']
            if 'description' in data:
                book.description = data['description']
            if 'lending_period' in data and data['lending_period']:
                book.lending_period = int(data['lending_period'])
            if 'max_borrowers' in data and data['max_borrowers']:
                book.max_borrowers = int(data['max_borrowers'])
            
            # Handle tags
            if 'tags' in data and data['tags']:
                try:
                    import json
                    tags_list = json.loads(data['tags'])
                    book.tags.clear()
                    for tag_name in tags_list:
                        tag, created = Tag.objects.get_or_create(name=tag_name)
                        book.tags.add(tag)
                except Exception as e:
                    logger.error(f"Error processing tags: {str(e)}")
            
            # Save the updated book
            book.save()
            logger.info(f"Book {book_id} updated successfully")
            
            # Return serialized book data
            serializer = BookSerializer(book)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error updating book {book_id}: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class AccountReaderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            # Check and auto-return overdue books before sending response
            user_borrows = BookBorrow.objects.filter(
                reader=request.user,
                returned_at__isnull=True
            )
            
            for borrow in user_borrows:
                if borrow.is_overdue():
                    borrow.auto_return()

            # ...existing code for getting account data...

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class DeleteTagView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, tag_id):
        try:
            tag = get_object_or_404(Tag, id=tag_id)
            
            # Check if tag is being used
            if tag.book_set.count() > 0:
                return Response({
                    "error": "Cannot delete tag that is being used by books"
                }, status=status.HTTP_400_BAD_REQUEST)
                
            tag.delete()
            return Response({
                "message": f"Tag '{tag.name}' deleted successfully"
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

