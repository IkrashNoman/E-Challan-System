#officer/models.py
from django.db import models
from django.utils import timezone


class Area(models.Model):
    city = models.CharField(max_length=100)
    zone = models.CharField(max_length=100)
    sub_area = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.city} - {self.zone} - {self.sub_area}"


class Officer(models.Model):

    RANK_CHOICES = [
        ("Constable", "Constable"),
        ("Head Constable", "Head Constable"),
        ("ASI", "ASI"),
        ("SI", "SI"),
        ("Inspector", "Inspector"),
    ]

    rank = models.CharField(max_length=30, choices=RANK_CHOICES)
    name = models.CharField(max_length=100)
    profile_pic_url = models.CharField(max_length=255, null=True, blank=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)

    area = models.ForeignKey(Area, on_delete=models.SET_NULL, null=True)

    STATUS_CHOICES = [
        ("Active", "Active"),
        ("Leave", "Leave"),
        ("Inactive", "Inactive"),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Active")

    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.rank} {self.name}"
