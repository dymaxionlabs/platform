# Generated by Django 2.2.6 on 2020-01-22 14:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0034_userapikey'),
    ]

    operations = [
        migrations.AlterField(
            model_name='project',
            name='name',
            field=models.CharField(max_length=80, verbose_name='Name'),
        ),
    ]
