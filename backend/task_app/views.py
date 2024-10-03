from rest_framework import generics, permissions
from rest_framework.views import APIView

from .serializers import *
from .services import *
from .models import *


class TaskListCreateAPIView(generics.CreateAPIView):
    serializer_class = TaskListSerializer
    permission_classes = [permissions.AllowAny]

