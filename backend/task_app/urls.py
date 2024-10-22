from django.urls import path

from .views import *

urlpatterns = [
    path("api/v1/api-answer-list-create/", AnswerListCreateAPIView.as_view(), name='answer-list-create'),
    path("api/v1/api-task-list-create/", TaskListCreateAPIView.as_view(), name='task-list-create'),
    path("api/v1/api-task-list-get/", TaskListAPIView.as_view(), name='task-list-get'),
]
