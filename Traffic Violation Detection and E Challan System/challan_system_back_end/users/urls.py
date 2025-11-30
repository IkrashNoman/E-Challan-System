#users/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path("signup/", views.signup),
    path("login/", views.login),
    path("me/", views.get_user_info),
    path("edit/", views.edit_user),
    path("delete/", views.delete_user),
]