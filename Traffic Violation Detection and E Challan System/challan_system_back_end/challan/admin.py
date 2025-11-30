#challan/admin.py

from django.contrib import admin
from .models import Rule, Challan, Challenge

# Rule model
@admin.register(Rule)
class RuleAdmin(admin.ModelAdmin):
    list_display = ('rule_name', 'fine_amount', 'start_date')
    search_fields = ('rule_name',)

# Challan model
@admin.register(Challan)
class ChallanAdmin(admin.ModelAdmin):
    list_display = ('id', 'bike', 'rule', 'officer', 'area', 'status', 'amount_charged', 'due_date')
    list_filter = ('status', 'officer', 'area')
    search_fields = ('bike__license_plate', 'officer__name')

# Challenge (Appeal) model
@admin.register(Challenge)
class ChallengeAdmin(admin.ModelAdmin):
    list_display = ('id', 'challan', 'user', 'status', 'submitted_at', 'reviewed_by')
    list_filter = ('status', 'reviewed_by')
    search_fields = ('user__name', 'challan__id')
