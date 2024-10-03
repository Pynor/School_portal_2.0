from rest_framework import serializers
from django.db import transaction
from rest_framework.exceptions import AuthenticationFailed

from .models import Answer, Task


class TaskSerializer(serializers.ModelSerializer):

    class Meta:
        model = Task
        fields = "__all__"


class TaskListSerializer(serializers.ListSerializer):
    child = TaskSerializer()