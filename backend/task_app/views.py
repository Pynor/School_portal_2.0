from rest_framework import permissions, generics
from rest_framework.views import APIView

from .serializers import *
from .services import *
from .models import *


class AnswerListCreateAPIView(generics.CreateAPIView):
    serializer_class = AnswerListSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        answers_data = []
        i = 0

        while f"answers[{i}][answer]" in request.data:
            answer_data = {key: request.data.get(f"answers[{i}][{key}]") for key in [
                "photo_to_the_answer",
                "answer",
                "task"
            ]}
            answers_data.append(answer_data)
            i += 1

        request._full_data = {
            "execution_time_answer": request.data.get("execution_time_answer"),
            "task_list": request.data.get("task_list"),
            "user": request.data.get("user"),
            "answers": answers_data
        }

        return super().create(request, *args, **kwargs)


class TaskListCreateAPIView(generics.CreateAPIView):
    serializer_class = TaskListSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        tasks_data = []
        i = 0

        while f"tasks[{i}][title]" in request.data:
            task_data = {key: request.data.get(f"tasks[{i}][{key}]") for key in [
                "additional_condition",
                "answer_to_the_task",
                "link_to_article",
                "sequence_number",
                "description",
                "photo_file",
                "video_file",
                "docx_file",
                "title"
            ]}
            tasks_data.append(task_data)
            i += 1

        request._full_data = {
            "time_to_tasks": request.data.get("time_to_tasks"),
            "count_task": request.data.get("count_task"),
            "task_for": request.data.get("task_for"),
            "title": request.data.get("title"),
            "tasks": tasks_data
        }

        return super().create(request, *args, **kwargs)


class StudentAndAnswerListAPIView(APIView):
    def get(self, request, *args, **kwargs):
        return AnswerListSerializer.get_student_and_answer_list(kwargs=kwargs)


class TaskListAPIView(APIView):
    def get(self, request, school_class, user_id=None):
        if user_id:
            return TaskListSerializer.get_unfinished_task_list(school_class=school_class, user_id=user_id)
        return TaskListSerializer.get_all_task_list(school_class=school_class)

