# Generated by Django 2.1.3 on 2018-11-30 17:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='layer',
            name='slug',
            field=models.SlugField(default='smap'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='project',
            name='slug',
            field=models.SlugField(default='bayer-flood'),
            preserve_default=False,
        ),
    ]