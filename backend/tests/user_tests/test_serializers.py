from rest_framework.test import APITestCase

from user_app.serializers import StudentsRegisterListAPISerializer, TeacherRegisterAPISerializer, SchoolClassSerializer, UserSerializer
from user_app.models import User, Teacher, Student, TeacherSecretKey, SchoolClass


class UserSerializerTestCase(APITestCase):

    def setUp(self) -> None:
        self.user_data: dict = {
            "first_name": "Test_first_name",
            "last_name": "Test_last_name",
            "username": "Test_username",
            "password": "Test_password",
        }

    def test_create_user(self) -> None:
        serializer = UserSerializer(data=self.user_data)
        self.assertTrue(serializer.is_valid())
        user = serializer.save()

        self.assertTrue(user.check_password(self.user_data["password"]))
        self.assertEqual(user.username, self.user_data["username"])


class TeacherSerializerTestCase(APITestCase):

    def setUp(self) -> None:
        self.secret_key = TeacherSecretKey.objects.create(key="123")
        self.teacher_data: dict[str, dict] = {
            "user": {
                "first_name": "Test_first_name",
                "last_name": "Test_last_name",
                "username": "Test_username",
                "password": "Test_password"
            },
            "phone_number": "1234567890",
            "secret_key": "123"
        }

    def test_create_teacher(self) -> None:
        serializer = TeacherRegisterAPISerializer(data=self.teacher_data)
        self.assertTrue(serializer.is_valid())
        user = serializer.save()

        self.assertEqual(user.user.username, self.teacher_data["user"]["username"])
        self.assertEqual(user.phone_number, self.teacher_data["phone_number"])
        self.assertTrue(user.user.is_staff)


class StudentListSerializerTestCase(APITestCase):

    def setUp(self) -> None:
        self.school_class = SchoolClass.objects.create(title="9Г", slug="9Г")
        self.student_data: list[dict] = [
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

    def test_create_students(self) -> None:
        serializer = StudentsRegisterListAPISerializer(data=self.student_data)
        self.assertTrue(serializer.is_valid())
        students = serializer.save()

        username = self.student_data[0]["first_name"] + self.student_data[0]["last_name"] + self.student_data[0]["school_class"]
        password = self.student_data[0]["first_name"][0] + self.student_data[0]["last_name"][0]

        self.assertEqual(students[0].school_class.title, self.student_data[0]["school_class"])
        self.assertTrue(students[0].user.check_password(password))
        self.assertEqual(students[0].user.username, username)
        self.assertEqual(Student.objects.count(), 3)
        self.assertFalse(students[0].user.is_staff)
