from rest_framework.views import APIView
from rest_framework import generics, permissions

from .serializers import *
from .models import *
from .services import *


class UserRegisterAPIView(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]


class UserAPIView(APIView):
    def get(self, request):
        user = UserService(request=request)
        response = user.get_user()
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

