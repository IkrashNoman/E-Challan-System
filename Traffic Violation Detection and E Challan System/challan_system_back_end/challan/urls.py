from django.urls import path
from . import views

urlpatterns = [
    # RULES
    path("rules/add/", views.add_rule),
    path("rules/update/<int:rule_id>/", views.update_rule),
    path("rules/delete/<int:rule_id>/", views.delete_rule),
    path("rules/view/<int:rule_id>/", views.view_rule),
    path("rules/all/", views.list_rules),

    # CHALLAN
    path("create/", views.create_challan),
    path("update/<int:challan_id>/", views.update_challan),
    path("delete/<int:challan_id>/", views.delete_challan),
    path("view/<int:challan_id>/", views.view_challan),
    path("all/", views.list_challans),

    # APPEAL
    path("appeal/create/", views.raise_appeal),
    path("appeal/update/<int:appeal_id>/", views.edit_appeal),
    path("appeal/view/<int:appeal_id>/", views.view_appeal),
    path("appeal/all/", views.list_appeals),

    #Public
    path("public/search/", views.search_challans),
    path("public/pay/<int:challan_id>/", views.pay_challan),
    path("public/rules/", views.public_list_rules),
    path("my-challans/", views.my_challans),
]
