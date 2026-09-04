from django.urls import path

from backend.leaderboard import views

urlpatterns = [
    path("config", views.config, name="config"),
    path("leaderboard", views.leaderboard, name="leaderboard"),
    path("activity", views.activity, name="activity"),
    path("stats", views.stats, name="stats"),
    path("referrers", views.referrers, name="referrers"),
    path("players/<str:address>", views.player_detail, name="player-detail"),
    path(
        "players/<str:address>/referrals",
        views.player_referrals,
        name="player-referrals",
    ),
    path(
        "players/<str:address>/opens",
        views.player_opens,
        name="player-opens",
    ),
    path(
        "players/<str:address>/pending",
        views.player_pending,
        name="player-pending",
    ),
]
