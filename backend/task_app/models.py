from django.core.validators import FileExtensionValidator
from django.db import models, transaction
from django.utils import timezone

from user_app.models import SchoolSubject, SchoolClass, Teacher, User


class ActiveManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(is_archived=False)


class ArchivedManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(is_archived=True)


class Task(models.Model):
    CONDITION_CHOICES = (
        ("Photo", "Take a picture of the answer"),
        ("None", "Without additional tasks")
    )

    video_file = models.FileField(upload_to="tasks_media/video/", null=True, blank=True, verbose_name="Video file",
                                  validators=[FileExtensionValidator(allowed_extensions=["mp4", "MPG", "mkv", "mov"])])

    photo_file = models.ImageField(upload_to="tasks_media/images/", null=True, blank=True, verbose_name="Photo file")

    docx_file = models.FileField(upload_to="tasks_media/docx/",null=True, blank=True, verbose_name="DOCX file",
                                 validators=[FileExtensionValidator(allowed_extensions=["docx"])])

    additional_condition = models.CharField(max_length=255, null=True, verbose_name="Additional condition",
                                            choices=CONDITION_CHOICES)

    task_list = models.ForeignKey("TaskList", related_name="tasks", verbose_name="List tasks",
                                  on_delete=models.CASCADE)

    archived_at = models.DateTimeField(null=True, blank=True, verbose_name="Archived at")
    is_archived = models.BooleanField(default=False, verbose_name="Archived")

    link_to_article = models.URLField(null=True, blank=True, verbose_name="Link to article")
    description = models.TextField(max_length=300, null=True, verbose_name="Description")
    title = models.CharField(max_length=30, unique=True, verbose_name="Title to task")
    sequence_number = models.IntegerField(verbose_name="Sequence number")
    answer_to_the_task = models.CharField(verbose_name="Answer to task")

    def __str__(self):
        return f"Task({self.sequence_number}) of ({self.task_list.title}): {self.title}"


class TaskList(models.Model):
    archived_objects = ArchivedManager()
    all_objects = models.Manager()
    objects = ActiveManager()

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=~models.Q(status='Active') | models.Q(is_archived=False),
                name='active_task_list_not_archived'
            )
        ]

        indexes = [
            models.Index(fields=['task_for', 'is_archived']),
            models.Index(fields=['status', 'is_archived']),
            models.Index(fields=['title', 'is_archived']),
        ]
        ordering = ['-created_at']

    STATUS_CHOICES = (
        ("Archived", "Archived"),
        ("Active", "Active")
    )

    archived_at = models.DateTimeField(null=True, db_index=True, blank=True, verbose_name="Archived at")
    is_archived = models.BooleanField(default=False, db_index=True, verbose_name="Archived")

    created_at = models.DateTimeField(auto_now_add=True, db_index=True, verbose_name="Created at")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated at")

    task_for = models.ForeignKey(to=SchoolClass, db_index=True, on_delete=models.PROTECT, verbose_name="Task for")
    creator = models.ForeignKey(to=Teacher, db_index=True, on_delete=models.CASCADE, verbose_name="Creator")
    time_to_tasks = models.DurationField(blank=True, null=True, verbose_name="Time to task")
    title = models.CharField(max_length=255, unique=True, verbose_name="Title task list")
    count_task = models.PositiveIntegerField(verbose_name="Count task")


    subject = models.ForeignKey(to=SchoolSubject, db_index=True, on_delete=models.CASCADE,
                                verbose_name="School subject")
    status = models.CharField(max_length=20, db_index=True, choices=STATUS_CHOICES,
                              default="Created", verbose_name="Task status")


    @transaction.atomic
    def archive(self):
        if self.is_archived:
            return

        now = timezone.now()

        locked_self = TaskList.objects.select_for_update().get(pk=self.pk)

        locked_self.is_archived = True
        locked_self.archived_at = now
        locked_self.status = "Archived"
        locked_self.save(update_fields=['is_archived', 'archived_at', 'status'])

        tasks_ids = list(locked_self.tasks.only('id').values_list('id', flat=True))
        answer_lists_ids = list(
            AnswerList.objects.filter(task_list=locked_self).only('id').values_list('id', flat=True))

        if tasks_ids:
            Task.objects.filter(id__in=tasks_ids).update(
                is_archived=True,
                archived_at=now
            )

        if answer_lists_ids:
            AnswerList.objects.filter(id__in=answer_lists_ids).update(
                is_archived=True,
                archived_at=now
            )

            Answer.objects.filter(answer_list__in=answer_lists_ids).update(
                is_archived=True,
                archived_at=now
            )

    @transaction.atomic
    def restore(self):
        if not self.is_archived:
            return

        locked_self = TaskList.objects.select_for_update().get(pk=self.pk)

        locked_self.is_archived = False
        locked_self.archived_at = None

        if locked_self.status == "Archived":
            locked_self.status = "Active"

        locked_self.save(update_fields=['is_archived', 'archived_at', 'status'])
        tasks_ids = locked_self.tasks.values_list('id', flat=True)

        answer_lists_ids = AnswerList.objects.filter(task_list=locked_self).values_list('id', flat=True)

        if tasks_ids:
            Task.objects.filter(id__in=tasks_ids).update(
                is_archived=False,
                archived_at=None
            )

        if answer_lists_ids:
            AnswerList.objects.filter(id__in=answer_lists_ids).update(
                is_archived=False,
                archived_at=None
            )

            Answer.objects.filter(answer_list__in=answer_lists_ids).update(
                is_archived=False,
                archived_at=None
            )

    def __str__(self):
        return f"Task list ({self.title}) for: ({self.task_for.title})"


class Answer(models.Model):
    answer_list = models.ForeignKey("AnswerList", on_delete=models.CASCADE, verbose_name="List answers")
    photo_to_the_answer = models.ImageField(upload_to="answers_media/images/", null=True,
                                            verbose_name="Photo to answer")
    task = models.ForeignKey("Task", on_delete=models.CASCADE, verbose_name="Task")
    answer = models.CharField(null=True, blank=True, verbose_name="Answer")

    archived_at = models.DateTimeField(null=True, blank=True, verbose_name="Archived at")
    is_archived = models.BooleanField(default=False, verbose_name="Archived")

    def __str__(self):
        return f"Answer: ({self.answer}) to Task: ({self.task.title})"


class AnswerList(models.Model):
    execution_time_answer = models.DurationField(blank=True, null=True, verbose_name="Execution time answer")
    task_list = models.ForeignKey(to=TaskList, on_delete=models.CASCADE, verbose_name="Task list")
    user = models.ForeignKey(to=User, on_delete=models.CASCADE, verbose_name="Student")
    reviewed = models.BooleanField(default=False, verbose_name="Answer reviewed")

    archived_at = models.DateTimeField(null=True, blank=True, verbose_name="Archived at")
    is_archived = models.BooleanField(default=False, verbose_name="Archived")

    def __str__(self):
        return f"List of answer on ({self.task_list.title}) from: {self.user.first_name} {self.user.last_name}"
