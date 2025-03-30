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
from .models import Profile  # ✅ Import Profile
from .serializers import serializers
from google.oauth2 import id_token
from google.auth.transport import requests
import os
from django.core.mail import send_mail
import random

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
                return Response({"error": "Please verify your email address to activate your account."}, 
                                status=status.HTTP_400_BAD_REQUEST)

            if user.check_password(password):
                token, created = Token.objects.get_or_create(user=user)
                profile, _ = Profile.objects.get_or_create(user=user)
                
                return Response({
                    "token": token.key,
                    "role": profile.user_type,
                    "userId": user.id  # Add userId to the response
                }, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Invalid credentials."}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_400_BAD_REQUEST)


class SignupReaderView(APIView):
    def post(self, request):
        serializer = SignupReaderSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            # สร้าง verification code
            verification_code = str(random.randint(100000, 999999))

            # ดึง Profile ที่ถูกสร้างโดย Signal
            profile = Profile.objects.get(user=user)
            profile.verification_code = verification_code
            profile.save()

            # ส่ง email
            send_mail(
                'Verify your account',
                f'Your verification code is: {verification_code}',
                'bookhub.noreply@gmail.com',
                [user.email],
                fail_silently=False,
            )

            return Response({"message": "Verification code sent."}, status=status.HTTP_201_CREATED)
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

class GoogleLoginView(APIView):
    def post(self, request):
        try:
            # Get token from request
            token = request.data.get('token')
            if not token:
                return Response({'detail': 'Token is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Verify token with Google
            client_id = '922387380789-081ufgcic0l05iivp0lnqqu694cs6sbl.apps.googleusercontent.com'
            idinfo = id_token.verify_oauth2_token(token, requests.Request(), client_id)
            
            # Get user email from verified token
            gmail = idinfo['email']
            name = idinfo.get('name', '')
            
            # Check if user exists
            user, created = User.objects.get_or_create(
                email=gmail,
                defaults={
                    'username': gmail.split('@')[0],
                    'first_name': name.split(' ')[0] if ' ' in name else name,
                    'last_name': name.split(' ')[-1] if ' ' in name else '',
                }
            )
            
            # Ensure username is unique if user was just created
            if created and User.objects.filter(username=user.username).exists():
                user.username = f"{user.username}{User.objects.count()}"
                user.save()
            
            # Get or create profile
            profile, _ = Profile.objects.get_or_create(
                user=user,
                defaults={'user_type': 'reader'}
            )
            
            # Get token
            token, _ = Token.objects.get_or_create(user=user)
            
            # Always use reader role for Google login
            role = 'reader'
            
            return Response({
                'token': token.key,
                'userId': user.id,
                'role': role,
                'name': user.get_full_name() or user.username
            })
            
        except ValueError as e:
            return Response({'detail': f'Invalid token: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'detail': f'An error occurred: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
