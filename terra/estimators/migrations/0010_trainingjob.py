# Generated by Django 2.2.1 on 2019-06-03 11:37

import django.contrib.postgres.fields.jsonb
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('estimators', '0009_imagetile_index'),
    ]

    operations = [
        migrations.CreateModel(
            name='TrainingJob',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='created at')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='updated at')),
                ('metadata', django.contrib.postgres.fields.jsonb.JSONField(blank=True, null=True)),
                ('finished', models.BooleanField(default=False)),
                ('estimator', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='estimators.Estimator', verbose_name='estimator')),
            ],
        ),
    ]