# Generated by Django 3.0.5 on 2021-03-29 14:59

from django.db import migrations


def add_dashboard_from_redash_dashboard_url(apps, schema_editor):
    Project = apps.get_model("projects", "project")
    Dashboard = apps.get_model("projects", "dashboard")
    for project in Project.objects.all():
        if project.redash_dashboard_url:
            Dashboard.objects.get_or_create(
                project=project, url=project.redash_dashboard_url, name="Default"
            )


class Migration(migrations.Migration):

    dependencies = [
        ("projects", "0054_project_dashboards_module"),
    ]

    operations = [
        migrations.RunPython(
            add_dashboard_from_redash_dashboard_url, migrations.RunPython.noop
        ),
    ]
