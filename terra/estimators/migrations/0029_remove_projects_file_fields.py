# Generated by Django 3.0.5 on 2020-08-17 01:51

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('estimators', '0028_auto_20200804_2241'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='estimator',
            name='_image_files',
        ),
        migrations.RemoveField(
            model_name='imagetile',
            name='file',
        ),
    ]
