from rest_framework.response import Response
from rest_framework import serializers

from .services import AnswerListAPIService, TaskListAPIService
from .models import Answer, AnswerList, Task, TaskList

from user_app.serializers import StudentSerializer
from user_app.models import SchoolClass, Student


class AnswerSerializer(serializers.ModelSerializer):

    class Meta:
        model = Answer
        fields = ("photo_to_the_answer", "answer", "task")
        extra_kwargs = {
            "task": {"required": True},
            "answer": {"default": ""}
        }


class AnswerListSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True, write_only=True)

    class Meta:
        model = AnswerList
        fields = "__all__"

    def create(self, validated_data: dict) -> AnswerList:
        return AnswerListAPIService.create_answer_list(validated_data)

    @staticmethod
    def get_student_and_answer_list(kwargs) -> Response:
        return AnswerListAPIService.get_students_answers_and_tasks_by_task_list(kwargs, StudentSerializer,
                                                                                AnswerSerializer, TaskSerializer)


class TaskSerializer(serializers.ModelSerializer):

    class Meta:
        model = Task
        fields = ("additional_condition", "answer_to_the_task", "link_to_article", "sequence_number",
                  "description", "docx_file", "photo_file", "video_file", "title", "id",)

        extra_kwargs = {
            "link_to_article": {"required": True},
            "video_file": {"required": True},
            "photo_file": {"required": True},
            "docx_file": {"required": True},
        }

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation.pop("answer_to_the_task", None)
        return representation


class TaskListSerializer(serializers.ModelSerializer):
    tasks = TaskSerializer(many=True)
    task_for = serializers.CharField()

    class Meta:
        model = TaskList
        fields = ("time_to_tasks", "count_task", "task_for", "title",  "tasks", "id")
        read_only_fields = ("count_task",)

    @staticmethod
    def get_task_list(kwargs) -> Response:
        task_lists = TaskListAPIService.get_task_list(kwargs=kwargs)
        task_list_serializers = [TaskListSerializer(task_list).data for task_list in task_lists]

        return Response({"task_list": task_list_serializers}, status=200)

    def create(self, validated_data: dict[str]) -> TaskList:
        return TaskListAPIService.create_task_list(validated_data)
