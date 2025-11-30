#challan/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path("rules/add/", views.add_rule, name="add-rule"),
    path("rules/update/<int:rule_id>/", views.update_rule, name="update-rule"),
    path("rules/delete/<int:rule_id>/", views.delete_rule, name="delete-rule"),
    path("rules/view/<int:rule_id>/", views.view_rule, name="view-rule"),
    path("rules/all/", views.list_rules, name="list-rules"),
]