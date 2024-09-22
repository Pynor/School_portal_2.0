import datetime
import jwt

from rest_framework.response import Response
from django.contrib.auth import login

from .serializers import *

access_token_jwt_subject = "access"
ALGORITHM = "HS256"


class UserAPIService:

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


class UserLogoutAPIService(UserAPIService):

    def logout(self) -> Response:
        response = Response({"message": "success"}, status=200)
        response.delete_cookie("jwt", path="/", domain=None)
        return response


class BaseLoginAPIService(UserAPIService):
    def login(self) -> Response:
        user_and_password = self.get_user_and_password()
        user = user_and_password.get("user")
        password = user_and_password.get("password")

        if not user:
            raise AuthenticationFailed("Пользователь не найден.")

        if not user.check_password(password):
            raise AuthenticationFailed("Неверный пароль.")

        payload = self.get_payload(user)
        token = jwt.encode(payload, "secret", algorithm=ALGORITHM)

        response = Response({"jwt_token": token}, status=200)
        response.set_cookie(key="jwt", value=token, httponly=True)

        login(self.request, user)
        self.post_login(user)

        return response

    def get_user_and_password(self):
        pass

    def get_payload(self, user):
        raise NotImplementedError

    def post_login(self, user):
        pass


class TeacherLoginAPIService(BaseLoginAPIService):

    def get_user_and_password(self):
        username = self.request.data.get("username")
        password = self.request.data.get("password")

        user = User.objects.filter(username=username).first()

        return {"user": user, "password": password}

    def get_payload(self, user):
        return {
            "id": user.id,
            "is_staff": True,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=60),
            "iat": datetime.datetime.utcnow()
        }


class StudentLoginAPIService(BaseLoginAPIService):

    def get_user_and_password(self):
        school_class = self.request.data.get("school_class")
        first_name = self.request.data.get("first_name")
        last_name = self.request.data.get("last_name")
        password = self.request.data.get("password")
        username = f"{first_name}{last_name}{school_class}"

        user = User.objects.filter(username=username).first()

        return {"user": user, "password": password}

    def get_payload(self, user):
        return {
            "id": user.id,
            "is_staff": False,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=60),
            "iat": datetime.datetime.utcnow()
        }

    def post_login(self, user):
        student = Student.objects.get(user=user)
        student.authorized = True
        student.save()
