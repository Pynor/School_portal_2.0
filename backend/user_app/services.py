from __future__ import annotations

import secrets

from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed, ValidationError
from rest_framework.response import Response

from django.contrib.auth.hashers import make_password, identify_hasher
from django.db import transaction, IntegrityError
from django.shortcuts import get_object_or_404
from django.contrib.auth import login

import datetime
import jwt
from typing_extensions import Any

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
    def create_teacher(validated_data: dict) -> Teacher:
        secret_key_value = validated_data.get("secret_key")
        user_data = validated_data.pop("user")

        with transaction.atomic():
            secret_key_obj = TeacherSecretKey.objects.select_for_update() \
                .filter(key=secret_key_value, logged=False) \
                .first()

            if not secret_key_obj:
                raise serializers.ValidationError("Недействительный или уже использованный секретный ключ")

            teacher = Teacher.objects.create(
                user=User.objects.create_user(
                    first_name=user_data.get("first_name", ""),
                    last_name=user_data.get("last_name", ""),
                    email=user_data.get("email", ""),
                    username=user_data["username"],
                    password=user_data["password"],
                    is_staff=True
                ),
                phone_number=validated_data.get("phone_number", ""),
                secret_key=secret_key_obj
            )

            secret_key_obj.logged = True
            secret_key_obj.save(update_fields=["logged"])

        return teacher


class StudentsRegisterListAPIService:

    @staticmethod
    def _prepare_user_data(data: dict) -> dict:
        first_name = data["user"]["first_name"]
        last_name = data["user"]["last_name"]

        return {
            "username": f"{first_name}{last_name}{data['school_class']}".lower(),
            "password": make_password(f"{first_name[0]}{last_name[0]}"),
            "first_name": first_name,
            "last_name": last_name
        }

    @staticmethod
    def _validate_classes_exist(school_class_titles: set[str]) -> None:
        existing_titles = set(SchoolClass.objects.filter(
            title__in=school_class_titles
        ).values_list("title", flat=True))

        missing = school_class_titles - existing_titles
        if missing:
            raise serializers.ValidationError(
                f"Classes not found: {', '.join(missing)}"
            )

    @staticmethod
    def _create_users_bulk(data_list: list[dict]) -> tuple[list[User], set[str]]:
        school_class_titles = {data["school_class"] for data in data_list}
        StudentsRegisterListAPIService._validate_classes_exist(school_class_titles)

        user_data = [StudentsRegisterListAPIService._prepare_user_data(data) for data in data_list]

        try:
            users = User.objects.bulk_create(
                [User(**data) for data in user_data],
                batch_size=50
            )
            return users, school_class_titles
        except IntegrityError:
            raise serializers.ValidationError({
                "error": "Есть уже зарегистрированные ученики."
            })

    @staticmethod
    def _get_school_classes_map(school_class_titles: set[str]) -> dict[str, SchoolClass]:
        return {
            sc.title: sc
            for sc in SchoolClass.objects.filter(title__in=school_class_titles)
            .only("id", "title")
        }

    @staticmethod
    @transaction.atomic
    def create_students(validated_data: list[dict]) -> list[Student]:
        users, school_class_titles = StudentsRegisterListAPIService._create_users_bulk(validated_data)
        school_classes = StudentsRegisterListAPIService._get_school_classes_map(school_class_titles)

        students_data = []
        for i, user in enumerate(users):
            class_title = validated_data[i]["school_class"]
            students_data.append(Student(
                user=user,
                school_class=school_classes[class_title],
                authorized=False
            ))

        return Student.objects.bulk_create(students_data, batch_size=500)


class BaseLoginAPIService(UserAPIService):
    TOKEN_EXPIRE_MINUTES = 60

    def login(self) -> Response:
        try:
            user_data = self.get_user_and_password()

            if not user_data or "user" not in user_data or "password" not in user_data:
                raise AuthenticationFailed("Недопустимый формат учетных данных")

            user = user_data["user"]

            if not user:
                raise AuthenticationFailed("Пользователь не найден")

            if not user.check_password(user_data["password"]):
                raise AuthenticationFailed("Неверный пароль")

            token = self.generate_token(user)
            response = self.create_auth_response(token)

            login(self.request, user)
            self.post_login(user)

            return response

        except Exception as e:
            raise AuthenticationFailed(str(e))

    def generate_token(self, user) -> str:
        payload = self.get_payload(user)
        return jwt.encode(payload, "secret", algorithm=ALGORITHM)

    def create_auth_response(self, token: str) -> Response:
        response = Response({"jwt_token": token}, status=200)
        response.set_cookie(key="jwt", value=token, httponly=True)

        return response

    def get_payload(self, user) -> dict:
        now = datetime.datetime.utcnow()
        return {
            "id": user.id,
            "is_staff": self.is_staff_user(user),
            "exp": now + datetime.timedelta(minutes=self.TOKEN_EXPIRE_MINUTES),
            "iat": now
        }

    def get_user_and_password(self) -> dict[str, Any]:
        raise NotImplementedError()

    def is_staff_user(self, user) -> bool:
        raise NotImplementedError()

    def post_login(self, user) -> None:
        pass


class TeacherLoginAPIService(BaseLoginAPIService):
    def get_user_and_password(self) -> dict[str, Any]:
        data = self.request.data
        username = data.get("username")

        if not username:
            return {"user": None, "password": None}

        return {
            "user": User.objects.filter(username=username).only("id", "password").first(),
            "password": data.get("password")
        }

    def is_staff_user(self, user) -> bool:
        return True


class StudentLoginAPIService(BaseLoginAPIService):
    def get_user_and_password(self) -> dict[str, Any]:
        data = self.request.data
        required_fields = ["first_name", "last_name", "school_class", "password"]

        if not all(field in data for field in required_fields):
            return {"user": None, "password": None}

        school_class = data["school_class"].strip()
        first_name = data["first_name"].strip()
        last_name = data["last_name"].strip()
        password = data["password"]

        username = f"{first_name}{last_name}{school_class}"

        return {
            "user": User.objects.filter(username=username).only("id", "password").first(),
            "password": password
        }

    def is_staff_user(self, user) -> bool:
        return False

    def post_login(self, user) -> None:
        Student.objects.filter(user=user).update(authorized=True)