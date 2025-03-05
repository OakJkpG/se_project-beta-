from django.urls import path, include
from django.contrib import admin

urlpatterns = [
    path('', include('pages.urls')),
    path("admin/", admin.site.urls),
]
