from rest_framework.permissions import BasePermission

class IsAccountOwner(BasePermission):
    """
    Only the logged-in user can view or edit their data.
    Nobody else can view anything.
    """

    def has_object_permission(self, request, view, obj):
        return obj.user_id == request.user.user_id


class IsAuthenticatedUser(BasePermission):
    """
    Only logged-in users can access personal account functionality.
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
