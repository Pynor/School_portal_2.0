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


class TaskListCreateAPIView(generics.CreateAPIView):
    serializer_class = TaskListSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        tasks_data = []
        i = 0

        while f'tasks[{i}][title]' in request.data:
            task_data = {key: request.data.get(f'tasks[{i}][{key}]') for key in [
                'additional_condition',
                'answer_to_the_task',
                'link_to_article',
                'sequence_number',
                'photo_file',
                'video_file',
                'docx_file',
                'title'
            ]}
            tasks_data.append(task_data)
            i += 1

        request._full_data = {
            'time_to_tasks': request.data.get('time_to_tasks'),
            'count_task': request.data.get('count_task'),
            'task_for': request.data.get('task_for'),
            'title': request.data.get('title'),
            'tasks': tasks_data
        }

        return super().create(request, *args, **kwargs)


class StudentAndAnswerListAPIView(APIView):
    def get(self, request, *args, **kwargs):
        return AnswerListSerializer.get_student_and_answer_list(kwargs=kwargs)


class TaskListAPIView(APIView):
    def get(self, request, *args, **kwargs):
        return TaskListSerializer.get_task_list(kwargs=kwargs)

