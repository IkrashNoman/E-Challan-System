from django.urls import path
from . import views

urlpatterns = [
    # New List Endpoints
    path("list/", views.get_all_officers),
    path("areas/", views.get_all_areas),
    
    # Existing CRUD
    path("create/", views.create_officer),
    path("update/<int:officer_id>/", views.update_officer),
    path("delete/<int:officer_id>/", views.delete_officer),
    path("view/<int:officer_id>/", views.view_officer),
    path("login/", views.login_officer),
]