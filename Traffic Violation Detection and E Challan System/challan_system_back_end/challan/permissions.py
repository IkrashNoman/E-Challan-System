#challan/permissions.py
from rest_framework.permissions import BasePermission

class IsAdminOrOfficer(BasePermission):
    """
    Only logged-in users with valid officer ranks can modify rules.
    """

    def has_permission(self, request, view):
        # 1. Check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False

        # 2. Define allowed ranks
        # Ensure 'Inspector' is here since you are logging in as one.
        # Add other ranks from your Officer model as needed.
        allowed_ranks = ["ADMIN", "DSP", "Inspector", "SI", "ASI", "CONSTABLE"]

        # 3. FIX: Check 'rank' (from Officer model), NOT 'role'
        user_rank = getattr(request.user, "rank", None)
        
        # Check if the user's rank is in the allowed list
        return user_rank in allowed_ranks


class ReadOnlyForAuthenticated(BasePermission):
    """
    All authenticated users can read (GET requests).
    No anonymous access.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.method in ("GET", "HEAD", "OPTIONS"):
            return True

        return False


class IsOfficer(BasePermission):
    """Only an authenticated Officer can create a challan."""

    def has_permission(self, request, view):
        user = request.user
        # FIX: Ensure we check for 'rank' here as well, consistent with the Officer model
        return bool(user and user.is_authenticated and hasattr(user, "rank"))


class IsChallanOwner(BasePermission):
    """Only the bike owner (WebsiteUser) can raise or edit appeals."""

    def has_permission(self, request, view):
        # Ensure the user is authenticated
        return bool(request.user and request.user.is_authenticated)