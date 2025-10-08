# pothole_analyzer/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PotholeAnalysisViewSet

router = DefaultRouter()
router.register(r'analyses', PotholeAnalysisViewSet, basename='pothole-analysis')

urlpatterns = [
    path('api/', include(router.urls)),
]