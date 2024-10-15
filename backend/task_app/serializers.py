from rest_framework import serializers

from .services import TaskListService
from .models import Answer, Task, ListTasks

from user_app.models import SchoolClass


class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer


class AnswerListSerializer(serializers.ModelSerializer):
    tasks = AnswerSerializer(many=True)

    class Meta:
        model = ListTasks


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ("sequence_number", "answer_to_the_task", "title",
                  "description", "additional_condition", "time_to_task")


class TaskListSerializer(serializers.ModelSerializer):
    tasks = TaskSerializer(many=True)
    task_for = serializers.CharField()

    class Meta:
        model = ListTasks
        fields = ("id", "title", "count_task", "tasks", "task_for")
        read_only_fields = ("count_task",)

    def create(self, validated_data: dict[str]) -> ListTasks:
        return TaskListService.create_task_list(validated_data)
