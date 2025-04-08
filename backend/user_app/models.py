from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, UserManager
from django.contrib.auth.hashers import make_password, check_password
from django.core.validators import RegexValidator
from django.utils.text import slugify
from django.conf import settings
from django.db.models import Q
from django.db import models


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
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name="User")
    phone_number = models.CharField(max_length=20, null=True, verbose_name="Phone number")
    secret_key = models.CharField(max_length=40, verbose_name="Secret Key")

    def __str__(self):
        return f"Teacher: {self.user.first_name} {self.user.last_name}."


class TeacherSecretKey(models.Model):
    key = models.CharField(max_length=128, unique=True, verbose_name="Secret Key")
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

    def check_key(self, raw_key):
        return check_password(raw_key, self.secret_key)

    def set_key(self, raw_key):
        self.secret_key = make_password(raw_key)

    def __str__(self):
        return f"Teacher Secret Key: (logged: {self.logged})."


class Student(models.Model):
    school_class = models.ForeignKey("SchoolClass", on_delete=models.CASCADE, verbose_name="School class")
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name="User")
    authorized = models.BooleanField(default=False, verbose_name="Authorized")

    def __str__(self):
        return f"Student: {self.user.first_name} {self.user.last_name}."


class SchoolClass(models.Model):
    title = models.CharField(max_length=3, db_index=True, verbose_name="Class")
    slug = models.SlugField(unique=True, verbose_name="Slug")

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class SchoolSubject(models.Model):
    teachers = models.ManyToManyField(Teacher, related_name="subjects", blank=True, verbose_name="Assigned Teachers")
    title = models.CharField(max_length=3, validators=[
        RegexValidator(
            regex=r'^\d{1,2}[A-Я]$',
            message="Class must be in format '10A'"
        )
    ], db_index=True, verbose_name="Subject")

    def __str__(self):
        return self.title
