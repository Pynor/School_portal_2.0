from django.core.validators import FileExtensionValidator
from django.db import models

from user_app.models import Student, SchoolClass


class Task(models.Model):

    CONDITION_CHOICES = (
        ("None", "Without additional tasks"),
        ("Photo", "Take a picture of the answer")
    )

    list_tasks = models.ForeignKey("ListTasks", verbose_name="List tasks", on_delete=models.CASCADE)
    description = models.TextField(verbose_name="Description", max_length=300, null=True)
    answer_to_the_task = models.CharField(verbose_name="Answer to the task", max_length=100)
    additional_condition = models.CharField(verbose_name="Additional condition", choices=CONDITION_CHOICES, null=True, max_length=255)
    sequence_number = models.IntegerField(verbose_name="Sequence number")

    docx = models.FileField(upload_to="tasks_media/docx/",
                            validators=[FileExtensionValidator(allowed_extensions=["docx"])],
                            verbose_name="DOCX file", null=True)
    video = models.FileField(upload_to="tasks_media/video/",
                             validators=[FileExtensionValidator(allowed_extensions=["mp4", "MPG", "mkv", "mov"])],
                             verbose_name="Video file", null=True)


class ListTasks(models.Model):
    event_date = models.TimeField(null=True)
    task_for = models.ForeignKey(to=SchoolClass, verbose_name="Task for", on_delete=models.CASCADE)
    count_task = models.IntegerField(verbose_name="Count task")


class Answer(models.Model):
    task = models.ForeignKey("Task", verbose_name="Task", on_delete=models.CASCADE)
    list_answer = models.ForeignKey("ListAnswer", verbose_name="List answer", on_delete=models.CASCADE)
    answer = models.CharField(verbose_name="Answer", max_length=100, null=True)
    photo_to_the_answer = models.ImageField(upload_to="tasks_media/images/", verbose_name="Photo to the answer", null=True)

    def __str__(self):
        return f"Answer:{self.answer}"


class ListAnswer(models.Model):
    student = models.ForeignKey(to=Student, verbose_name="Student", on_delete=models.CASCADE)