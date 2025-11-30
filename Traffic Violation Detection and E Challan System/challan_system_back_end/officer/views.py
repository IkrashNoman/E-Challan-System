#officer/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.hashers import check_password
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Officer, Area
from .serializers import (
    OfficerSerializer,
    CreateOfficerSerializer,
    OfficerLoginSerializer,
    AreaSerializer
)
from .permissions import IsHighRank, IsOfficerLoggedIn


def generate_officer_tokens(officer):
    """Generate JWT tokens for officer."""
    refresh = RefreshToken.for_user(officer)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token)
    }

# ------------------------------------------------------------
# LIST DATA (NEW)
# ------------------------------------------------------------
@api_view(["GET"])
def get_all_officers(request):
    # In production, you might want to restrict this to admins only
    officers = Officer.objects.all().order_by("-created_at")
    serializer = OfficerSerializer(officers, many=True)
    return Response(serializer.data)

@api_view(["GET"])
def get_all_areas(request):
    areas = Area.objects.all()
    serializer = AreaSerializer(areas, many=True)
    return Response(serializer.data)

# ------------------------------------------------------------
# CREATE OFFICER
# ------------------------------------------------------------
@api_view(["POST"])
# @permission_classes([IsHighRank]) # Uncomment to enforce permission
def create_officer(request):
    serializer = CreateOfficerSerializer(data=request.data)
    if serializer.is_valid():
        officer = serializer.save()
        return Response({
            "message": "Officer created successfully",
            "officer_id": officer.id,
            "plain_password": officer.plain_password,
        }, status=201)
    return Response(serializer.errors, status=400)


# ------------------------------------------------------------
# UPDATE OFFICER
# ------------------------------------------------------------
@api_view(["PATCH"])
# @permission_classes([IsHighRank])
def update_officer(request, officer_id):
    try:
        officer = Officer.objects.get(id=officer_id)
    except Officer.DoesNotExist:
        return Response({"error": "Officer not found"}, status=404)

    serializer = CreateOfficerSerializer(officer, data=request.data, partial=True)
    if serializer.is_valid():
        updated = serializer.save()
        return Response({"message": "Officer updated successfully"})
    return Response(serializer.errors, status=400)


# ------------------------------------------------------------
# DELETE OFFICER
# ------------------------------------------------------------
@api_view(["DELETE"])
# @permission_classes([IsHighRank])
def delete_officer(request, officer_id):
    try:
        officer = Officer.objects.get(id=officer_id)
    except Officer.DoesNotExist:
        return Response({"error": "Officer not found"}, status=404)

    officer.delete()

    return Response({"message": "Officer deleted successfully"}, status=200)


# ------------------------------------------------------------
# VIEW OFFICER
# ------------------------------------------------------------
@api_view(["GET"])
# @permission_classes([IsOfficerLoggedIn])
def view_officer(request, officer_id):
    try:
        officer = Officer.objects.get(id=officer_id)
    except Officer.DoesNotExist:
        return Response({"error": "Officer not found"}, status=404)

    serializer = OfficerSerializer(officer)
    return Response(serializer.data)


# ------------------------------------------------------------
# LOGIN OFFICER
# ------------------------------------------------------------
@api_view(["POST"])
def login_officer(request):
    serializer = OfficerLoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=400)

    email = serializer.validated_data["email"]
    password = serializer.validated_data["password"]

    try:
        officer = Officer.objects.get(email=email)
    except Officer.DoesNotExist:
        return Response({"error": "Invalid email/password"}, status=400)

    if not check_password(password, officer.password):
        return Response({"error": "Invalid email/password"}, status=400)

    tokens = generate_officer_tokens(officer)

    return Response({
        "message": "Login successful",
        "officer_id": officer.id,
        "rank": officer.rank,
        "name": officer.name,
        "tokens": tokens
    })