# Generated by Django 3.0.5 on 2020-08-05 14:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0015_delete_tasks_with_no_name'),
    ]

    operations = [
        migrations.AlterField(
            model_name='task',
            name='name',
            field=models.CharField(max_length=255, verbose_name='name'),
        ),
    ]
