from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from user_app.models import SchoolClass, Student, User
from .models import Task, TaskList, Answer, AnswerList


class TaskListAPIService:
    @staticmethod
    def create_task_list(validated_data: dict) -> TaskList:
        task_for = SchoolClass.objects.get(title=validated_data.pop("task_for"))
        tasks_data = validated_data.pop("tasks")

        task_list = TaskList.objects.create(task_for=task_for,
                                            count_task=len(tasks_data),
                                            title=validated_data.pop("title"))

        for task_data in tasks_data:
            Task.objects.create(task_list=task_list, **task_data)

        return task_list

    @staticmethod
    def get_task_list(kwargs) -> list[TaskList]:
        task_for_id = SchoolClass.objects.filter(title=kwargs["school_class"]).values_list("id", flat=True).first()
        task_list = TaskList.objects.filter(task_for=task_for_id)

        return task_list


class AnswerListAPIService:
    @staticmethod
    def create_answer_list(validated_data: dict) -> AnswerList:
        answers_data = validated_data.pop("answers")
        task_list = validated_data.get("task_list")
        user = validated_data.get("user")

        if AnswerList.objects.filter(task_list=task_list, user=user).exists():
            raise ValidationError({"details": "Ответ на эту задачу уже был получен."})

        answer_list = AnswerList.objects.create(task_list=task_list,
                                                user=user)

        for answer_data in answers_data:
            Answer.objects.create(answer_list=answer_list, **answer_data)

        return answer_list

    @staticmethod
    def get_student_and_answer_list(kwargs: dict, student_serializer, answer_serializer) -> Response:
        task_list_id = kwargs["task_list_id"]
        school_class = SchoolClass.objects.get(title=kwargs["school_class"])
        students = Student.objects.filter(school_class=school_class).select_related("user")

        answers_and_students = []

        for student in students:
            answers = Answer.objects.filter(answer_list__task_list=task_list_id,
                                            answer_list__user=student.user,).select_related("task")
            serialized_answers = answer_serializer(answers, many=True)

            answers_and_students.append({
                "student": student_serializer(student).data,
                "answers": serialized_answers.data
            })

        return Response(answers_and_students)
