# Generated by Django 2.1.7 on 2019-03-18 18:28

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0026_rename_images_to_files'),
    ]

    operations = [
        migrations.AddField(
            model_name='layer',
            name='file',
            field=models.OneToOneField(null=True, on_delete=django.db.models.deletion.SET_NULL, to='projects.File'),
        ),
    ]