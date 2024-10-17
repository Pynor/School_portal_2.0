from django.core.exceptions import ObjectDoesNotExist
from rest_framework import serializers

from .models import Task, TaskList, Answer, AnswerList
from user_app.models import SchoolClass, Student, User


class TaskListService:
    @staticmethod
    def create_task_list(validated_data: dict) -> TaskList:
        tasks_data = validated_data.pop("tasks")
        task_for_title = validated_data.pop("task_for")
        task_for = SchoolClass.objects.get(title=task_for_title)

        task_list = TaskList.objects.create(task_for=task_for,
                                            count_task=len(tasks_data),
                                            title=validated_data.pop("title"))

        for task_data in tasks_data:
            Task.objects.create(task_list=task_list, **task_data)

        return task_list


class AnswerListService:
    @staticmethod
    def create_answer_list(validated_data: dict) -> AnswerList:
        user = User.objects.get(username=validated_data.pop("username"))
        student = Student.objects.filter(user=user).first()

        answer_list = AnswerList.objects.create(student=student)
        answers_data = validated_data.pop("answers")

        for answer_data in answers_data:
            Task.objects.create(answer_list=answer_list, **answer_data)

        return answer_list
