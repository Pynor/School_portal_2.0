from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.conf import settings

from .models import Teacher, Student, SchoolClass, User


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
    user = UserSerializer(read_only=True)

    class Meta:
        model = Teacher
        fields = ['id', 'user', 'phone_number']


class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    school_class = serializers.SlugRelatedField(slug_field='slug', read_only=True)

    class Meta:
        model = Student
        fields = ['id', 'user', 'school_class', 'authorized']


class SchoolClassSerializer(serializers.ModelSerializer):

    class Meta:
        model = SchoolClass
        fields = ['id', 'slug', 'title']
