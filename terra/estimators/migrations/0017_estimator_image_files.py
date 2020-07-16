# Generated by Django 3.0.5 on 2020-05-21 20:34

import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('estimators', '0016_rename_estimator_image_files'),
    ]

    operations = [
        migrations.AddField(
            model_name='estimator',
            name='image_files',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.CharField(max_length=512), blank=True, default=list, size=None),
        ),
    ]