from rest_framework import serializers

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
    user = UserSerializer(write_only=True)

    class Meta:
        model = Teacher
        fields = "__all__"

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user = User.objects.create_user(**user_data)
        user.is_staff = True

        teacher = Teacher.objects.create(user=user, phone_number=validated_data.get('phone_number'))
        return teacher


class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    school_class = serializers.SlugRelatedField(slug_field='slug', read_only=True)

    class Meta:
        model = Student
        fields = ['id', 'user', 'school_class', 'authorized']

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user = User.objects.create_user(**user_data)

        student = Student.objects.create(user=user, school_class=validated_data.get('school_class'))
        return student


class SchoolClassSerializer(serializers.ModelSerializer):

    class Meta:
        model = SchoolClass
        fields = ['id', 'slug', 'title']
