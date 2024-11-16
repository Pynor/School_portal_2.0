from rest_framework import serializers

from .services import StudentsRegisterListAPIService, TeacherRegisterAPIService
from .models import Teacher, Student, SchoolClass, User


class StudentSerializer(serializers.ModelSerializer):
    last_name = serializers.CharField(max_length=40, source="user.last_name")
    first_name = serializers.CharField(max_length=40, source="user.first_name")
    school_class = serializers.CharField(max_length=3)

    class Meta:
        model = Student
        fields = ["id", "school_class", "authorized", "last_name", "first_name"]


class UserSerializer(serializers.ModelSerializer):
    student = StudentSerializer(required=False)

    class Meta:
        model = User
        fields = "__all__"
        extra_kwargs = {
            "password": {
                "write_only": True,
                "required": False
            }
        }

    def create(self, validated_data: dict[str, str]) -> User:
        user = User.objects.create_user(**validated_data)
        return user


class TeacherRegisterSerializer(serializers.ModelSerializer):
    secret_key = serializers.CharField(max_length=40)
    user = UserSerializer(write_only=True)

    class Meta:
        model = Teacher
        fields = "__all__"

    def create(self, validated_data: dict[str]) -> Teacher:
        return TeacherRegisterAPIService.create_teacher(validated_data)


class StudentsRegisterListAPISerializer(serializers.ListSerializer):
    child = StudentSerializer()

    def create(self, validated_data: list[dict[str, str]]):
        return StudentsRegisterListAPIService.create_students(validated_data)

    def update(self, instance, validated_data):
        return ...


class SchoolClassSerializer(serializers.ModelSerializer):

    class Meta:
        model = SchoolClass
        fields = ["id", "slug", "title"]
