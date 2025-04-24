from django.contrib import admin
from .models import *


@admin.register(TaskList)
class TaskListAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "is_archived")
    list_filter = ("is_archived",)
    search_fields = ("title",)
    ordering = ("id",)

    def get_queryset(self, request):
        return TaskList.objects.all()

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "task_list", "is_archived")
    list_filter = ("is_archived", "task_list")
    search_fields = ("title", "description")

admin.site.register(AnswerList)
admin.site.register(Answer)