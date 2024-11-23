from django.test import TestCase
from rest_framework.exceptions import ValidationError

from task_app.serializers import AnswerSerializer, AnswerListSerializer, TaskListSerializer
from task_app.services import AnswerListAPIService, TaskListAPIService

from task_app.models import TaskList, Task, AnswerList, Answer
from user_app.models import SchoolClass, Student, User


class AnswerSerializerTestCase(TestCase):
    def setUp(self) -> None:
        self.task_for = SchoolClass.objects.create(title="9Г", slug="9Г")
        self.task_list = TaskList.objects.create(task_for=self.task_for, title="Test task list 1", count_task=1)

        self.task = Task.objects.create(additional_condition="None", answer_to_the_task="answer",
                                        description="task_description", time_to_task="PT1H30M45S",
                                        task_list=self.task_list, sequence_number=1,
                                        title="task")

    def test_answer_serializer_valid(self) -> None:
        data: dict = {
            "photo_to_the_answer": None,
            "task": self.task.id,
            "answer": "answer"
        }

        serializer = AnswerSerializer(data=data)

        self.assertTrue(serializer.is_valid())
        self.assertEqual(serializer.validated_data["answer"], "answer")
        self.assertEqual(serializer.validated_data["photo_to_the_answer"], None)

    def test_answer_serializer_invalid(self) -> None:
        data: dict = {
            "photo_to_the_answer": None,
            "answer": "answer",
            "task": 999
        }

        serializer = AnswerSerializer(data=data)

        self.assertFalse(serializer.is_valid())
        self.assertIn("task", serializer.errors)


class AnswerListSerializerTestCase(TestCase):
    def setUp(self) -> None:
        self.task_for = SchoolClass.objects.create(title="9Г", slug="9Г")
        self.user = User.objects.create_user(username="Student", password="password")
        self.student = Student.objects.create(school_class=self.task_for, user=self.user, authorized=True)

        self.task_list = TaskList.objects.create(task_for=self.task_for, count_task=2, title="Test task")

        self.task_1 = Task.objects.create(description="task_description_1", answer_to_the_task="answer",
                                          task_list=self.task_list, sequence_number=1, title="task_1")

        self.task_2 = Task.objects.create(description="task_description_2", answer_to_the_task="answer",
                                          task_list=self.task_list, sequence_number=2, title="task_2")

    def test_create_answer_list(self) -> None:
        data: dict[str, list] = {
            "answers": [
                {"answer": "Answer 1", "task": self.task_1.id, "photo_to_the_answer": None},
                {"answer": "Answer 2", "task": self.task_2.id, "photo_to_the_answer": None},
            ],
            "task_list": self.task_list.id,
            "user": self.user.id
        }

        serializer = AnswerListSerializer(data=data)

        self.assertTrue(serializer.is_valid())
        answer_list = serializer.create(serializer.validated_data)

        self.assertIsInstance(answer_list, AnswerList)

    def test_create_answer_list_duplicate(self) -> None:
        AnswerList.objects.create(task_list=self.task_list, user=self.user)

        data: dict[str, list] = {
            "answers": [{"answer": "Answer 1", "task": 1, "photo_to_the_answer": None}],
            "task_list": self.task_list.id,
            "user": self.user.id
        }

        serializer = AnswerListSerializer(data=data)

        with self.assertRaises(ValidationError):
            serializer.is_valid(raise_exception=True)


class TaskListSerializerTestCase(TestCase):
    def setUp(self) -> None:
        self.task_for = SchoolClass.objects.create(title="9Г", slug="9Г")
        self.user = User.objects.create_user(username="Student", password="password")
        self.student = Student.objects.create(school_class=self.task_for, user=self.user, authorized=True)

    def test_create_task_list(self) -> None:
        data: dict[str, list] = {
            "title": "Test Task List",
            "task_for": self.task_for.title,
            "tasks": [
                {"sequence_number": 1, "answer_to_the_task": "Answer 1", "title": "Task 1", "description": "Description 1"},
                {"sequence_number": 2, "answer_to_the_task": "Answer 2", "title": "Task 2", "description": "Description 2"},
            ]
        }

        serializer = TaskListSerializer(data=data)

        self.assertTrue(serializer.is_valid())
        task_list = serializer.create(serializer.validated_data)

        self.assertIsInstance(task_list, TaskList)

    def test_get_task_list(self) -> None:
        task_list = TaskList.objects.create(title="Test Task List", count_task=0, task_for=self.task_for)

        kwargs = {"school_class": self.task_for.title}
        response = TaskListAPIService.get_task_list(kwargs)

        self.assertIn(task_list, response)
