#officer/permissions.py
from rest_framework.permissions import BasePermission


class IsHighRank(BasePermission):
    """
    Only Inspector and SI can create, update or delete officers.
    """

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        allowed = ["Inspector", "SI"]

        return getattr(user, "rank", None) in allowed


class IsOfficerLoggedIn(BasePermission):
    """
    Any logged-in officer can view.
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
