# books/serializers.py
from rest_framework import serializers
from .models import Book, BookBorrow, Tag

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']

class BookSerializer(serializers.ModelSerializer):
    tags = serializers.SlugRelatedField(
        many=True, slug_field='name', queryset=Tag.objects.all(), required=False
    )
    selectedTags = serializers.CharField(write_only=True, required=False)
    custom_tag = serializers.CharField(write_only=True, required=False)
    publisher_name = serializers.SerializerMethodField()
    cover_image = serializers.URLField(max_length=200, min_length=None, allow_blank=False)
    remaining_borrows = serializers.SerializerMethodField()

    class Meta:
        model = Book
        fields = [
            'id', 'publisher', 'publisher_name', 'title', 'description', 'cover_image',
            'pdf_file', 'lending_period', 'max_borrowers', 'tags', 'remaining_borrows',
            'borrow_count', 'custom_tag', 'selectedTags'
        ]
        read_only_fields = ['publisher', 'borrow_count']

    def validate(self, data):
        """
        ตรวจสอบว่าใช้แค่ selectedTags หรือ custom_tag อย่างใดอย่างหนึ่ง
        """
        selected_tags = data.get('selectedTags')
        custom_tag = data.get('custom_tag')

        if selected_tags and custom_tag:
            raise serializers.ValidationError(
                "Please choose either an existing tag or create a new tag, not both"
            )
        
        if not selected_tags and not custom_tag:
            raise serializers.ValidationError(
                "Please provide either an existing tag or create a new tag"
            )

        return data

    def get_remaining_borrows(self, obj):
        return obj.remaining_borrows()

    def get_publisher_name(self, obj):
        return obj.publisher.first_name

    def create(self, validated_data):
        # แยก tags และ custom_tag ออกจาก validated_data
        tags_data = validated_data.pop('tags', [])
        custom_tag = validated_data.pop('custom_tag', None)
        selected_tag = validated_data.pop('selectedTags', None)

        # สร้าง book
        book = Book.objects.create(**validated_data)

        try:
            # จัดการ selected tag (เลือกจากระบบ)
            if selected_tag:
                # ทำความสะอาดข้อมูล selected tag
                clean_tag = selected_tag.strip('[]"\' ')
                if clean_tag:
                    tag_obj = Tag.objects.get(name=clean_tag)
                    book.tags.add(tag_obj)

            # จัดการ custom tag (สร้างใหม่)
            elif custom_tag:
                # ทำความสะอาดข้อมูล custom tag
                clean_tag = custom_tag.strip()
                if clean_tag:
                    tag_obj, created = Tag.objects.get_or_create(
                        name=clean_tag
                    )
                    book.tags.add(tag_obj)

        except Exception as e:
            # ลบ book ถ้าเกิดข้อผิดพลาดในการจัดการ tag
            book.delete()
            raise serializers.ValidationError(f"Error handling tags: {str(e)}")

        return book

class BookBorrowSerializer(serializers.ModelSerializer):
    book = BookSerializer(read_only=True)
    countdown = serializers.SerializerMethodField()

    class Meta:
        model = BookBorrow
        fields = ['id', 'book', 'book_id', 'borrow_date', 'due_date', 'returned_at', 'countdown']

    def get_countdown(self, obj):
        return obj.get_countdown()