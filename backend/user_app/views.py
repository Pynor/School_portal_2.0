from rest_framework import generics, permissions
from rest_framework.views import APIView

from .serializers import *
from .services import *
from .models import *


class TeacherRegisterAPIView(generics.CreateAPIView):
    serializer_class = TeacherRegisterSerializer
    permission_classes = [permissions.AllowAny]


class StudentsRegisterListAPIView(generics.CreateAPIView):
    serializer_class = StudentsRegisterListAPISerializer
    permission_classes = [permissions.AllowAny]


class TeacherLoginAPIView(APIView):
    def post(self, request) -> Response:
        user = TeacherLoginAPIService(student_serializer=StudentSerializer,
                                      user_serializer=UserSerializer,
                                      request=request)
        response = user.login()
        return response


class StudentLoginAPIView(APIView):
    def post(self, request) -> Response:
        user = StudentLoginAPIService(student_serializer=StudentSerializer,
                                      user_serializer=UserSerializer,
                                      request=request)
        response = user.login()
        return response


class UserAPIView(APIView):
    def get(self, request) -> Response:
        user = UserAPIService(student_serializer=StudentSerializer,
                              user_serializer=UserSerializer,
                              request=request)
        response = user.get()
        return response


class UserLogoutAPIView(APIView):
    def post(self, request) -> Response:
        user = UserLogoutAPIService(student_serializer=StudentSerializer,
                                    user_serializer=UserSerializer,
                                    request=request)
        response = user.logout()
        return response
