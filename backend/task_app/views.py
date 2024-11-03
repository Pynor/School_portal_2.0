from rest_framework import generics, permissions
from rest_framework.response import Response
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


class AnswerListAPIView(APIView):
    def get(self, request, *args, **kwargs):
        return Response(AnswerListSerializer.get_answer_list(kwargs=kwargs))


class TaskListAPIView(APIView):
    def get(self, request, *args, **kwargs):
        return Response(TaskListSerializer.get_task_list(kwargs=kwargs))
