from rest_framework.test import APIClient, APITestCase
from rest_framework import status


from task_app.models import TaskList, Task, AnswerList, Answer
from user_app.models import SchoolClass, User


class AnswerListCreateAPITest(APITestCase):
    def setUp(self) -> None:
        self.task_for = SchoolClass.objects.create(title="9Г", slug="9Г")
        self.user = User.objects.create_user(username="Student", password="password")

        self.task_list = TaskList.objects.create(count_task=2, title="Test task", task_for=self.task_for)

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

        self.assertEqual(AnswerList.objects.get().user.username, "Student")
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
