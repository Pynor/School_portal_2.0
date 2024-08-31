import datetime
import jwt

from rest_framework.exceptions import AuthenticationFailed
from rest_framework.response import Response
from django.contrib.auth import login

from .serializers import *

ALGORITHM = "HS256"
access_token_jwt_subject = "access"


class UserService:

    def __init__(self, request):
        self.request = request
        self.response = Response()

    def get(self) -> Response:
        token = self.request.COOKIES.get("jwt")

        if not token:
            raise AuthenticationFailed("Unauthenticated(not jwt token)")
        try:
            payload = jwt.decode(token, "secret", algorithms=ALGORITHM)
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed("Unauthenticated")

        user = User.objects.filter(id=payload["id"]).first()
        serializer = UserSerializer(user)
        return Response(serializer.data, status=200)


class UserLogoutService(UserService):

    def logout(self) -> Response:
        response = Response({"message": "success"}, status=200)
        response.delete_cookie("jwt", path="/", domain=None)
        return response


class TeacherLoginService(UserService):

    def login(self) -> Response:
        email = self.request.data.get("email")
        password = self.request.data.get("password")

        user = User.objects.filter(email=email).first()

        if not user:
            raise AuthenticationFailed("User is not found")
        if not user.check_password(password):
            raise AuthenticationFailed("Invalid password")

        payload = {
            "id": user.id,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=60),
            "iat": datetime.datetime.utcnow()
        }
        token = jwt.encode(payload, "secret", algorithm=ALGORITHM)

        response = Response({"jwt_token": token}, status=200)
        response.set_cookie(key="jwt", value=token, httponly=True)

        login(self.request, user)

        return response
