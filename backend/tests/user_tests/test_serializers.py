from rest_framework.test import APITestCase

from user_app.models import User, Teacher, Student, TeacherSecretKey, SchoolClass
from user_app.serializers import UserSerializer, TeacherSerializer, StudentsRegisterListSerializer, SchoolClassSerializer


class UserSerializerTestCase(APITestCase):

    def setUp(self):
        self.user_data = {
            "username": "Test_username",
            "password": "Test_password",
            "last_name": "Test_last_name",
            "first_name": "Test_first_name"
        }

    def test_create_user(self):
        serializer = UserSerializer(data=self.user_data)
        self.assertTrue(serializer.is_valid())
        user = serializer.save()

        self.assertEqual(user.username, self.user_data["username"])
        self.assertTrue(user.check_password(self.user_data["password"]))


class TeacherSerializerTestCase(APITestCase):

    def setUp(self):
        self.secret_key = TeacherSecretKey.objects.create(key="123")
        self.teacher_data = {
            "user": {
                "first_name": "Test_first_name",
                "last_name": "Test_last_name",
                "username": "Test_username",
                "password": "Test_password"
            },
            "secret_key": "123",
            "phone_number": "1234567890"
        }

    def test_create_teacher(self):
        serializer = TeacherSerializer(data=self.teacher_data)
        self.assertTrue(serializer.is_valid())
        user = serializer.save()

        self.assertEqual(user.user.username, self.teacher_data["user"]["username"])
        self.assertEqual(user.phone_number, self.teacher_data["phone_number"])
        self.assertTrue(user.user.is_staff)


class StudentListSerializerTestCase(APITestCase):

    def setUp(self):
        self.school_class = SchoolClass.objects.create(title="9Г", slug="9Г")
        self.student_data = [
            {
                "first_name": "John",
                "last_name": "Doe",
                "school_class": "9Г"
            },
            {
                "first_name": "Jane",
                "last_name": "Smith",
                "school_class": "9Г"
            },
            {
                "first_name": "Mike",
                "last_name": "Johnson",
                "school_class": "9Г"
            }
        ]

    def test_create_students(self):
        serializer = StudentsRegisterListSerializer(data=self.student_data)
        self.assertTrue(serializer.is_valid())
        students = serializer.save()

        password = self.student_data[0]["first_name"][0] + self.student_data[0]["last_name"][0]

        self.assertFalse(students[0].user.is_staff)
        self.assertEqual(Student.objects.count(), 3)
        self.assertTrue(students[0].user.check_password(password))
        self.assertEqual(students[0].school_class.title, self.student_data[0]["school_class"])
