# urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BlastAddressViewSet

router = DefaultRouter()
router.register(r'blastaddress', BlastAddressViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
