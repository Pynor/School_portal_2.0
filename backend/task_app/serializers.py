from rest_framework.response import Response
from rest_framework import serializers


from .services import AnswerListAPIService, TaskListAPIService
from .models import Answer, AnswerList, Task, TaskList

from user_app.serializers import StudentSerializer


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
        include_answer = self.context.get('include_answer', False)
        representation = super().to_representation(instance)

        if not include_answer:
            representation.pop("answer_to_the_task", None)

        return representation


class TaskListSerializer(serializers.ModelSerializer):
    task_for = serializers.CharField()
    tasks = TaskSerializer(many=True)

    class Meta:
        model = TaskList
        fields = ("time_to_tasks", "count_task", "task_for", "creator", "subject", "title",  "tasks", "id")
        read_only_fields = ("count_task",)

    @staticmethod
    def get_all_task_list(school_class: str, subject_id: str, status: str) -> Response:
        task_lists = TaskListAPIService.get_task_list(
            school_class=school_class,
            subject_id=subject_id,
            status=status
        )

        task_list_serializers = [TaskListSerializer(task_list).data for task_list in task_lists]
        return Response({"task_list": task_list_serializers}, status=200)

    @staticmethod
    def get_unfinished_task_list(school_class: str, user_id: int) -> Response:
        task_lists = TaskListAPIService.get_unfinished_task_list(school_class=school_class, user_id=user_id)
        task_list_serializers = [TaskListSerializer(task_list).data for task_list in task_lists]
        return Response({"task_list": task_list_serializers}, status=200)

    def create(self, validated_data: dict[str]) -> TaskList:
        return TaskListAPIService.create_task_list(validated_data)

    @staticmethod
    def delete_task_list_by_id(task_id):
        return TaskListAPIService.delete_task_list_by_id(task_id=task_id)

    @staticmethod
    def archived_task_list_by_id(task_id):
        return TaskListAPIService.archived_task_list_by_id(task_id=task_id)
