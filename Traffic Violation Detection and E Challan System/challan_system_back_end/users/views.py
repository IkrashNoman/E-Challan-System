#users/views.py

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.hashers import check_password, make_password
from rest_framework_simplejwt.tokens import RefreshToken
from django.db import transaction

from .models import WebsiteUser, Citizen, Bike, UserBike, BikeDocument
from .serializers import (
    SignupSerializer, LoginSerializer, EditUserSerializer
)
from .permissions import IsAuthenticatedUser


def generate_tokens(user):
    refresh = RefreshToken()
    
    # Add user_id to the refresh token
    refresh["user_id"] = user.user_id

    # Get the access token from the refresh token
    access = refresh.access_token

    # CRITICAL: Manually add the user_id to the access token payload as well!
    access["user_id"] = user.user_id 

    return {
        "access": str(access),
        "refresh": str(refresh)
    }

# 1. SIGNUP
@api_view(["POST"])
def signup(request):
    serializer = SignupSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=400)

    # Extract validated data
    email = serializer.validated_data["email"]
    phone = serializer.validated_data["phone"]
    password = serializer.validated_data["password"]
    
    cnic = serializer.validated_data["cnic"]
    bike_reg_date = serializer.validated_data["bike_registration_date"]

    bike_number = serializer.validated_data["bike_number"]
    official_copy_url = serializer.validated_data["official_copy_url"]
    cnic_front_url = serializer.validated_data["cnic_front_url"]
    cnic_back_url = serializer.validated_data["cnic_back_url"]

    try:
        with transaction.atomic():
            # 1. Handle Citizen (The "Get or Create" Logic)
            # We check if the citizen exists. If so, we use them. If not, we create them.
            try:
                citizen = Citizen.objects.get(cnic=cnic)
                # Optional: Update email/phone on the citizen record if needed
                if not citizen.email:
                    citizen.email = email
                    citizen.save()
            except Citizen.DoesNotExist:
                citizen = Citizen.objects.create(
                    cnic=cnic,
                    email=email,
                    phone=phone,
                    full_name="User " + cnic, # Placeholder name until profile update
                    address="Unknown"
                )

            # 2. Check if this Citizen already has a Website Account
            if WebsiteUser.objects.filter(citizen=citizen).exists():
                return Response(
                    {"error": "An account is already registered with this CNIC. Please Login."}, 
                    status=400
                )

            # 3. Create WebsiteUser (The Account)
            user = WebsiteUser.objects.create(
                citizen=citizen,
                email=email,
                phone=phone,
                address="",
                password=make_password(password)
            )

            # 4. Handle Bike
            # Check if bike exists
            try:
                bike = Bike.objects.get(bike_number=bike_number)
                # If bike exists, ensure the registration date matches or handle conflict
            except Bike.DoesNotExist:
                bike = Bike.objects.create(
                    bike_number=bike_number,
                    registration_date=bike_reg_date,
                    owner=citizen 
                )

            # 5. Link User + Bike
            # Check if link already exists to prevent duplicate error
            if not UserBike.objects.filter(user=user, bike=bike).exists():
                UserBike.objects.create(
                    user=user,
                    bike=bike,
                    official_copy_url=official_copy_url
                )

            # 6. Save CNIC document copies
            # We use get_or_create to avoid duplicating documents for the same bike
            BikeDocument.objects.get_or_create(
                bike=bike, 
                document_type="FrontCopy", 
                defaults={"image_url": cnic_front_url}
            )
            BikeDocument.objects.get_or_create(
                bike=bike, 
                document_type="BackCopy", 
                defaults={"image_url": cnic_back_url}
            )

            return Response(
                {"message": "User created successfully"},
                status=201
            )

    except Exception as e:
        # Catch unexpected errors to prevent 500 crash without info
        return Response({"error": str(e)}, status=500)


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