# users/authentication.py

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed
from rest_framework_simplejwt.settings import api_settings
from .models import WebsiteUser
from django.utils.translation import gettext_lazy as _

class UserJWTAuthentication(JWTAuthentication):
    """
    Custom Authentication to force SimpleJWT to look up users in the WebsiteUser model.
    """
    def get_user(self, validated_token):
        try:
            # 1. Attempt to get user_id from token
            user_id = validated_token.get(api_settings.USER_ID_CLAIM)
            if not user_id:
                 # Fallback: sometimes the claim is just 'id' depending on settings
                 user_id = validated_token.get('id')
            
            if not user_id:
                raise InvalidToken(_("Token contained no recognizable user identification"))

        except KeyError:
            raise InvalidToken(_("Token contained no recognizable user identification"))

        try:
            # 2. Look up the user
            user = WebsiteUser.objects.get(user_id=user_id)
        except WebsiteUser.DoesNotExist:
            raise AuthenticationFailed(_("User not found"), code="user_not_found")

        return user