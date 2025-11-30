#users/views.py

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.hashers import check_password, make_password
from rest_framework_simplejwt.tokens import RefreshToken

from .models import WebsiteUser, Citizen, Bike, UserBike, BikeDocument
from .serializers import (
    SignupSerializer, LoginSerializer, EditUserSerializer
)
from .permissions import IsAuthenticatedUser


def generate_tokens(user):
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh)
    }


# 1. SIGNUP
@api_view(["POST"])
def signup(request):
    serializer = SignupSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=400)

    email = serializer.validated_data["email"]
    phone = serializer.validated_data["phone"]
    password = serializer.validated_data["password"]

    bike_number = serializer.validated_data["bike_number"]
    official_copy_url = serializer.validated_data["official_copy_url"]
    cnic_front_url = serializer.validated_data["cnic_front_url"]
    cnic_back_url = serializer.validated_data["cnic_back_url"]

    # Create Citizen
    citizen = Citizen.objects.create(
        email=email,
        phone=phone
    )

    # Create WebsiteUser
    user = WebsiteUser.objects.create(
        citizen=citizen,
        email=email,
        phone=phone,
        address="",
        password=make_password(password)
    )

    # Create Bike
    bike = Bike.objects.create(
        bike_number=bike_number
    )

    # Link User + Bike
    UserBike.objects.create(
        user=user,
        bike=bike,
        official_copy_url=official_copy_url
    )

    # Save CNIC document copies
    BikeDocument.objects.create(bike=bike, document_type="FrontCopy", image_url=cnic_front_url)
    BikeDocument.objects.create(bike=bike, document_type="BackCopy", image_url=cnic_back_url)

    return Response(
        {"message": "User created successfully"},
        status=201
    )


# 2. LOGIN
@api_view(["POST"])
def login(request):
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=400)

    email = serializer.validated_data["email"]
    password = serializer.validated_data["password"]

    try:
        user = WebsiteUser.objects.get(email=email)
    except WebsiteUser.DoesNotExist:
        return Response({"error": "Invalid credentials"}, status=400)

    if not check_password(password, user.password):
        return Response({"error": "Invalid credentials"}, status=400)

    tokens = generate_tokens(user)

    return Response({
        "message": "Login successful",
        "user_id": user.user_id,
        "email": user.email,
        "tokens": tokens
    })


# 3. SHOW USER NAME
@api_view(["GET"])
@permission_classes([IsAuthenticatedUser])
def get_user_info(request):
    user = request.user
    return Response({
        "email": user.email,
        "phone": user.phone
    })


# 4. EDIT USER DETAILS
@api_view(["PATCH"])
@permission_classes([IsAuthenticatedUser])
def edit_user(request):
    user = request.user
    serializer = EditUserSerializer(user, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Profile updated"})
    return Response(serializer.errors, status=400)


# 5. DELETE USER ACCOUNT
@api_view(["DELETE"])
@permission_classes([IsAuthenticatedUser])
def delete_user(request):
    user = request.user
    user.delete()
    return Response({"message": "Account deleted"}, status=200)
