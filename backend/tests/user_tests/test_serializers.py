import json

from django.urls import reverse
from django.contrib.auth.models import User

from rest_framework import status
from rest_framework.test import APITestCase

from user_app.models import Teacher, Student, SchoolClass


class UserSerializerTestCase(APITestCase):

    def setUp(self):
        self.user_data = {
            "username": "testuser",
            "password": "testpassword",
            "first_name": "Test",
            "last_name": "User"
        }

    def test_create_user(self):
        response = self.client.post(reverse("user-student-register"), self.user_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 1)


class TeacherSerializerTestCase(APITestCase):

    def setUp(self):
        self.teacher_data = {
            "user": {
                "username": "testteacher",
                "password": "testpassword",
                "first_name": "Test",
                "last_name": "Teacher"
            },
            "phone_number": "1234567890"
        }

    def test_create_teacher(self):
        response = self.client.post(reverse("user-teacher-register"), self.teacher_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Teacher.objects.count(), 1)


class StudentSerializerTestCase(APITestCase):

    def setUp(self):
        self.student_data = {
            "school_class": "9A",
            "user": {
                "first_name": "Student_first_name1",
                "last_name": "Student_last_name1"
            }
        }

    def test_create_student(self):
        response = self.client.post(reverse("user-student-register"), self.student_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Student.objects.count(), 1)


class StudentListSerializerTestCase(APITestCase):

    def setUp(self):
        self.student_data = [
            {
                "school_class": "9A",
                "user": {
                    "first_name": "Student_first_name1",
                    "last_name": "Student_last_name1"
                }
            },
            {
                "school_class": "9A",
                "user": {
                    "first_name": "Student_first_name2",
                    "last_name": "Student_last_name2"
                }
            }
        ]

    def test_create_students(self):
        response = self.client.post(reverse("user-student-register"), self.student_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Student.objects.count(), 2)
