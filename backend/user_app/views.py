from rest_framework import generics, permissions
from rest_framework.views import APIView

from .serializers import *
from .services import *
from .models import *


class TeacherRegisterAPIView(generics.CreateAPIView):
    serializer_class = TeacherSerializer
    permission_classes = [permissions.AllowAny]


class StudentsRegisterListAPIView(generics.CreateAPIView):
    serializer_class = StudentsRegisterListSerializer
    permission_classes = [permissions.AllowAny]


class TeacherLoginAPIView(APIView):
    def post(self, request):
        user = TeacherLoginAPIService(request=request)
        response = user.login()
        return response


class StudentLoginAPIView(APIView):
    def post(self, request):
        user = StudentLoginAPIService(request=request)
        response = user.login()
        return response


class UserAPIView(APIView):
    def get(self, request):
        user = UserAPIService(request=request)
        response = user.get()
        return response


class UserLogoutAPIView(APIView):
    def post(self, request):
        user = UserLogoutAPIService(request=request)
        response = user.logout()
        return response
