#officer/admin.py

from django.contrib import admin
from .models import Area, Officer

# Register Area model
@admin.register(Area)
class AreaAdmin(admin.ModelAdmin):
    list_display = ('city', 'zone', 'sub_area')
    search_fields = ('city', 'zone', 'sub_area')

# Register Officer model
@admin.register(Officer)
class OfficerAdmin(admin.ModelAdmin):
    list_display = ('name', 'rank', 'email', 'status', 'area', 'is_active', 'created_at')
    list_filter = ('rank', 'status', 'is_active', 'area')
    search_fields = ('name', 'email')
