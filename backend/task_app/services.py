from django.core.exceptions import ObjectDoesNotExist
from rest_framework import serializers

from .models import Task, ListTasks
from user_app.models import SchoolClass


class TaskListService:
    @staticmethod
    def create_task_list(validated_data: dict) -> ListTasks:
        tasks_data = validated_data.pop("tasks")
        task_for_title = validated_data.pop("task_for")
        task_for = SchoolClass.objects.get(title=task_for_title)

        list_tasks = ListTasks.objects.create(task_for=task_for,
                                              count_task=len(tasks_data),
                                              title=validated_data.pop("title"))

        for task_data in tasks_data:
            Task.objects.create(list_tasks=list_tasks, **task_data)

        return list_tasks
