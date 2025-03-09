# users/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import (
    LoginSerializer,
    SignupReaderSerializer,
    ReaderVerificationSerializer,
    SignupPublisherSerializer,
)
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from .models import Profile  # ✅ Import Profilefrom 
from .serializers import serializers
class LoginView(APIView):
    def post(self, request):
        identifier = request.data.get('identifier')
        password = request.data.get('password')

        try:
            if '@' in identifier:
                user = User.objects.get(email=identifier)
            else:
                user = User.objects.get(username=identifier)
            if not user.is_active:
                return Response({"error": "Please verify your email address to activate your account."}, status=status.HTTP_400_BAD_REQUEST)

            if user.check_password(password):
                token, created = Token.objects.get_or_create(user=user)

                # ✅ ตรวจสอบและสร้าง Profile ถ้ายังไม่มี
                profile, _ = Profile.objects.get_or_create(user=user)

                return Response({
                    "token": token.key,
                    "role": profile.user_type  # ✅ ดึง user_type จาก Profile
                }, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Invalid credentials."}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_400_BAD_REQUEST)


class SignupReaderView(APIView):
    def post(self, request):
        print("📥 Signup Request Data:", request.data)  # ✅ Debug request ที่ส่งมา
        serializer = SignupReaderSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.save()
            print("✅ User Created:", user)  # ✅ Debug ว่ามี user สร้างขึ้นไหม
            return Response({"message": "Verification code sent."}, status=status.HTTP_201_CREATED)
        
        print("❌ Signup Errors:", serializer.errors)  # ✅ Debug ว่ามี error อะไร
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ReaderVerificationView(APIView):
    def post(self, request):
        serializer = ReaderVerificationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Email verified successfully. Your account is now active."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SignupPublisherView(APIView):
    def post(self, request):
        serializer = SignupPublisherSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Registration submitted for admin verification."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

