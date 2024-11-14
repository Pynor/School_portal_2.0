from rest_framework import generics, permissions
from rest_framework.views import APIView

from .serializers import *
from .services import *
from .models import *


class AnswerListCreateAPIView(generics.CreateAPIView):
    serializer_class = AnswerListSerializer
    permission_classes = [permissions.AllowAny]


class TaskListCreateAPIView(generics.CreateAPIView):
    serializer_class = TaskListSerializer
    permission_classes = [permissions.AllowAny]


class StudentAndAnswerListAPIView(APIView):
    def get(self, request, *args, **kwargs):
        return AnswerListSerializer.get_student_and_answer_list(kwargs=kwargs)


class TaskListAPIView(APIView):
    def get(self, request, *args, **kwargs):
        return TaskListSerializer.get_task_list(kwargs=kwargs)
