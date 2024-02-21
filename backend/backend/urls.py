"""backend URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin

# urls.py
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from backend.leaderboard.views import (
    BlastAddressViewSet,
    LeaderboardView,
    update_top_endpoint,
)

router = DefaultRouter()
router.register(r"blastaddress", BlastAddressViewSet)


urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include(router.urls)),
    path("leaderboard/", LeaderboardView.as_view(), name="leaderboard"),
    path("update_top/", update_top_endpoint, name="update_top"),
]
