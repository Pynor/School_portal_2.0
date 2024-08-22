from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('user_app/', include('user_app.urls')),
    path('admin/', admin.site.urls),
]
