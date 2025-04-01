# users/urls.py
from django.urls import path
from .views import (
    LoginView,
    SignupReaderView,
    ReaderVerificationView,
    SignupPublisherView,
    GoogleLoginView,
    ForgotPasswordView,
    ResetPasswordView,
    ValidateResetTokenView,
)

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('signup/reader/', SignupReaderView.as_view(), name='signup_reader'),
    path('signup/reader/verify/', ReaderVerificationView.as_view(), name='signup_reader_verify'),
    path('signup/publisher/', SignupPublisherView.as_view(), name='signup_publisher'),
    path('google-login/', GoogleLoginView.as_view(), name='google_login'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
    path('reset-password/<uuid:token>/', ResetPasswordView.as_view(), name='reset_password'),
    path('reset-password/<uuid:token>/validate/', ValidateResetTokenView.as_view(), name='validate_reset_token'),
]
