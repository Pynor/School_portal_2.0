from rest_framework import serializers
from django.db import transaction
from rest_framework.exceptions import AuthenticationFailed

from .models import Teacher, TeacherSecretKey, Student, SchoolClass, User


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = "__all__"
        extra_kwargs = {
            "password": {
                "write_only": True,
                "required": False
            }
        }

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class TeacherSerializer(serializers.ModelSerializer):
    user = UserSerializer(write_only=True)
    secret_key = serializers.CharField(max_length=40)

    class Meta:
        model = Teacher
        fields = "__all__"

    def create(self, validated_data):
        user_data = validated_data.pop("user")

        if not TeacherSecretKey.objects.filter(key=validated_data.get("secret_key")).first():
            raise AuthenticationFailed("Неверный секретный ключ.")

        user = User.objects.create_user(**user_data, is_staff=True)
        teacher = Teacher.objects.create(user=user, phone_number=validated_data.get("phone_number"))
        return teacher


class StudentSerializer(serializers.ModelSerializer):
    last_name = serializers.CharField(max_length=40, source="user.last_name")
    first_name = serializers.CharField(max_length=40, source="user.first_name")
    school_class = serializers.CharField(max_length=3)

    class Meta:
        model = Student
        fields = ["id", "school_class", "authorized", "last_name", "first_name"]


class StudentListSerializer(serializers.ListSerializer):
    child = StudentSerializer()

    def _create_user(self, data):
        first_name = data["user"]["first_name"]
        last_name = data["user"]["last_name"]
        username = f"{first_name}{last_name}{data['school_class']}"
        password = f"{first_name[0]}{last_name[0]}"

        return User.objects.create_user(
            first_name=first_name,
            last_name=last_name,
            password=password,
            username=username
        )

    def _get_school_class(self, school_class_title):
        if school_class_title not in self.school_classes:
            self.school_classes[school_class_title] = SchoolClass.objects.select_related().get(title=school_class_title)

        return self.school_classes[school_class_title]

    @transaction.atomic
    def _create_students(self, validated_data):
        students = []

        for data in validated_data:
            user = self._create_user(data)
            school_class = self._get_school_class(data["school_class"])
            student = Student(user=user, school_class=school_class)
            students.append(student)
        return Student.objects.bulk_create(students)

    def create(self, validated_data):
        self.school_classes = {}
        return self._create_students(validated_data)


class SchoolClassSerializer(serializers.ModelSerializer):

    class Meta:
        model = SchoolClass
        fields = ["id", "slug", "title"]
