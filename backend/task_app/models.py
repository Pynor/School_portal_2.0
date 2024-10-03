from django.core.validators import FileExtensionValidator
from django.db import models


class Task(models.Model):

    CONDITION_CHOICES = (
        ("None", "Без дополнительных задач"),
        ("Photo", "Сфотографировать решение задачи")
    )

    list_tasks = models.ForeignKey("ListTasks", verbose_name="Список задач", on_delete=models.CASCADE)
    description = models.TextField(verbose_name="Описание задачи", max_length=300, null=True)
    answer_to_the_task = models.CharField(verbose_name="Ответ на задачу", max_length=100)
    additional_condition = models.CharField(verbose_name="Доп-условия к задаче", choices=CONDITION_CHOICES, null=True, max_length=255)
    sequence_number = models.IntegerField(verbose_name="Порядковый номер задачи")

    docx = models.FileField(upload_to="tasks_media/docx/",
                            validators=[FileExtensionValidator(allowed_extensions=["docx"])],
                            verbose_name="DOCX файл", null=True)
    video = models.FileField(upload_to="tasks_media/video/",
                             validators=[FileExtensionValidator(allowed_extensions=["mp4", "MPG", "mkv", "mov"])],
                             verbose_name="Видео файл", null=True)


class ListTasks(models.Model):
    event_date = models.TimeField(null=True)
    task_for = models.ForeignKey(to="users.SchoolClass", verbose_name="Задача для", on_delete=models.CASCADE)
    count_task = models.IntegerField(verbose_name="Кол-во задач")


class Answer(models.Model):
    task = models.ForeignKey("Task", verbose_name="Задача", on_delete=models.CASCADE)
    list_answer = models.ForeignKey("ListAnswer", verbose_name="Список ответов", on_delete=models.CASCADE)
    answer = models.CharField(verbose_name="Ответ на задачу", max_length=100, null=True)
    photo_to_the_answer = models.ImageField(upload_to="tasks_media/images/", verbose_name="фото задачи", null=True)

    def __str__(self):
        return f"Ответ:{self.answer}"


class ListAnswer(models.Model):
    student = models.ForeignKey(to="users.Student", verbose_name="Ученик", on_delete=models.CASCADE)