from django.urls import path

from .views import *

urlpatterns = [
    path("api/v1/api-teacher-register/", TeacherRegisterAPIView.as_view(), name='user-teacher-register'),
    path("api/v1/api-student-register/", StudentRegisterAPIView.as_view(), name='user-student-register'),
]