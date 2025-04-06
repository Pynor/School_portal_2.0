from django.db import transaction, IntegrityError
from django.db.models import Prefetch, Q
from rest_framework import status

from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from user_app.models import SchoolClass, Student, User
from .models import Task, TaskList, Answer, AnswerList


class TaskListAPIService:
    @staticmethod
    def create_task_list(validated_data: dict) -> TaskList:
        try:
            with transaction.atomic():
                tasks_data = validated_data.pop("tasks")
                task_for_title = validated_data.pop("task_for")

                task_for_id = (
                    SchoolClass.objects
                    .filter(title=task_for_title)
                    .values_list('id', flat=True)
                    .first()
                )
                if not task_for_id:
                    raise ValidationError({"detail": "Такого класса не существует."})

                task_list = TaskList.all_objects.select_related('task_for').create(
                    task_for_id=task_for_id,
                    time_to_tasks=validated_data.pop("time_to_tasks"),
                    title=validated_data.pop("title"),
                    count_task=len(tasks_data)
                )

                if tasks_data:
                    Task.objects.bulk_create([
                        Task(task_list_id=task_list.id, **task_data)
                        for task_data in tasks_data
                    ])

                return task_list

        except IntegrityError as e:
            if 'task_app_tasklist_title_key' in str(e):
                raise ValidationError({"detail": "Название списка задач уже существует"})
            raise

    @staticmethod
    def get_all_task_list(school_class: str, status: str) -> list[TaskList]:

        if status == "active":
            task_list = TaskList.objects.select_related('task_for').filter(task_for__title=school_class)
        elif status == "archive":
            task_list = TaskList.archived_objects.select_related('task_for').filter(task_for__title=school_class)
        elif status == "all":
            task_list = TaskList.all_objects.select_related('task_for').filter(task_for__title=school_class)

        return task_list

    @staticmethod
    def get_unfinished_task_list(school_class: str, user_id: int) -> list[TaskList]:
        task_list = TaskList.objects.select_related('task_for').filter(task_for__title=school_class).exclude(
            Q(answerlist__user_id=user_id)
        )
        return task_list

    @staticmethod
    def delete_task_list_by_id(task_id: int) -> Response:
        deleted_count, _ = TaskList.all_objects.filter(id=task_id).delete()

        if deleted_count == 0:
            return Response({"detail": "Задачи не существует."}, status=status.HTTP_404_NOT_FOUND)

        return Response(status=status.HTTP_204_NO_CONTENT)

    @staticmethod
    def archived_task_list_by_id(task_id: int) -> Response:
        try:
            task_list = TaskList.objects.get(pk=task_id)
        except TaskList.DoesNotExist:
            return Response(
                {"detail": "Задачи не существует."},
                status=status.HTTP_404_NOT_FOUND
            )

        task_list.archive()

        return Response(
            {"detail": "Задача успешно архивирована."},
            status=status.HTTP_200_OK
        )


class AnswerListAPIService:
    @staticmethod
    def create_answer_list(validated_data: dict) -> AnswerList:
        execution_time_answer = validated_data.get("execution_time_answer")
        answers_data = validated_data.pop("answers")
        task_list = validated_data.get("task_list")
        user = validated_data.get("user")

        if AnswerList.objects.filter(task_list=task_list, user=user).exists():
            raise ValidationError({"details": "Ответ на эту задачу уже был получен."})

        answer_list = AnswerList.objects.create(
            execution_time_answer=execution_time_answer,
            task_list=task_list,
            user=user
        )

        answers_to_create = [Answer(answer_list=answer_list, **answer_data) for answer_data in answers_data]
        Answer.objects.bulk_create(answers_to_create)

        return answer_list

    @staticmethod
    def get_students_answers_and_tasks_by_task_list(kwargs: dict, student_serializer,
                                                    answer_serializer, task_serializer) -> Response:

        task_list_id = kwargs["task_list_id"]
        school_class = SchoolClass.objects.prefetch_related(
            Prefetch('student_set', queryset=Student.objects.select_related('user'))
        ).get(title=kwargs["school_class"])

        students = school_class.student_set.all()

        answers = Answer.objects.filter(
            answer_list__task_list=task_list_id,
            answer_list__user__in=students.values_list('user', flat=True)
        ).select_related("task")

        answers_dict = {}
        for answer in answers:
            user_id = answer.answer_list.user.id
            if user_id not in answers_dict:
                answers_dict[user_id] = []
            answers_dict[user_id].append(answer)

        answers_and_students = []

        for student in students:
            student_answers = answers_dict.get(student.user.id, [])
            serialized_answers = answer_serializer(student_answers, many=True).data
            tasks_and_answers = [
                {
                    "answer": serialized_answers[i],
                    "execution_time_answer": student_answers[i].answer_list.execution_time_answer,
                    "task": task_serializer(instance=student_answers[i].task,
                                            context={'include_answer': True}).data if student_answers[i].task else None
                }
                for i in range(len(student_answers))
            ]

            answers_and_students.append({
                "student": student_serializer(student).data,
                "tasks_and_answers": tasks_and_answers
            })

        return Response(answers_and_students)
