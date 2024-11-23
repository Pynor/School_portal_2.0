from django.test import TestCase

from task_app.models import TaskList, Task, AnswerList, Answer
from user_app.models import SchoolClass, Student, User


class TaskModelTestCase(TestCase):
    def setUp(self):
        self.school_class = SchoolClass.objects.create(title="9Г", slug="9Г")
        self.task_list = TaskList.objects.create(title="Test Task List", count_task=1, task_for=self.school_class)

    def test_create_task(self):
        task = Task.objects.create(
            answer_to_the_task="This is the answer",
            sequence_number=1,
            title="Test Task",
            description="Test description",
            time_to_task="00:30:00",
            task_list=self.task_list,
            additional_condition="None"
        )
        self.assertIsInstance(task, Task)
        self.assertEqual(task.title, "Test Task")
        self.assertEqual(task.task_list.title, "Test Task List")


class TaskListModelTestCase(TestCase):
    def setUp(self):
        self.school_class = SchoolClass.objects.create(title="9Г", slug="9Г")

    def test_create_task_list(self):
        task_list = TaskList.objects.create(
            title="Test Task List",
            count_task=0,
            task_for=self.school_class
        )
        self.assertIsInstance(task_list, TaskList)
        self.assertEqual(task_list.title, "Test Task List")

    def test_str_method(self):
        task_list = TaskList.objects.create(
            title="Test Task List",
            count_task=0,
            task_for=self.school_class
        )
        self.assertEqual(str(task_list), f"Task list ({task_list.title}) for: ({self.school_class.title})")


class AnswerModelTestCase(TestCase):
    def setUp(self):
        self.school_class = SchoolClass.objects.create(title="9Г", slug="9Г")
        self.task_list = TaskList.objects.create(title="Test Task List", count_task=0, task_for=self.school_class)
        self.answer_list = AnswerList.objects.create(user=User .objects.create(username='testuser'), task_list=self.task_list)

    def test_create_answer(self):
        answer = Answer.objects.create(
            answer="This is an answer",
            task=Task.objects.create(
                answer_to_the_task="This is the answer",
                sequence_number=1,
                title="Test Task",
                description="Test description",
                time_to_task="00:30:00",
                task_list=self.task_list,
                additional_condition="None"
            ),
            answer_list=self.answer_list,
            photo_to_the_answer=None
        )
        self.assertIsInstance(answer, Answer)
        self.assertEqual(answer.answer, "This is an answer")

    def test_str_method(self):
        answer = Answer.objects.create(
            answer="This is an answer",
            task=Task.objects.create(
                answer_to_the_task="This is the answer",
                sequence_number=1,
                title="Test Task",
                description="Test description",
                time_to_task="00:30:00",
                task_list=self.task_list,
                additional_condition="None"
            ),
            answer_list=self.answer_list,
            photo_to_the_answer=None
        )
        self.assertEqual(str(answer), f"Answer: ({answer.answer}) to Task: ({answer.task.title})")


class AnswerListModelTestCase(TestCase):
    def setUp(self):
        self.school_class = SchoolClass.objects.create(title="9Г", slug="9Г")
        self.task_list = TaskList.objects.create(title="Test Task List", count_task=0, task_for=self.school_class)
        self.user = User.objects.create(username='testuser', password="123")

    def test_create_answer_list(self):
        answer_list = AnswerList.objects.create(
            user=self.user,
            task_list=self.task_list
        )
        self.assertIsInstance(answer_list, AnswerList)
        self.assertEqual(answer_list.user.username, "testuser")

    def test_str_method(self):
        answer_list = AnswerList.objects.create(
            user=self.user,
            task_list=self.task_list
        )
        self.assertEqual(str(answer_list), f"List of answer on (Test Task List) from: {self.user.first_name} {self.user.last_name}")

