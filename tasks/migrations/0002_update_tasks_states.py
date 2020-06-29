# Generated by Django 2.1.7 on 2019-03-27 11:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='taskresult',
            name='status',
            field=models.CharField(choices=[('FAILURE', 'FAILURE'), ('PENDING', 'PENDING'), ('PROGRESS', 'PROGRESS'), ('RECEIVED', 'RECEIVED'), ('RETRY', 'RETRY'), ('REVOKED', 'REVOKED'), ('STARTED', 'STARTED'), ('SUCCESS', 'SUCCESS')], default='PENDING', max_length=50, verbose_name='state'),
        ),
    ]
