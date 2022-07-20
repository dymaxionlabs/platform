# Generated by Django 3.0.5 on 2022-07-11 19:21

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('ml_models', '0001_initial'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='mlmodel',
            unique_together={('name', 'owner')},
        ),
        migrations.RemoveField(
            model_name='mlmodel',
            name='version',
        ),
        migrations.CreateModel(
            name='MLModelVersion',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, verbose_name='name')),
                ('description', models.TextField(verbose_name='description')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='created at')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='updated at')),
                ('model', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='ml_models.MLModel')),
            ],
            options={
                'unique_together': {('model', 'name')},
            },
        ),
    ]
