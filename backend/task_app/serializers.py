from rest_framework import serializers
from rest_framework.response import Response

from .services import AnswerListAPIService, TaskListAPIService
from .models import Answer, AnswerList, Task, TaskList

from user_app.serializers import StudentSerializer
from user_app.models import SchoolClass, Student


class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ("answer", "task", "photo_to_the_answer")
        extra_kwargs = {
            "photo_to_the_answer": {"allow_null": True},
            "answer": {"default": ""}
        }


class AnswerListSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True, write_only=True)

    class Meta:
        model = AnswerList
        fields = "__all__"

    def create(self, validated_data: dict[str]) -> AnswerList:
        return AnswerListAPIService.create_answer_list(validated_data)

    @staticmethod
    def get_student_and_answer_list(kwargs) -> Response:
        return AnswerListAPIService.get_students_answers_and_tasks_by_task_list(kwargs, StudentSerializer,
                                                                                AnswerSerializer, TaskSerializer)


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ("sequence_number", "answer_to_the_task", "title",
                  "description", "additional_condition", "time_to_task", "id")


class TaskListSerializer(serializers.ModelSerializer):
    tasks = TaskSerializer(many=True)
    task_for = serializers.CharField()

    class Meta:
        model = TaskList
        fields = ("id", "title", "count_task", "tasks", "task_for")
        read_only_fields = ("count_task",)

    @staticmethod
    def get_task_list(kwargs) -> Response:
        task_lists = TaskListAPIService.get_task_list(kwargs=kwargs)
        task_list_serializers = [TaskListSerializer(task_list).data for task_list in task_lists]

        return Response({"task_list": task_list_serializers}, status=200)

    def create(self, validated_data: dict[str]) -> TaskList:
        return TaskListAPIService.create_task_list(validated_data)
