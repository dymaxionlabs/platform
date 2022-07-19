# Generated by Django 3.0.5 on 2022-07-18 18:39

import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ml_models', '0002_auto_20220711_1921'),
    ]

    operations = [
        migrations.AddField(
            model_name='mlmodel',
            name='lf_project_id',
            field=models.CharField(default=1, max_length=123),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='mlmodel',
            name='tags',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.CharField(max_length=30), null=True, size=None, verbose_name='tags'),
        ),
    ]
