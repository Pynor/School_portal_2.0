from rest_framework import serializers

from .services import AnswerListAPIService, TaskListAPIService
from .models import Answer, AnswerList, Task, TaskList


class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ("answer", "task", "photo_to_the_answer")
        extra_kwargs = {
            "photo_to_the_answer": {"allow_null": True}
        }


class AnswerListSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True, write_only=True)

    class Meta:
        model = AnswerList
        fields = "__all__"

    def create(self, validated_data: dict[str]) -> AnswerList:
        return AnswerListAPIService.create_answer_list(validated_data)


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ("sequence_number", "answer_to_the_task", "title",
                  "description", "additional_condition", "time_to_task")


class TaskListSerializer(serializers.ModelSerializer):
    tasks = TaskSerializer(many=True)
    task_for = serializers.CharField()

    class Meta:
        model = TaskList
        fields = ("id", "title", "count_task", "tasks", "task_for")
        read_only_fields = ("count_task",)

    @staticmethod
    def get_task_list(kwargs) -> dict:
        task_list = TaskListAPIService.get_task_list(kwargs=kwargs)
        task_list_serializer = TaskListSerializer(task_list)

        return {"task_list": task_list_serializer.data}

    def create(self, validated_data: dict[str]) -> TaskList:
        return TaskListAPIService.create_task_list(validated_data)
