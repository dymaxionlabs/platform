# Generated by Django 2.1.7 on 2019-02-22 01:36

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0005_map'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='project',
            name='client',
        ),
        migrations.DeleteModel(
            name='Client',
        ),
    ]