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
    title = models.CharField(max_length=30, unique=True, verbose_name="Title to task")
    description = models.TextField(max_length=300, null=True, verbose_name="Description")
    link_to_article = models.URLField(null=True, blank=True, verbose_name="Link to article")

    task_list = models.ForeignKey("TaskList", related_name="tasks", verbose_name="List tasks",
                                  on_delete=models.CASCADE)
    additional_condition = models.CharField(max_length=255, null=True, verbose_name="Additional condition",
                                            choices=CONDITION_CHOICES)

    docx_file = models.FileField(upload_to="tasks_media/docx/",
                                 null=True, blank=True, verbose_name="DOCX file",
                                 validators=[FileExtensionValidator(allowed_extensions=["docx"])])

    photo_file = models.ImageField(upload_to="tasks_media/images/", null=True, blank=True, verbose_name="Photo file")

    video_file = models.FileField(upload_to="tasks_media/video/",
                                  null=True, blank=True, verbose_name="Video file",
                                  validators=[FileExtensionValidator(allowed_extensions=["mp4", "MPG", "mkv", "mov"])])

    def __str__(self):
        return f"Task({self.sequence_number}) of ({self.task_list.title}): {self.title}"


class TaskList(models.Model):

    STATUS_CHOICES = (
        ("Created", "Created"),
        ("Archived", "Archived"),
        ("Completed", "Completed"),
        ("In Progress", "In Progress"),
    )

    count_task = models.IntegerField(verbose_name="Count task")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated at")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created at")
    title = models.CharField(max_length=255, unique=True, verbose_name="Title task list")
    time_to_tasks = models.DurationField(blank=True, null=True, verbose_name="Time to task")
    task_for = models.ForeignKey(to=SchoolClass, on_delete=models.CASCADE, verbose_name="Task for")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Created", verbose_name="Task status")

    def __str__(self):
        return f"Task list ({self.title}) for: ({self.task_for.title})"


class Answer(models.Model):
    answer = models.CharField(null=True, blank=True, verbose_name="Answer")
    task = models.ForeignKey("Task", on_delete=models.CASCADE, verbose_name="Task")
    answer_list = models.ForeignKey("AnswerList", on_delete=models.CASCADE, verbose_name="List answers")
    photo_to_the_answer = models.ImageField(upload_to="answers_media/images/", null=True, verbose_name="Photo to answer")

    def __str__(self):
        return f"Answer: ({self.answer}) to Task: ({self.task.title})"


class AnswerList(models.Model):
    reviewed = models.BooleanField(default=False, verbose_name="Answer reviewed")
    user = models.ForeignKey(to=User, on_delete=models.CASCADE, verbose_name="Student")
    task_list = models.ForeignKey(to=TaskList, on_delete=models.CASCADE, verbose_name="Task list")
    execution_time_answer = models.DurationField(blank=True, null=True, verbose_name="Execution time answer")

    def __str__(self):
        return f"List of answer on ({self.task_list.title}) from: {self.user.first_name} {self.user.last_name}"
