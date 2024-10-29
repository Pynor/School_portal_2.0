from django.core.validators import FileExtensionValidator
from django.db import models

from user_app.models import User, SchoolClass


class Task(models.Model):

    CONDITION_CHOICES = (
        ("None", "Without additional tasks"),
        ("Photo", "Take a picture of the answer")
    )

    answer_to_the_task = models.CharField(verbose_name="Answer to task")
    sequence_number = models.IntegerField(verbose_name="Sequence number")
    title = models.CharField(verbose_name="Title to task", max_length=30, unique=True)
    description = models.TextField(verbose_name="Description", max_length=300, null=True)
    time_to_task = models.DurationField(verbose_name="Time to task", blank=True, null=True)

    task_list = models.ForeignKey("TaskList", verbose_name="List tasks", related_name="tasks",
                                  on_delete=models.CASCADE)
    additional_condition = models.CharField(verbose_name="Additional condition", max_length=255, null=True,
                                            choices=CONDITION_CHOICES)

    docx = models.FileField(upload_to="tasks_media/docx/",
                            validators=[FileExtensionValidator(allowed_extensions=["docx"])],
                            verbose_name="DOCX file", null=True)
    video = models.FileField(upload_to="tasks_media/video/",
                             validators=[FileExtensionValidator(allowed_extensions=["mp4", "MPG", "mkv", "mov"])],
                             verbose_name="Video file", null=True)

    def __str__(self):
        return f"Task({self.sequence_number}): {self.title}"


class TaskList(models.Model):
    count_task = models.IntegerField(verbose_name="Count task")
    title = models.CharField(max_length=255, unique=True, verbose_name="Title task list")
    task_for = models.ForeignKey(to=SchoolClass, verbose_name="Task for", on_delete=models.CASCADE)

    def __str__(self):
        return f"Task list for: {self.task_for.title}"


class Answer(models.Model):
    answer = models.CharField(verbose_name="Answer", null=True, blank=True)
    task = models.ForeignKey("Task", verbose_name="Task", on_delete=models.CASCADE)
    answer_list = models.ForeignKey("AnswerList", verbose_name="List answers", on_delete=models.CASCADE)
    photo_to_the_answer = models.ImageField(upload_to="tasks_media/images/", verbose_name="Photo to answer", null=True)

    def __str__(self):
        return f"Answer:{self.answer} to Task:{self.task.title}"


class AnswerList(models.Model):
    user = models.ForeignKey(to=User, verbose_name="Student", on_delete=models.CASCADE)

    def __str__(self):
        return f"List of student's answer: {self.user.first_name} {self.user.last_name}"
