from rest_framework.generics import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView

from django.db.models import Count

from user_app.models import SchoolClass, Student


class StatisticsLoginStudentsAPIView(APIView):
    def get(self, request, school_class):
        school_class_instance = get_object_or_404(SchoolClass, title=school_class)

        statistics = Student.objects.filter(school_class=school_class_instance) \
            .values("authorized") \
            .annotate(count=Count("id")) \
            .order_by("authorized")

        stats_dict = {True: 0, False: 0}
        for stat in statistics:
            stats_dict[stat["authorized"]] = stat["count"]

        return Response({
            "unauthorized_students_count": stats_dict[False],
            "authorized_students_count": stats_dict[True],
            "class": school_class_instance.title,
        })