# Generated by Django 3.0.5 on 2021-03-03 18:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0050_project_redash_dashboard_url'),
    ]

    operations = [
        migrations.AddField(
            model_name='layer',
            name='use_cog_tiles',
            field=models.BooleanField(default=False),
        ),
    ]