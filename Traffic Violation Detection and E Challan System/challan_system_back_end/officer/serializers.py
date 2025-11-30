#officer/serializers.py
from rest_framework import serializers
from django.contrib.auth.hashers import check_password
from .models import Officer, Area

# --- NEW SERIALIZER ---
class AreaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Area
        fields = ["id", "city", "zone", "sub_area"]

class OfficerSerializer(serializers.ModelSerializer):
    """For viewing officer details."""
    # We can nest AreaSerializer to show full details in GET requests
    area_details = AreaSerializer(source='area', read_only=True)

    class Meta:
        model = Officer
        fields = [
            "id",
            "rank",
            "name",
            "profile_pic_url",
            "email",
            "area",          # The ID (for reference)
            "area_details",  # The Object (for display)
            "status",
            "plain_password",
            "created_at",
            "updated_at",
        ]

class CreateOfficerSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating officers."""
    class Meta:
        model = Officer
        fields = [
            "rank",
            "name",
            "email",
            "password",
            "area", # Expects Area ID
            "profile_pic_url",
            "status",
        ]

class OfficerLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()