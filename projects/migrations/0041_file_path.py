# Generated by Django 2.2.6 on 2020-04-17 16:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0040_add_project_fk_to_userapikeys'),
    ]

    operations = [
        migrations.AddField(
            model_name='file',
            name='path',
            field=models.CharField(default='', max_length=512),
        ),
    ]
