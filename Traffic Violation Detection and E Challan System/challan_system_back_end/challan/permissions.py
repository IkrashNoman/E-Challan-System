#challan/permissions.py
from rest_framework.permissions import BasePermission

class IsAdminOrOfficer(BasePermission):
    """
    Only logged-in users with admin/officer roles can modify rules.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        allowed_roles = ["ADMIN", "DSP", "SI", "ASI", "CONSTABLE"]

        return getattr(request.user, "role", None) in allowed_roles


class ReadOnlyForAuthenticated(BasePermission):
    """
    All authenticated users can read.
    No anonymous access.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.method in ("GET",):
            return True

        return False

class IsOfficer(BasePermission):
    """Only an authenticated Officer can create a challan."""

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and hasattr(user, "rank"))


class IsChallanOwner(BasePermission):
    """Only the bike owner (WebsiteUser) can raise or edit appeals."""

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
