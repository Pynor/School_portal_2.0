from django.urls import re_path, path

from .views import *


urlpatterns = [
    path("v1/api-task-list-delete/<int:task_id>", TaskListDeleteAPIView.as_view(), name='task-list-delete'),

    path("v1/api-answer-list-create/", AnswerListCreateAPIView.as_view(), name='answer-list-create'),
    path("v1/api-task-list-create/", TaskListCreateAPIView.as_view(), name='task-list-create'),

    re_path(r'^v1/api-task-list-get/(?P<school_class>[^/]+)(?:/(?P<user_id>\d+))?$',
            TaskListGetAPIView.as_view(), name='task-list-get'),

    path("v1/api-answer-list-get/<str:school_class>/<int:task_list_id>",
         StudentAndAnswerListAPIView.as_view(),
         name='answer-list-get')
]
