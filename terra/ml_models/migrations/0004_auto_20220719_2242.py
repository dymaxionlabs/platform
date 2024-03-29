# Generated by Django 3.0.5 on 2022-07-19 22:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ml_models', '0003_auto_20220718_1839'),
    ]

    operations = [
        migrations.AlterField(
            model_name='mlmodel',
            name='description',
            field=models.TextField(blank=True, null=True, verbose_name='description'),
        ),
        migrations.AlterField(
            model_name='mlmodel',
            name='repo_url',
            field=models.URLField(blank=True, null=True, verbose_name='git repository url'),
        ),
        migrations.AlterField(
            model_name='mlmodelversion',
            name='description',
            field=models.TextField(blank=True, null=True, verbose_name='description'),
        ),
    ]
