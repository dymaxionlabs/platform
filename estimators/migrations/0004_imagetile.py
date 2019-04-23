# Generated by Django 2.2 on 2019-04-23 15:13

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0030_allow_null_in_projects_groups_and_layers_file'),
        ('estimators', '0003_estimator_image_files'),
    ]

    operations = [
        migrations.CreateModel(
            name='ImageTile',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('x', models.IntegerField(default=0)),
                ('y', models.IntegerField(default=0)),
                ('file', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='projects.File', verbose_name='file')),
            ],
            options={
                'unique_together': {('file', 'x', 'y')},
            },
        ),
    ]
