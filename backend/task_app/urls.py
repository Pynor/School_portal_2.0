from django.urls import path

from .views import *

urlpatterns = [
    path("api/v1/api-task-list-get/<str:school_class>", TaskListAPIView.as_view(), name='task-list-get'),
    path("api/v1/api-task-list-create/", StudentAndAnswerListAPIView.as_view(), name='task-list-create'),

    path("api/v1/api-answer-list-create/", AnswerListCreateAPIView.as_view(), name='answer-list-create'),
    path("api/v1/api-answer-list-get/<str:school_class>/<int:task_list_id>",
         StudentAndAnswerListAPIView.as_view(),
         name='answer-list-get'),
]
