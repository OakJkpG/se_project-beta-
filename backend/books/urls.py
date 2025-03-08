from django.urls import path
from .views import login

urlpatterns = [
    path('api/login/', login, name='login'),
]
