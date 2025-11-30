#users/serializers.py

from rest_framework import serializers
from django.contrib.auth.hashers import check_password, make_password
from .models import WebsiteUser, UserBike, Bike, BikeDocument, Citizen

class SignupSerializer(serializers.Serializer):
    email = serializers.EmailField()
    phone = serializers.CharField()
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    bike_number = serializers.CharField()
    official_copy_url = serializers.CharField()       # File upload later
    cnic_front_url = serializers.CharField()
    cnic_back_url = serializers.CharField()

    def validate(self, data):
        if data["password"] != data["confirm_password"]:
            raise serializers.ValidationError("Passwords do not match.")
        return data


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class EditUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = WebsiteUser
        fields = ["phone", "address", "profile_pic_url"]
