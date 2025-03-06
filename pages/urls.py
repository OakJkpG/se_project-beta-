from django.urls import path
from . import views

urlpatterns = [
    path('', views.main, name='main'),
    path('home/', views.home, name='home'),
    path('book/<str:book_id>/', views.book, name='book'),
    path('return/<str:book_id>/', views.return_book, name="return_book"),  # เพิ่มเส้นทางสำหรับคืนหนังสือ
    path("borrow/<str:book_id>/", views.borrow_book, name="borrow_book"),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('signup/', views.signup, name='signup'),
    path('account/reader/', views.account_reader, name='account_reader'),
    path('account/publisher/', views.account_publisher, name='account_publisher'),
    path('account/publisher/add_book', views.add_book, name='add_book'),
    path('account/publisher/edit_book/<str:book_id>/', views.edit_book, name='edit_book'),
    path('account/publisher/remove_book/<str:book_id>/', views.remove_book, name='remove_book'),
    path('admin/custom/', views.custom_admin, name='custom_admin'),
]
