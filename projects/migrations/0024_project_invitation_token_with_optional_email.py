# Generated by Django 2.1.7 on 2019-03-15 17:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0023_project_invitation_token'),
    ]

    operations = [
        migrations.AlterField(
            model_name='projectinvitationtoken',
            name='email',
            field=models.CharField(blank=True, default=None, max_length=75, verbose_name='Email'),
        ),
    ]
