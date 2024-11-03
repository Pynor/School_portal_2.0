from django.db.models import Prefetch
from user_app.models import SchoolClass, Student, User
from .models import Task, TaskList, Answer, AnswerList
from user_app.serializers import StudentSerializer


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
    def get_task_list(kwargs) -> TaskList:
        task_for_id = SchoolClass.objects.filter(title=kwargs["school_class"]).values_list("id", flat=True).first()
        task_list = TaskList.objects.filter(task_for=task_for_id).first()

        return task_list


class AnswerListAPIService:
    @staticmethod
    def create_answer_list(validated_data: dict) -> AnswerList:
        answer_list = AnswerList.objects.create(user=validated_data.pop("user"))
        answers_data = validated_data.pop("answers")

        for answer_data in answers_data:
            Answer.objects.create(answer_list=answer_list, **answer_data)

        return answer_list

    @staticmethod
    def get_answer_list(kwargs: dict, student_serializer: StudentSerializer, answer_serializer) -> list[dict]:
        school_class = SchoolClass.objects.get(title=kwargs["school_class"])
        students = Student.objects.filter(school_class=school_class).select_related("user")

        answers_and_students = []

        for student in students:
            answers = Answer.objects.filter(answer_list__user=student.user).select_related("task")
            serialized_answers = answer_serializer(answers, many=True).data

            answers_and_students.append({
                "student": student_serializer(student).data,
                "answers": serialized_answers
            })

        return answers_and_students
