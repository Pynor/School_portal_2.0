from rest_framework.test import APIClient, APITestCase
from rest_framework import status


from task_app.models import TaskList, Task, AnswerList, Answer

from user_app.models import SchoolClass, Student, User


class AnswerListAPITestCase(APITestCase):
    def setUp(self) -> None:
        self.task_for = SchoolClass.objects.create(title="9Г", slug="9Г")
        self.user = User.objects.create_user(username="Student", password="password")
        self.student = Student.objects.create(school_class=self.task_for, user=self.user, authorized=True)

        self.task_list = TaskList.objects.create(task_for=self.task_for, count_task=2, title="Test task")

        self.task_1 = Task.objects.create(description="task_description_1", answer_to_the_task="answer",
                                          task_list=self.task_list, sequence_number=1, title="task_1")

        self.task_2 = Task.objects.create(description="task_description_2", answer_to_the_task="answer",
                                          task_list=self.task_list, sequence_number=2, title="task_2")

    def test_create_answers_list(self) -> None:
        client = APIClient()
        data: dict[str, dict] = {
            "task_list": self.task_list.id,
            "user": self.user.id,
            "answers": [
                {
                    "answer": "answer",
                    "task": self.task_1.id,
                    "photo_to_the_answer": None
                },
                {
                    "answer": "bad answer",
                    "task": self.task_2.id,
                    "photo_to_the_answer": None
                }

            ]
        }

        response = client.post("/task_app/api/v1/api-answer-list-create/", data, format="json")

        self.assertEqual(AnswerList.objects.get().user.username, self.user.username)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(AnswerList.objects.count(), 1)
        self.assertEqual(Answer.objects.count(), 2)

    def test_get_answers_list(self) -> None:
        self.answer_list = AnswerList.objects.create(user=self.user, task_list=self.task_list)

        self.answer_1 = Answer.objects.create(answer="bad answer", task=self.task_1, answer_list=self.answer_list)
        self.answer_2 = Answer.objects.create(answer="answer", task=self.task_2, answer_list=self.answer_list)

        client = APIClient()
        response = client.get(f"/task_app/api/v1/api-answer-list-get/{self.task_for.title}/{self.task_list.id}")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]["tasks_and_answers"][0]["answer"]["answer"], self.answer_1.answer)
        self.assertEqual(response.data[0]["tasks_and_answers"][1]["answer"]["answer"], self.answer_2.answer)
        self.assertEqual(response.data[0]["tasks_and_answers"][0]["task"]["title"], self.task_1.title)
        self.assertEqual(response.data[0]["tasks_and_answers"][1]["task"]["title"], self.task_2.title)
        self.assertEqual(response.data[0]["tasks_and_answers"][0]["answer"]["task"], self.task_1.id)
        self.assertEqual(response.data[0]["tasks_and_answers"][1]["answer"]["task"], self.task_2.id)
        self.assertEqual(response.data[0]["student"]["school_class"], self.task_for.title)
        self.assertTrue(response.data[0]["student"]["authorized"])


class TaskListAPITestCase(APITestCase):
    def setUp(self) -> None:
        self.task_for = SchoolClass.objects.create(title="9Г", slug="9Г")
        self.user = User.objects.create_user(username="Student", password="password")
        self.student = Student.objects.create(school_class=self.task_for, user=self.user, authorized=True)

    def test_create_task_list(self) -> None:
        client = APIClient()
        data: dict[str, list] = {
            "title": "Test task list",
            "count_task": 2,
            "task_for": "9Г",
            "tasks": [
                {
                  "sequence_number": 1,
                  "answer_to_the_task": "2",
                  "title": "Task 1",
                  "description": "1+1=",
                  "additional_condition": "None"
                },
                {
                  "sequence_number": 2,
                  "answer_to_the_task": "4",
                  "title": "Task 2",
                  "description": "2+2=",
                  "additional_condition": "Photo",
                  "time_to_task": "PT1H30M45S"
                }
            ]
        }

        response = client.post("/task_app/api/v1/api-task-list-create/", data, format="json")

        self.assertEqual(TaskList.objects.get().title, "Test task list")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(TaskList.objects.count(), 1)
        self.assertEqual(Task.objects.count(), 2)

    def test_get_answers_list(self) -> None:
        self.task_list_1 = TaskList.objects.create(task_for=self.task_for, title="Test task list 1", count_task=1)

        self.task_1_1 = Task.objects.create(additional_condition="None", answer_to_the_task="answer_1_1",
                                            description="task_description_1", time_to_task="PT1H30M45S",
                                            task_list=self.task_list_1, sequence_number=1,
                                            title="task_1_1")

        self.task_list_2 = TaskList.objects.create(task_for=self.task_for, title="Test task list 2", count_task=2)

        self.task_2_1 = Task.objects.create(description="task_description_1", answer_to_the_task="answer_2_1",
                                            additional_condition="Photo", task_list=self.task_list_2,
                                            sequence_number=1, title="task_2_1")

        self.task_2_2 = Task.objects.create(description="task_description_2", answer_to_the_task="answer_2_2",
                                            additional_condition="None", task_list=self.task_list_2,
                                            sequence_number=2, title="task_2_2")

        client = APIClient()
        response = client.get(f"/task_app/api/v1/api-task-list-get/{self.task_for}")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["task_list"][0]["tasks"][0]["title"], self.task_1_1.title)
        self.assertEqual(response.data["task_list"][1]["tasks"][0]["title"], self.task_2_1.title)
        self.assertEqual(response.data["task_list"][1]["tasks"][1]["title"], self.task_2_2.title)
        self.assertEqual(response.data["task_list"][0]["tasks"][0]["time_to_task"], "01:30:45")
        self.assertEqual(response.data["task_list"][1]["tasks"][0]["time_to_task"], None)

        self.assertEqual(response.data["task_list"][1]["tasks"][0]["additional_condition"],
                         self.task_2_1.additional_condition)
        self.assertEqual(response.data["task_list"][1]["tasks"][1]["additional_condition"],
                         self.task_2_2.additional_condition)

        self.assertEqual(response.data["task_list"][0]["task_for"], self.task_for.title)
        self.assertEqual(response.data["task_list"][1]["task_for"], self.task_for.title)
