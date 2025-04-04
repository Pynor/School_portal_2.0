from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, UserManager
from django.conf import settings
from django.db import models
from django.db.models import Q


class User(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=255, db_index=True, unique=True, verbose_name="User name")
    email = models.EmailField(max_length=255, db_index=True, blank=True, verbose_name="Email")
    first_name = models.CharField(max_length=40, verbose_name="First name")
    last_name = models.CharField(max_length=40, verbose_name="Last name")
    is_staff = models.BooleanField(default=False, verbose_name="Is staff")

    class Meta:
        indexes = [
            models.Index(fields=["email"], name="email_idx", condition=Q(email__isnull=False)),
            models.Index(fields=["username"], name="username_idx")
        ]

    objects = UserManager()

    REQUIRED_FIELDS = ["last_name", "first_name"]
    USERNAME_FIELD = "username"


class Teacher(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, verbose_name="User", on_delete=models.CASCADE)
    phone_number = models.CharField(max_length=20, null=True, verbose_name="Phone number")
    secret_key = models.CharField(max_length=40, verbose_name="Secret Key")

    def __str__(self):
        return f"Teacher: {self.user.first_name} {self.user.last_name}."


class TeacherSecretKey(models.Model):
    key = models.CharField(max_length=30, unique=True, verbose_name="Key")
    logged = models.BooleanField(default=False, verbose_name="Logged")

    class Meta:
        indexes = [
            models.Index(
                fields=["key", "logged"],
                name="active_key_idx",
                condition=Q(logged=False)
            ),
            models.Index(
                fields=["logged"],
                name="logged_idx",
                condition=Q(logged=False)
            )
        ]

    def __str__(self):
        return f"Teacher Secret Key: (logged: {self.logged})."

class Student(models.Model):
    school_class = models.ForeignKey("SchoolClass", verbose_name="School class", on_delete=models.CASCADE)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, verbose_name="User", on_delete=models.CASCADE)
    authorized = models.BooleanField(default=False, verbose_name="Authorized")

    def __str__(self):
        return f"Student: {self.user.first_name} {self.user.last_name}."


class SchoolClass(models.Model):
    title = models.CharField(max_length=3, verbose_name="Class", db_index=True)
    slug = models.SlugField(unique=True, verbose_name="Slug")

    def __str__(self):
        return self.title
