# Generated by Django 3.0.5 on 2022-07-29 15:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('estimators', '0030_auto_20200907_0123'),
    ]

    operations = [
        migrations.AlterField(
            model_name='estimator',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True),
        ),
        migrations.AlterField(
            model_name='estimator',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
    ]
