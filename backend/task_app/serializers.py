from rest_framework import serializers

from .models import Answer, ListAnswer, Task, ListTasks
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
        tasks_data = validated_data.pop("tasks")
        task_for_title = validated_data.pop("task_for")
        task_for = SchoolClass.objects.get(title=task_for_title)

        list_tasks = ListTasks.objects.create(count_task=len(tasks_data),
                                              title=validated_data.pop("title"),
                                              task_for=task_for)

        for task_data in tasks_data:
            Task.objects.create(list_tasks=list_tasks, **task_data)
        return list_tasks
