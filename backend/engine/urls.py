from django.urls import path
from . import views

urlpatterns = [
    path("", views.landing_page, name="landing"),
    path("auth/signup/", views.signup, name="signup"),
    path("auth/login/", views.login_view, name="login"),
    
    path("me/", views.me, name="me"),
    path("assessment/submit/", views.submit_assessment, name="submit-assessment"),
    path("dashboard/data/", views.dashboard_data, name="dashboard-data"),
    path("landing/stats/", views.landing_stats, name="landing-stats"),
]