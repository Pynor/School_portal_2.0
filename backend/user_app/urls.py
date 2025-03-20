from django.urls import path

from .views import *

urlpatterns = [
    path("v1/api-student-register/", StudentsRegisterListAPIView.as_view(), name='user-student-register'),
    path("v1/api-teacher-register/", TeacherRegisterAPIView.as_view(), name='user-teacher-register'),

    path("v1/api-teacher-login/", TeacherLoginAPIView.as_view(), name='user-teacher-login'),
    path("v1/api-student-login/", StudentLoginAPIView.as_view(), name='user-student-login'),

    path("v1/api-user-logout/", UserLogoutAPIView.as_view(), name='user-logout'),

    path("v1/api-user-get/", UserAPIView.as_view(), name='user-get'),
]
