from django.conf.urls.static import static
from django.urls import path, include
from django.conf import settings
from django.contrib import admin

from drf_yasg.views import get_schema_view
from drf_yasg import openapi

from rest_framework import permissions


openapi_info = openapi.Info(
    title="School_Portal_2.0 API",
    default_version="v1",
    description="API for internal use (Frontend and School_Portal_bot).",
    terms_of_service="https://www.google.com/policies/terms/",
    contact=openapi.Contact(email="pynor31@mail.ru"),
    license=openapi.License(name="GNU License"),
)

schema_view = get_schema_view(
    openapi_info,
    public=True,
    permission_classes=[permissions.AllowAny],
)


urlpatterns = [
    path('api/statistic_app/', include('statistic_app.urls')),
    path('api/user_app/', include('user_app.urls')),
    path('api/task_app/', include('task_app.urls')),
    path('admin/', admin.site.urls),

    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]

if settings.DEBUG:
    import debug_toolbar

    urlpatterns = [path('__debug__/', include(debug_toolbar.urls))] + urlpatterns
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
