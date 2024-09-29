from rest_framework.test import APIClient, APITestCase
from rest_framework import status


from user_app.models import User, Teacher, Student, TeacherSecretKey, SchoolClass


class TeacherRegisterAPITest(APITestCase):
    def setUp(self):
        self.secret_key = TeacherSecretKey.objects.create(key="123")

    def test_register(self):
        client = APIClient()
        data = {
            "user": {
                "password": "123123",
                "last_name": "last_name",
                "first_name": "first_name",
                "username": "Teacher"
            },
            "secret_key": "123"
        }
        response = client.post("/user_app/api/v1/api-teacher-register/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Teacher.objects.count(), 1)
        self.assertEqual(User.objects.get().username, "Teacher")


class StudentsRegisterListAPITest(APITestCase):
    def setUp(self):
        self.school_class = SchoolClass.objects.create(title="9Г", slug="9Г")

    def test_register(self):
        client = APIClient()
        data = [
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

        response = client.post("/user_app/api/v1/api-student-register/", data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Student.objects.count(), 3)

        self.assertEqual(
            User.objects.filter(first_name="John", last_name="Doe", username="JohnDoe9Г").count(), 1)
        self.assertEqual(
            User.objects.filter(first_name="Jane", last_name="Smith", username="JaneSmith9Г").count(), 1)
        self.assertEqual(
            User.objects.filter(first_name="Mike", last_name="Johnson", username="MikeJohnson9Г").count(), 1)


class TeacherLoginAPITest(APITestCase):
    def setUp(self):
        self.secret_key = TeacherSecretKey.objects.create(key="123")
        self.user = User.objects.create_user(username="Teacher", password="password")
        self.teacher = Teacher.objects.create(user=self.user, secret_key=self.secret_key.key)

    def test_login(self):
        client = APIClient()
        data = {
            "username": "Teacher",
            "password": "password",
        }
        response = client.post("/user_app/api/v1/api-teacher-login/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("jwt_token", response.data)


class StudentLoginAPITest(APITestCase):
    def setUp(self):
        self.school_class = SchoolClass.objects.create(title="9Г", slug="9Г")
        self.user = User.objects.create_user(username="JohnDoe9Г", password="JD", first_name="John", last_name="Doe")
        self.student = Student.objects.create(school_class=self.school_class, user=self.user)

    def test_login(self):
        client = APIClient()
        data = {
            "first_name": "John",
            "last_name": "Doe",
            "password": "JD",
            "school_class": "9Г"
        }
        response = client.post("/user_app/api/v1/api-student-login/", data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Student.objects.get(user=self.user).authorized, True)
        self.assertIn("jwt_token", response.data)


class UserAPITest(APITestCase):
    def setUp(self):
        self.client = APIClient()

        self.school_class = SchoolClass.objects.create(title="9Г", slug="9Г")

        self.user_student = User.objects.create_user(username="IgorLox9Г", password="IL", first_name="Igor", last_name="Lox")
        self.user_teacher = User.objects.create_user(username="Teacher", password="password")

        self.student = Student.objects.create(user=self.user_student, school_class=self.school_class)
        self.teacher = Teacher.objects.create(user=self.user_teacher, secret_key="123")

    def test_get_student(self):
        self.student_jwt_token = self.client.post("/user_app/api/v1/api-student-login/", format="json",
                                                  data={
                                                      "first_name": "Igor",
                                                      "last_name": "Lox",
                                                      "password": "IL",
                                                      "school_class": "9Г"
                                                  }).data["jwt_token"]

        self.client.credentials(HTTP_AUTHORIZATION="jwt_token " + self.student_jwt_token)
        response = self.client.get("/user_app/api/v1/api-user-get/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "IgorLox9Г")

    def test_get_teacher(self):
        self.teacher_jwt_token = self.client.post("/user_app/api/v1/api-teacher-login/",
                                                  {"username": "Teacher", "password": "password"},
                                                  format="json").data["jwt_token"]

        self.client.credentials(HTTP_AUTHORIZATION="jwt_token " + self.teacher_jwt_token)
        response = self.client.get("/user_app/api/v1/api-user-get/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "Teacher")
