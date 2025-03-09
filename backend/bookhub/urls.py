from django.contrib import admin
from django.urls import path, include
from admin_dashboard.views import admin_dashboard  # ✅ นำเข้า view

urlpatterns = [
    path('admin/', admin.site.urls),  # Django admin (ถ้ามี)
    path('api/', include('users.urls')),
    path('api/', include('books.urls')),
    path("adminpanel/", include("admin_dashboard.urls")),
    path("", admin_dashboard, name="home"),  # ✅ ตั้งให้ root path ไปที่ admin_dashboard
]
