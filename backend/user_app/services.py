from __future__ import annotations

from rest_framework.exceptions import AuthenticationFailed
from rest_framework.response import Response

from django.contrib.auth.hashers import make_password
from django.shortcuts import get_object_or_404
from django.contrib.auth import login
from django.db import transaction

import datetime
import jwt

from .models import TeacherSecretKey, SchoolClass, Student, Teacher, User


access_token_jwt_subject = "access"
ALGORITHM = "HS256"


class UserAPIService:

    def __init__(self, request, student_serializer, user_serializer) -> None:
        self.student_serializer = student_serializer
        self.user_serializer = user_serializer
        self.request = request

    def get(self) -> Response:
        token = self.request.COOKIES.get("jwt")

        if not token:
            raise AuthenticationFailed("Unauthenticated (not jwt token)")

        try:
            payload = jwt.decode(token, "secret", algorithms=ALGORITHM)
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed("Unauthenticated")

        user = get_object_or_404(User, id=payload["id"])

        if user.is_staff:
            serializer = self.user_serializer(user)
            return Response(serializer.data, status=200)

        student = get_object_or_404(Student, user=user)
        student_serializer = self.student_serializer(student)
        user_serializer = self.user_serializer(user)

        return Response({**user_serializer.data, "student": student_serializer.data}, status=200)


class UserLogoutAPIService(UserAPIService):

    def logout(self) -> Response:
        response = Response({"message": "success"}, status=200)
        response.delete_cookie("jwt", path="/", domain=None)
        return response


class TeacherRegisterAPIService:
    @staticmethod
    def create_teacher(validated_data: dict[str]) -> Teacher:
        user_data = validated_data.pop("user")
        secret_key = TeacherSecretKey.objects.filter(key=validated_data.get("secret_key")).first()

        if not secret_key:
            raise AuthenticationFailed("Неверный секретный ключ.")

        user = User.objects.create_user(**user_data, is_staff=True)
        teacher = Teacher.objects.create(user=user, phone_number=validated_data.get("phone_number"))
        secret_key.logged = True

        return teacher


class StudentsRegisterListAPIService:
    @staticmethod
    def _create_users(data_list: list[dict]) -> list[User]:
        users = []
        for data in data_list:
            first_name = data["user"]["first_name"]
            last_name = data["user"]["last_name"]
            username = f"{first_name}{last_name}{data['school_class']}"
            password = f"{first_name[0]}{last_name[0]}"
            users.append(User(
                password=make_password(password),
                first_name=first_name,
                last_name=last_name,
                username=username,
            ))

        return User.objects.bulk_create(users)

    @staticmethod
    def _get_school_classes(school_class_titles: list[str]) -> dict:
        classes = {}
        for title in school_class_titles:
            if title not in classes:
                classes[title] = SchoolClass.objects.get(title=title)
        return classes

    @staticmethod
    @transaction.atomic
    def create_students(validated_data: list[dict[str, str]]) -> list[Student]:
        school_class_titles = [data["school_class"] for data in validated_data]
        school_classes = StudentsRegisterListAPIService._get_school_classes(school_class_titles)

        users = StudentsRegisterListAPIService._create_users(validated_data)
        students = []

        for data, user in zip(validated_data, users):
            school_class = school_classes[data["school_class"]]
            student = Student(user=user, school_class=school_class)
            students.append(student)

        return Student.objects.bulk_create(students)


class BaseLoginAPIService(UserAPIService):
    def login(self) -> Response:
        user_and_password = self.get_user_and_password()

        if user_and_password is None:
            raise AuthenticationFailed("Не удалось получить пользователя и пароль.")

        password = user_and_password.get("password")
        user = user_and_password.get("user")

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
        raise NotImplementedError("get_user_and_password must be implemented in subclasses.")

    def get_payload(self, user):
        raise NotImplementedError("get_payload must be implemented in subclasses.")

    def post_login(self, user):
        pass


class TeacherLoginAPIService(BaseLoginAPIService):
    def get_user_and_password(self) -> dict[str, str | None]:
        username = self.request.data.get("username")
        password = self.request.data.get("password")

        user = User.objects.filter(username=username).first()

        return {"user": user, "password": password}

    def get_payload(self, user) -> dict[str, str | None]:
        return {
            "id": user.id,
            "is_staff": True,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=60),
            "iat": datetime.datetime.utcnow()
        }


class StudentLoginAPIService(BaseLoginAPIService):
    def get_user_and_password(self) -> dict[str, str | None]:
        school_class = self.request.data.get("school_class")
        first_name = self.request.data.get("first_name")
        last_name = self.request.data.get("last_name")
        password = self.request.data.get("password")
        username = f"{first_name}{last_name}{school_class}"

        user = User.objects.filter(username=username).first()

        return {"user": user, "password": password}

    def get_payload(self, user) -> dict[str, str | None]:
        return {
            "id": user.id,
            "is_staff": False,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=60),
            "iat": datetime.datetime.utcnow()
        }

    def post_login(self, user) -> None:
        student = Student.objects.get(user=user)
        student.authorized = True
        student.save()
