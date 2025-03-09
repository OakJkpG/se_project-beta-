# users/urls.py
from django.urls import path
from .views import (
    LoginView,
    SignupReaderView,
    ReaderVerificationView,
    SignupPublisherView,
)

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('signup/reader/', SignupReaderView.as_view(), name='signup_reader'),
    path('signup/reader/verify/', ReaderVerificationView.as_view(), name='signup_reader_verify'),
    path('signup/publisher/', SignupPublisherView.as_view(), name='signup_publisher'),
]
