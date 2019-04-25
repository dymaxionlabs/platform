# Generated by Django 2.2 on 2019-04-25 13:11

from django.db import migrations, models
import estimators.models


class Migration(migrations.Migration):

    dependencies = [
        ('estimators', '0006_imagetiles_add_window_columns'),
    ]

    operations = [
        migrations.AddField(
            model_name='imagetile',
            name='tile_file',
            field=models.FileField(default=None, upload_to=estimators.models.tile_images_path, verbose_name='image'),
            preserve_default=False,
        ),
    ]
