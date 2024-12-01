from rest_framework import generics, permissions, status
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

        while f'answers[{i}][answer]' in request.data:
            answers_data.append({
                'photo_to_the_answer': request.data.get(f'answers[{i}][photo_to_the_answer]'),
                'answer': request.data.get(f'answers[{i}][answer]'),
                'task': request.data.get(f'answers[{i}][task]'),
            })
            i += 1

        request._full_data = {
            'task_list': request.data.get('task_list'),
            'user': request.data.get('user'),
            'answers': answers_data
        }

        return super().create(request, *args, **kwargs)


class StudentAndAnswerListAPIView(APIView):
    def get(self, request, *args, **kwargs):
        return AnswerListSerializer.get_student_and_answer_list(kwargs=kwargs)


class TaskListAPIView(APIView):
    def get(self, request, *args, **kwargs):
        return TaskListSerializer.get_task_list(kwargs=kwargs)

    def post(self, request, *args, **kwargs):
        return TaskListSerializer.create(request=request.data,)
