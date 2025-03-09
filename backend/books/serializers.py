# books/serializers.py
from rest_framework import serializers
from .models import Book, BookBorrow, Tag

class BookSerializer(serializers.ModelSerializer):
    # แสดงแท็กในรูปแบบของชื่อ
    tags = serializers.SlugRelatedField(
        many=True, slug_field='name', queryset=Tag.objects.all()
    )
    # คำนวณจำนวนการยืมคงเหลือ
    remaining_borrows = serializers.SerializerMethodField()
    # รับ input สำหรับเพิ่มแท็กใหม่ (custom tag)
    custom_tag = serializers.CharField(write_only=True, required=False)
    # รับ input สำหรับเลือกแท็กพื้นฐาน (รายการชื่อ)
    selectedTags = serializers.ListField(
        child=serializers.CharField(), write_only=True, required=False
    )

    # สำหรับแสดงชื่อ Publisher
    publisher_name = serializers.SerializerMethodField()

    class Meta:
        model = Book
        fields = [
            'id', 'publisher', 'publisher_name', 'title', 'description', 'cover_image',
            'pdf_file', 'lending_period', 'max_borrowers', 'tags', 'remaining_borrows',
            'borrow_count', 'custom_tag', 'selectedTags'
        ]
        read_only_fields = ['publisher', 'borrow_count']

    def get_remaining_borrows(self, obj):
        return obj.remaining_borrows()

    def get_publisher_name(self, obj):
        return obj.publisher.first_name

    def create(self, validated_data):
        custom_tag = validated_data.pop('custom_tag', None)
        selected_tags = validated_data.pop('selectedTags', [])
        # สร้างหนังสือใหม่โดยไม่มีแท็ก
        book = Book.objects.create(**validated_data)
        # เพิ่มแท็กพื้นฐานที่เลือกเข้ามา (ค้นหาจากฐานข้อมูล)
        for tag_name in selected_tags:
            try:
                tag_obj = Tag.objects.get(name=tag_name)
                book.tags.add(tag_obj)
            except Tag.DoesNotExist:
                pass
        # หากมี custom tag ให้สร้างหรือดึงแท็กนั้นและเพิ่มเข้าไป (จำกัดได้เพียง 1)
        if custom_tag:
            tag_obj, created = Tag.objects.get_or_create(name=custom_tag)
            book.tags.add(tag_obj)
        return book

class BookBorrowSerializer(serializers.ModelSerializer):
    # แสดงข้อมูลหนังสือในแบบ nested
    book = BookSerializer(read_only=True)
    # รับ book_id เมื่อสร้าง record
    book_id = serializers.PrimaryKeyRelatedField(
        queryset=Book.objects.all(), source='book', write_only=True
    )

    class Meta:
        model = BookBorrow
        fields = ['id', 'book', 'book_id', 'borrow_date', 'due_date']
