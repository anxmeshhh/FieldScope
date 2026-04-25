from django.urls import path
from engine import views

urlpatterns = [
    path("", views.landing_page, name="landing"),
    path("auth/signup/", views.signup, name="signup"),
    path("auth/login/", views.login_view, name="login"),

    path("me/", views.me, name="me"),
    path("assessment/submit/", views.submit_assessment, name="submit-assessment"),
    path("dashboard/data/", views.dashboard_data, name="dashboard-data"),
    path("landing/stats/", views.landing_stats, name="landing-stats"),

    path("roadmap/generate/",        views.generate_roadmap),
    path("roadmap/tasks/",      views.get_task_progress),
    path("roadmap/tasks/save/", views.save_task_progress),

    path("recommendations/",         views.get_recommendations),
    path("assessments/history/",     views.assessment_history),

    path("industries/",              views.get_industries),
    path("industries/personalized/", views.get_personalized_industries),
    path("industries/refresh/",      views.refresh_personalized_industries),

    path("industries/<slug:slug>/",         views.get_industry_detail),
    path("industries/<slug:slug>/refresh/", views.refresh_industry_detail),
]