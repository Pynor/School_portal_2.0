from django.urls import path

from .views import *

urlpatterns = [
    path("api/v1/api-task-list-create/", TaskListCreateAPIView.as_view(), name='task-list-create'),
]