# books/serializers.py
from rest_framework import serializers
from .models import Book, BookBorrow, Tag

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']

class BookSerializer(serializers.ModelSerializer):
    tags = serializers.SlugRelatedField(
        many=True, slug_field='name', queryset=Tag.objects.all()
    )
    remaining_borrows = serializers.SerializerMethodField()
    custom_tag = serializers.CharField(write_only=True, required=False)
    selectedTags = serializers.ListField(
        child=serializers.CharField(), write_only=True, required=False
    )
    publisher_name = serializers.SerializerMethodField()
    cover_image = serializers.URLField(max_length=200, min_length=None, allow_blank=False)  # เพิ่ม field นี้

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
        validated_data.pop('tags', None)
        custom_tag = validated_data.pop('custom_tag', None)
        selected_tags = validated_data.pop('selectedTags', [])
        book = Book.objects.create(**validated_data)
        for tag_name in selected_tags:
            try:
                tag_obj = Tag.objects.get(name=tag_name)
                book.tags.add(tag_obj)
            except Tag.DoesNotExist:
                pass
        if custom_tag:
            tag_obj, created = Tag.objects.get_or_create(name=custom_tag)
            book.tags.add(tag_obj)
        return book

class BookBorrowSerializer(serializers.ModelSerializer):
    book = BookSerializer(read_only=True)
    book_id = serializers.PrimaryKeyRelatedField(
        queryset=Book.objects.all(), source='book', write_only=True
    )

    class Meta:
        model = BookBorrow
        fields = ['id', 'book', 'book_id', 'borrow_date', 'due_date', 'returned_at'] # เพิ่ม returned_at