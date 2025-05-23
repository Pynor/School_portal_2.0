from rest_framework import generics, permissions
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView

from .permissions import IsTeacher
from .serializers import *
from .services import *


class TeacherRegisterAPIView(generics.CreateAPIView):
    serializer_class = TeacherRegisterAPISerializer
    permission_classes = [permissions.AllowAny]


class StudentsRegisterListAPIView(generics.CreateAPIView):
    serializer_class = StudentsRegisterListAPISerializer
    permission_classes = [IsTeacher]


class TeacherLoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request) -> Response:
        user = TeacherLoginAPIService(student_serializer=StudentSerializer,
                                      user_serializer=UserSerializer,
                                      request=request)
        response = user.login()
        return response


class StudentLoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request) -> Response:
        user = StudentLoginAPIService(student_serializer=StudentSerializer,
                                      user_serializer=UserSerializer,
                                      request=request)
        response = user.login()
        return response

class ChangePasswordAPIView(APIView):
    def post(self, request):
        service = ChangePasswordAPIService(request=request)
        response = service.change_password()
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
