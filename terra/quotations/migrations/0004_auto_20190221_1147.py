# Generated by Django 2.1.7 on 2019-02-21 11:47

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('quotations', '0003_auto_20190129_2106'),
    ]

    operations = [
        migrations.AlterField(
            model_name='quotationarea',
            name='quotation',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='areas', to='quotations.Quotation'),
        ),
    ]