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
    def get_task_list(validated_data: dict) -> TaskList:
        task_for = SchoolClass.objects.get(title=validated_data.pop("task_for"))
        task_list = TaskList.objects.filter(task_for=task_for).select_related("tasks").all()
        for task_list_instance in task_list:
            print(f"Task list: {task_list_instance.title}")
            for task in task_list_instance.tasks.all():
                print(f"- Task: {task.title}")
                print(f"  - Answer: {task.answer_to_the_task}")
                # Access other task fields as needed
            print("---")

        return task_list


class AnswerListAPIService:
    @staticmethod
    def create_answer_list(validated_data: dict) -> AnswerList:
        answer_list = AnswerList.objects.create(user=validated_data.pop("user"))
        answers_data = validated_data.pop("answers")

        for answer_data in answers_data:
            Answer.objects.create(answer_list=answer_list, **answer_data)

        return answer_list
