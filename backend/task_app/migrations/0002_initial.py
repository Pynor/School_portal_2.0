# Generated by Django 4.2.15 on 2025-04-04 16:00

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('user_app', '0001_initial'),
        ('task_app', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='tasklist',
            name='task_for',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='user_app.schoolclass', verbose_name='Task for'),
        ),
        migrations.AddField(
            model_name='task',
            name='task_list',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tasks', to='task_app.tasklist', verbose_name='List tasks'),
        ),
        migrations.AddField(
            model_name='answerlist',
            name='task_list',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='task_app.tasklist', verbose_name='Task list'),
        ),
        migrations.AddField(
            model_name='answerlist',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL, verbose_name='Student'),
        ),
        migrations.AddField(
            model_name='answer',
            name='answer_list',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='task_app.answerlist', verbose_name='List answers'),
        ),
        migrations.AddField(
            model_name='answer',
            name='task',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='task_app.task', verbose_name='Task'),
        ),
        migrations.AddIndex(
            model_name='tasklist',
            index=models.Index(fields=['task_for', 'is_archived'], name='task_app_ta_task_fo_17d402_idx'),
        ),
        migrations.AddIndex(
            model_name='tasklist',
            index=models.Index(fields=['status', 'is_archived'], name='task_app_ta_status_b05e64_idx'),
        ),
        migrations.AddConstraint(
            model_name='tasklist',
            constraint=models.CheckConstraint(check=models.Q(models.Q(('status', 'Active'), _negated=True), ('is_archived', False), _connector='OR'), name='active_task_list_not_archived'),
        ),
    ]
