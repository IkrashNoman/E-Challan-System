#users/models.py

from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.utils import timezone
from django.core.validators import RegexValidator
from django.contrib.auth.hashers import make_password

# -------------------------------------------------------
# Citizen – real world identity
# -------------------------------------------------------
class Citizen(models.Model):
    cnic = models.CharField(
        max_length=15,
        primary_key=True,
        validators=[RegexValidator(r"^\d{5}-\d{7}-\d{1}$")],
    )
    full_name = models.CharField(max_length=100)
    dob = models.DateField(null=True, blank=True)
    address = models.TextField()
    email = models.EmailField(null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    def __str__(self):
        return f"{self.full_name} ({self.cnic})"


# -------------------------------------------------------
# User – website account (extend later when integrating auth)
# -------------------------------------------------------

class WebsiteUser(models.Model):
    user_id = models.AutoField(primary_key=True)

    citizen = models.OneToOneField(
        Citizen,
        on_delete=models.CASCADE,
        related_name="website_user"
    )

    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    address = models.TextField(null=True, blank=True)
    profile_pic_url = models.CharField(max_length=255, null=True, blank=True)
    password = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    # --- ADD THESE PROPERTIES ---
    @property
    def is_authenticated(self):
        """Required for DRF permissions to work"""
        return True

    @property
    def is_anonymous(self):
        return False

    def save(self, *args, **kwargs):
        if self.password and not self.password.startswith("pbkdf2_sha256$"):
            self.password = make_password(self.password)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.email

# -------------------------------------------------------
# Bike
# -------------------------------------------------------
class Bike(models.Model):
    bike_number = models.CharField(max_length=20, unique=True)
    owner = models.ForeignKey(Citizen, on_delete=models.CASCADE, related_name="bikes")
    registration_date = models.DateField()
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return self.bike_number


# -------------------------------------------------------
# Bike Documents
# -------------------------------------------------------
class BikeDocument(models.Model):
    bike = models.ForeignKey(Bike, on_delete=models.CASCADE, related_name="documents")

    DOCUMENT_TYPES = [
        ("FrontCopy", "Front Copy"),
        ("BackCopy", "Back Copy"),
        ("RegistrationCard", "Registration Card"),
        ("Other", "Other"),
    ]
    document_type = models.CharField(max_length=30, choices=DOCUMENT_TYPES)
    image_url = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.bike.bike_number} - {self.document_type}"


# -------------------------------------------------------
# User-Bike relationship
# -------------------------------------------------------
class UserBike(models.Model):
    user = models.ForeignKey(WebsiteUser, on_delete=models.CASCADE)
    bike = models.ForeignKey(Bike, on_delete=models.CASCADE)

    VERIFICATION_CHOICES = [
        ("Pending", "Pending"),
        ("Verified", "Verified"),
        ("Rejected", "Rejected"),
    ]
    verification_status = models.CharField(max_length=20, choices=VERIFICATION_CHOICES, default="Verified")

    official_copy_url = models.CharField(max_length=255, null=True, blank=True)
    is_primary = models.BooleanField(default=False)

    submitted_at = models.DateTimeField(default=timezone.now)
    verified_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.email} ↔ {self.bike.bike_number}"
