import os
import base64
from django.core.files import File
from django.core.exceptions import ValidationError
from django.conf import settings
from django.utils.crypto import get_random_string

from django.db.models import Prefetch
from rest_framework.response import Response

from user_app.models import SchoolClass, Student, User
from .models import Task, TaskList, Answer, AnswerList


class TaskListAPIService:
    @staticmethod
    def create_task_list(validated_data: dict) -> TaskList:
        task_for_title = validated_data.pop("task_for")
        tasks_data = validated_data.pop("tasks")
        title = validated_data.pop("title")

        task_for = SchoolClass.objects.get(title=task_for_title)

        task_list = TaskList.objects.create(count_task=len(tasks_data),
                                            task_for=task_for,
                                            title=title)

        tasks_to_create = [Task(task_list=task_list, **task_data) for task_data in tasks_data]
        Task.objects.bulk_create(tasks_to_create)

        return task_list

    @staticmethod
    def get_task_list(kwargs) -> list[TaskList]:
        task_list = TaskList.objects.select_related('task_for').filter(task_for__title=kwargs["school_class"])
        return task_list


class AnswerListAPIService:
    @staticmethod
    def create_answer_list(validated_data: dict) -> AnswerList:
        photo_base64 = validated_data.pop('photo_to_the_answer', None)
        answers_data = validated_data.pop("answers")
        task_list = validated_data.get("task_list")
        user = validated_data.get("user")

        if AnswerList.objects.filter(task_list=task_list, user=user).exists():
            raise ValidationError({"details": "Ответ на эту задачу уже был получен."})

        if photo_base64:
            format, img_str = photo_base64.split(';base64,')
            ext = format.split('/')[-1]
            unique_filename = f"{get_random_string(10)}.{ext}"
            upload_dir = os.path.join(settings.MEDIA_ROOT, 'uploads')
            os.makedirs(upload_dir, exist_ok=True)
            file_path = os.path.join(upload_dir, unique_filename)

            with open(file_path, 'wb') as f:
                f.write(base64.b64decode(img_str))
            validated_data['photo_to_the_answer'] = os.path.join('uploads', unique_filename)

        answer_list = AnswerList.objects.create(task_list=task_list, user=user)

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
                    "task": task_serializer(student_answers[i].task).data if student_answers[i].task else None
                }
                for i in range(len(student_answers))
            ]

            answers_and_students.append({
                "student": student_serializer(student).data,
                "tasks_and_answers": tasks_and_answers
            })

        return Response(answers_and_students)
