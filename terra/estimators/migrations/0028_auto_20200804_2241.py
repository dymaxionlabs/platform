# Generated by Django 3.0.5 on 2020-08-04 22:41

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('estimators', '0027_auto_20200706_1400'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='trainingjob',
            name='estimator',
        ),
        migrations.DeleteModel(
            name='PredictionJob',
        ),
        migrations.DeleteModel(
            name='TrainingJob',
        ),
    ]
