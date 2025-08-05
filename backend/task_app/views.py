from rest_framework.authentication import SessionAuthentication
from rest_framework import permissions, generics, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from rest_framework_simplejwt.authentication import JWTAuthentication
from drf_yasg.utils import swagger_auto_schema

from user_app.permissions import IsTeacher
from .serializers import *


class AnswerListCreateAPIView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = AnswerListSerializer

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
    authentication_classes = [SessionAuthentication, JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = TaskListSerializer

    def create(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return Response(
                {"detail": "Authentication credentials were not provided."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not hasattr(request.user, 'teacher'):
            return Response(
                {"detail": "Only teachers can create task lists."},
                status=status.HTTP_403_FORBIDDEN
            )

        tasks_data = []
        i = 0
        while True:
            task_title = request.data.get(f"tasks[{i}][title]")
            if task_title is None:
                break

            task_data = {
                "title": task_title,
                "additional_condition": request.data.get(f"tasks[{i}][additional_condition]", "None"),
                "answer_to_the_task": request.data.get(f"tasks[{i}][answer_to_the_task]", ""),
                "link_to_article": request.data.get(f"tasks[{i}][link_to_article]", ""),
                "sequence_number": request.data.get(f"tasks[{i}][sequence_number]", i + 1),
                "description": request.data.get(f"tasks[{i}][description]", ""),
                "photo_file": request.data.get(f"tasks[{i}][photo_file]"),
                "video_file": request.data.get(f"tasks[{i}][video_file]"),
                "docx_file": request.data.get(f"tasks[{i}][docx_file]"),
            }
            tasks_data.append(task_data)
            i += 1

        request._full_data = {
            "time_to_tasks": request.data.get("time_to_tasks"),
            "count_task": len(tasks_data),
            "task_for": request.data.get("task_for"),
            "creator": request.user.teacher.id,
            "subject": request.data.get("subject"),
            "title": request.data.get("title"),
            "tasks": tasks_data
        }

        return super().create(request, *args, **kwargs)


class StudentAndAnswerGetListAPIView(APIView):
    permission_classes = [IsTeacher]

    def get(self, request, *args, **kwargs):
        return AnswerListSerializer.get_student_and_answer_list(kwargs=kwargs)


class TaskListGetAPIView(APIView):
    @swagger_auto_schema(operation_description="Get a list of tasks for a class")
    def get(self, request):
        school_class = request.GET.get("class")
        user_id = request.GET.get("user_id")

        if user_id:
            return TaskListSerializer.get_unfinished_task_list(school_class=school_class, user_id=user_id)

        if not request.user.is_staff:
            raise PermissionDenied("Доступно только учителям")

        return TaskListSerializer.get_all_task_list(status=request.GET.get("status", "active"),
                                                    subject_id=request.GET.get("subject_id"),
                                                    school_class=school_class)


class TaskListDeleteAPIView(APIView):

    @swagger_auto_schema(operation_description="Delete an issue by task ID")
    def delete(self, request, task_id):
        return TaskListSerializer.delete_task_list_by_id(task_id=task_id)


class TaskListChangeStatusAPIView(APIView):
    permission_classes = [IsTeacher]

    @swagger_auto_schema(operation_description="Archived an issue by task ID")
    def put(self, request, task_id):
        return TaskListSerializer.change_status_task_list_by_id(task_id=task_id)
