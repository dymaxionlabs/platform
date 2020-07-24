from django.db.models import Q
from guardian.shortcuts import get_objects_for_user

from .models import Project


def allowed_projects_for(project_queryset, user):
    if user.is_staff:
        return project_queryset.all()
    elif not user.is_anonymous:
        # NOTE groups condition is deprecated
        cond = Q(owners=user) | Q(groups__user=user)
        return (project_queryset.filter(cond)
                | get_objects_for_user(
                    user, 'projects.view_project')).distinct().all()


class ProjectRelatedModelListMixin:
    def get_queryset(self):
        user = self.request.user

        if user.is_anonymous:
            return self.queryset.none()

        # Filter by request project (i.e. when using API keys)
        if hasattr(self.request, 'project'):
            return self.queryset.filter(project=self.request.project).all()

        # Filter by project uuid, if present
        projects_qs = allowed_projects_for(Project.objects, user)
        project_uuid = self.request.query_params.get('project', None)
        if project_uuid is not None:
            project = projects_qs.filter(uuid=project_uuid).first()
            return self.queryset.filter(project=project).all()

        return self.queryset.filter(project__in=projects_qs).distinct().all()
