# backend/api/urls.py

from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import ItemViewSet, google_doc

router = DefaultRouter()
router.register(r"items", ItemViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path("google-doc/", google_doc),
]
