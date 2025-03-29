from django.urls import path
from . import views
from .views import (
    BookListView,
    BookDetailView,
    BorrowBookView,
    ReturnBookView,
    AddBookView,
    RemoveBookView,
    ReaderAccountView,
    PublisherAccountView,
    ReadBookView,
    TagListView,  # นำเข้า TagListView
    EditBookView,
)

urlpatterns = [
    path("", views.home, name="home"),
    path('books/', BookListView.as_view(), name='book_list'),
    path('books/<int:pk>/', BookDetailView.as_view(), name='book_detail'),
    path('books/borrow/', BorrowBookView.as_view(), name='borrow_book'),
    path('books/return/<int:borrow_id>/', ReturnBookView.as_view(), name='return-book'),
    path('books/add/', AddBookView.as_view(), name='add_book'),
    path('books/remove/<int:book_id>/', RemoveBookView.as_view(), name='remove_book'),
    path('account/reader/', ReaderAccountView.as_view(), name='reader_account'),
    path('account/publisher/', PublisherAccountView.as_view(), name='publisher_account'),
    path('books/read/<int:borrow_id>/', ReadBookView.as_view(), name='read_book'),
    path('tags/', TagListView.as_view(), name='tag_list'),
    path('books/update/<int:book_id>/', EditBookView.as_view(), name='book-update'),
]
