from django.urls import path

from backend.leaderboard import views

urlpatterns = [
    path("config", views.config, name="config"),
    path("leaderboard", views.leaderboard, name="leaderboard"),
    path("players/<str:address>", views.player_detail, name="player-detail"),
    path(
        "players/<str:address>/referrals",
        views.player_referrals,
        name="player-referrals",
    ),
    path(
        "players/<str:address>/pending",
        views.player_pending,
        name="player-pending",
    ),
]
