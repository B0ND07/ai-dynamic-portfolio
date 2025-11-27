from django.contrib.auth.backends import ModelBackend
from django.contrib.auth.models import User
from django.db.models import Q
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed


class EmailOrUsernameBackend(ModelBackend):
    """
    Custom authentication backend that allows users to log in with either
    their username or email address.
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        try:
            # Try to find user by username or email
            user = User.objects.get(Q(username=username) | Q(email=username))
        except User.DoesNotExist:
            return None
        except User.MultipleObjectsReturned:
            user = User.objects.filter(username=username).first()
        
        if user and user.check_password(password):
            return user
        return None


class OptionalJWTAuthentication(JWTAuthentication):
    """
    JWT Authentication that doesn't fail for AllowAny views.
    If the token is invalid, it simply returns None instead of raising an exception.
    This allows public endpoints to work even when an expired/invalid token is sent.
    """
    def authenticate(self, request):
        try:
            return super().authenticate(request)
        except AuthenticationFailed:
            return None
