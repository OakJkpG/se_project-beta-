from django.urls import path
from . import views

urlpatterns = [
    path('', views.main, name='main'),
    path('home/', views.home, name='home'),
    path('book/<str:book_id>/', views.book, name='book'),
    path('login/', views.login_page, name='login'),
    path('signup/', views.signup, name='signup'),
    path('account/reader/', views.account_reader, name='account_reader'),
    path('account/publisher/', views.account_publisher, name='account_publisher'),
    path('account/publisher/add_book', views.add_book, name='add_book'),
    path('account/publisher/edit_book', views.edit_book, name='edit_book'),
    path('account/publisher/remove_book/<str:book_id>/', views.remove_book, name='remove_book'),
]
