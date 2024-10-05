from django.db import IntegrityError
from django.test import TestCase

from user_app.models import User, Teacher, TeacherSecretKey, Student, SchoolClass


class UserModelTest(TestCase):
    def setUp(self) -> None:
        self.user = User.objects.create_user(username="TestTeacher",  email="Test@mail.ru", password="TestPassword",
                                             first_name="Test", last_name="User")

    def test_user_creation(self) -> None:
        self.assertIsInstance(self.user, User)
        self.assertEqual(self.user.username, "TestTeacher")
        self.assertEqual(self.user.email, "Test@mail.ru")
        self.assertEqual(self.user.first_name, "Test")
        self.assertEqual(self.user.last_name, "User")


class TeacherModelTest(TestCase):
    def setUp(self) -> None:
        self.user = User.objects.create_user(username="TestTeacher", email="Test@mail.ru", password="TestPassword",
                                             first_name="Test", last_name="User")
        self.teacher = Teacher.objects.create(user=self.user, secret_key="123", phone_number="1234567890")

    def test_teacher_creation(self) -> None:
        self.assertIsInstance(self.teacher, Teacher)
        self.assertEqual(self.teacher.user.username, "TestTeacher")
        self.assertEqual(self.teacher.secret_key, "123")
        self.assertEqual(self.teacher.phone_number, "1234567890")


class TeacherSecretKeyModelTest(TestCase):
    def setUp(self) -> None:
        self.key = TeacherSecretKey.objects.create(key="123")

    def test_teacher_secret_key_creation(self) -> None:
        self.assertIsInstance(self.key, TeacherSecretKey)
        self.assertEqual(self.key.key, "123")
        self.assertFalse(self.key.logged)


class SchoolClassModelTest(TestCase):
    def setUp(self) -> None:
        self.school_class = SchoolClass.objects.create(title="1A", slug="1a")

    def test_school_class_creation(self) -> None:
        self.assertIsInstance(self.school_class, SchoolClass)
        self.assertEqual(self.school_class.title, "1A")
        self.assertEqual(self.school_class.slug, "1a")

    def test_school_class_unique_slug(self) -> None:
        with self.assertRaises(IntegrityError):
            SchoolClass.objects.create(title="1B", slug="1a")

    def test_school_class_str_representation(self):
        self.assertEqual(str(self.school_class), "1A class.")

    def test_school_class_save_method(self) -> None:
        school_class = SchoolClass(title="1B", slug="1b")
        school_class.save()
        self.assertEqual(school_class.title, "1B")
        self.assertEqual(school_class.slug, "1b")

    def test_school_class_save_method_with_unique_slug(self) -> None:
        school_class = SchoolClass(title="1C", slug="1a")
        with self.assertRaises(IntegrityError):
            school_class.save()

    def test_school_class_save_method_with_existing_title_and_slug(self) -> None:
        school_class = SchoolClass(title="1A", slug="1a")
        with self.assertRaises(IntegrityError):
            school_class.save()
