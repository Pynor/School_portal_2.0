from rest_framework import serializers
from django.conf import settings

from .models import Teacher, Student, SchoolClass


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = settings.AUTH_USER_MODEL
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'is_teacher']


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
