# Generated by Django 2.2 on 2019-04-03 12:35

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('quotations', '0006_requeststateupdate'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='requeststateupdate',
            options={'ordering': ('created_at',)},
        ),
    ]
