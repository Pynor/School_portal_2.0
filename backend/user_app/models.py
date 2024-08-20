from django.contrib.auth.hashers import make_password
from django.conf import settings
from django.db import models

from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin


class User(AbstractBaseUser, PermissionsMixin):
    last_name = models.CharField(max_length=40, verbose_name="Last name")
    first_name = models.CharField(max_length=40, verbose_name="First name")
    email = models.EmailField(max_length=255, unique=True, verbose_name="Email")
    username = models.CharField(max_length=255, unique=True, verbose_name="User name")
    is_teacher = models.BooleanField(default=False, verbose_name="Is teacher")

    def set_password(self, raw_password):
        self.password = make_password(raw_password)
        self._password = raw_password

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["last_name", "first_name", "username"]


class Teacher(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    phone_number = models.CharField(max_length=20, null=True, verbose_name="Phone number")

    def __str__(self):
        return f"Teacher: {self.user.first_name} {self.user.last_name}."


class Student(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    school_class = models.ForeignKey("SchoolClass", verbose_name="School class", on_delete=models.CASCADE)
    authorized = models.BooleanField(default=False, verbose_name="Authorized")

    def __str__(self):
        return f"Student: {self.user.first_name} {self.user.last_name}."


class SchoolClass(models.Model):
    slug = models.SlugField(unique=True, verbose_name="Slug")
    title = models.CharField(max_length=2, verbose_name="Class")

    def __str__(self):
        return f"{self.title} class."
