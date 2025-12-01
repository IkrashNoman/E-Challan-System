from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed
from rest_framework_simplejwt.settings import api_settings
from .models import Officer
from django.utils.translation import gettext_lazy as _

class OfficerJWTAuthentication(JWTAuthentication):
    """
    Custom Authentication to force SimpleJWT to look up users in the Officer model
    instead of the default Auth User model.
    """
    def get_user(self, validated_token):
        try:
            user_id = validated_token[api_settings.USER_ID_CLAIM]
        except KeyError:
            raise InvalidToken(_("Token contained no recognizable user identification"))

        try:
            # Explicitly look for the user in the Officer table
            user = Officer.objects.get(**{api_settings.USER_ID_FIELD: user_id})
        except Officer.DoesNotExist:
            raise AuthenticationFailed(_("User not found"), code="user_not_found")

        # Optional: Check if officer is active if your model has that field
        # if not user.is_active:
        #    raise AuthenticationFailed(_("User is inactive"), code="user_inactive")

        return user