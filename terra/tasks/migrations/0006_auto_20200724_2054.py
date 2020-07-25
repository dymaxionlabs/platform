# Generated by Django 3.0.5 on 2020-07-24 20:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0005_auto_20200424_1949'),
    ]

    operations = [
        migrations.AlterField(
            model_name='task',
            name='state',
            field=models.CharField(choices=[('CANCELED', 'CANCELED'), ('FAILED', 'FAILED'), ('FINISHED', 'FINISHED'), ('PENDING', 'PENDING'), ('PROGRESS', 'PROGRESS'), ('STARTED', 'STARTED')], default='PENDING', max_length=50, verbose_name='state'),
        ),
    ]
