from rest_framework import generics, permissions
from rest_framework.views import APIView

from .serializers import *
from .services import *
from .models import *


class TeacherRegisterAPIView(generics.CreateAPIView):
    serializer_class = TeacherSerializer
    permission_classes = [permissions.AllowAny]


class StudentRegisterAPIView(generics.CreateAPIView):
    serializer_class = StudentListSerializer
    permission_classes = [permissions.AllowAny]


class UserAPIView(APIView):
    def get(self, request):
        user = UserService(request=request)
        response = user.get()
        return response


class UserLoginAPIView(APIView):
    def post(self, request):
        user = UserLoginService(request=request)
        response = user.login()
        return response


class UserLogoutAPIView(APIView):
    def post(self, request):
        user = UserLogoutService(request=request)
        response = user.logout()
        return response
