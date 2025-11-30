#users/admin.py
from django.contrib import admin
from .models import Citizen, WebsiteUser, Bike, BikeDocument, UserBike

# Citizen
@admin.register(Citizen)
class CitizenAdmin(admin.ModelAdmin):
    list_display = ("full_name", "cnic", "email", "phone")
    search_fields = ("full_name", "cnic", "email")

# WebsiteUser
@admin.register(WebsiteUser)
class WebsiteUserAdmin(admin.ModelAdmin):
    list_display = ("email", "phone", "is_active", "created_at")
    search_fields = ("email", "phone")
    list_filter = ("is_active",)

# Bike
@admin.register(Bike)
class BikeAdmin(admin.ModelAdmin):
    list_display = ("bike_number", "owner", "registration_date")
    search_fields = ("bike_number", "owner__full_name")
    
# BikeDocument
@admin.register(BikeDocument)
class BikeDocumentAdmin(admin.ModelAdmin):
    list_display = ("bike", "document_type", "uploaded_at")
    search_fields = ("bike__bike_number", "document_type")
    list_filter = ("document_type",)

# UserBike
@admin.register(UserBike)
class UserBikeAdmin(admin.ModelAdmin):
    list_display = ("user", "bike", "verification_status", "is_primary")
    search_fields = ("user__email", "bike__bike_number")
    list_filter = ("verification_status", "is_primary")
