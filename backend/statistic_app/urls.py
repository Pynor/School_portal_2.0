from django.urls import path
from .views import StatisticsLoginStudentsAPIView

urlpatterns = [
    path(r"v1/statistics-logged-in-students/<str:school_class>", StatisticsLoginStudentsAPIView.as_view(),
         name='statistics_logged_in_students'),
]
