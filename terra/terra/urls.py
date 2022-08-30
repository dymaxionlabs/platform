"""terra URL Configuration

The `urls_list` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urls_list:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urls_list:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urls_list:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.conf.urls import url
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from ml_models.views import MLModelVersionViewSet, AllMLModelViewSet, MLModelViewSet
from projects.views import (
    ConfirmProjectInvitationView,
    ContactView,
    DashboardViewSet,
    LayerViewSet,
    MapViewSet,
    ProjectInvitationTokenViewSet,
    ProjectViewSet,
    SubscribeApiBetaView,
    SubscribeBetaView,
    TestAuthView,
    TestErrorView,
    TestTaskErrorView,
    UserAPIKeyViewSet,
    UserProfileViewSet,
    UserViewSet,
)
from rest_framework import permissions
from rest_framework_nested import routers
from stac.views import SearchView

from terra import views

router = routers.SimpleRouter()
router.register(r"users", UserViewSet)
router.register(r"user-profiles", UserProfileViewSet)
router.register(r"projects", ProjectViewSet)
router.register(r"layers", LayerViewSet)
router.register(r"maps", MapViewSet)
router.register(r"dashboards", DashboardViewSet)
router.register(r"projects/invitations", ProjectInvitationTokenViewSet)
router.register(r"models", AllMLModelViewSet)
mlmodels_users_router = routers.NestedSimpleRouter(router, r"users", lookup="user")
mlmodels_users_router.register(r"models", MLModelViewSet, basename="models")
mlmodels_models_router = routers.NestedSimpleRouter(
    mlmodels_users_router, r"models", lookup="model"
)
mlmodels_models_router.register(r"versions", MLModelVersionViewSet, basename="versions")

schema_view = get_schema_view(
    openapi.Info(
        title="Terra API",
        default_version="v1",
        description="This is the description of the API",
        terms_of_service="https://www.dymaxionlabs.com/terms/",
        contact=openapi.Contact(email="contact@dymaxionlabs.com"),
        license=openapi.License(name="Apache-2.0 License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

# Documentation
docs_urls = [
    url(
        r"^swagger(?P<format>\.json|\.yaml)$",
        schema_view.without_ui(cache_timeout=0),
        name="schema-json",
    ),
    url(
        r"^swagger/$",
        schema_view.with_ui("swagger", cache_timeout=0),
        name="schema-swagger-ui",
    ),
    url(
        r"^redoc/$", schema_view.with_ui("redoc", cache_timeout=0), name="schema-redoc"
    ),
]

api_urls = [
    # Authentication
    url(r"^auth/", include("rest_auth.urls")),
    url(r"^auth/registration/", include("rest_auth.registration.urls")),
    # Other custom views
    url(
        r"^projects/invitations/(?P<key>[^/]+)/confirm/?",
        ConfirmProjectInvitationView.as_view(),
    ),
    url(r"^contact/?", ContactView.as_view()),
    url(r"^subscribe/beta/?", SubscribeBetaView.as_view()),
    url(r"^subscribe/api_beta/?", SubscribeApiBetaView.as_view()),
    url(
        r"^api_keys/(?P<prefix>[^/]+)$",
        UserAPIKeyViewSet.as_view(),
    ),
    url(
        r"^api_keys/",
        UserAPIKeyViewSet.as_view(),
    ),
    # STAC urls
    url(r"^stac/search/?", SearchView.as_view()),
    # Test views
    url(r"^test/auth/?", TestAuthView.as_view()),
    url(r"^test/error/?", TestErrorView.as_view()),
    url(r"^test/taskerror/?", TestTaskErrorView.as_view()),
    # ...
    url(r"^ping/?", views.ping),
    path(r"", include(router.urls)),
    path(r"", include(mlmodels_users_router.urls)),
    path(r"", include(mlmodels_models_router.urls)),
]

api_urls += docs_urls
api_urls += [path("storage/", include("storage.urls"))]
api_urls += [path("tasks/", include("tasks.urls"))]
api_urls += [path("estimators/", include("estimators.urls"))]
api_urls += [path("credits/", include("credits.urls"))]
api_urls += [path("quotas/", include("quotas.urls"))]

urlpatterns = [
    path("", views.index),
    path("v1/", include(api_urls)),
    url(r"^admin/", admin.site.urls),
]
urlpatterns += [path("admin/django-rq/", include("django_rq.urls"))]
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)