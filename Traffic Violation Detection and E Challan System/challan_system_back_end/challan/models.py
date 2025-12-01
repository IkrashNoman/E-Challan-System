# challan\models.py
from django.db import models
from django.utils import timezone
from users.models import Bike, WebsiteUser
from officer.models import Officer, Area


# -------------------------------------------------------
# Rule (Violation)
# -------------------------------------------------------
class Rule(models.Model):
    rule_name = models.CharField(max_length=200, unique=True)
    description = models.TextField()
    exemption = models.TextField(null=True, blank=True)
    fine_amount = models.DecimalField(max_digits=10, decimal_places=2)
    start_date = models.DateField()
    other_penalties = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.rule_name


# -------------------------------------------------------
# Challan
# -------------------------------------------------------
class Challan(models.Model):
    bike = models.ForeignKey(Bike, on_delete=models.CASCADE, related_name="challans")
    rule = models.ForeignKey(Rule, on_delete=models.CASCADE)
    officer = models.ForeignKey(Officer, on_delete=models.SET_NULL, null=True)
    area = models.ForeignKey(Area, on_delete=models.SET_NULL, null=True)

    challan_date = models.DateTimeField(default=timezone.now)

    STATUS_CHOICES = [
        ("Unpaid", "Unpaid"),
        ("Paid", "Paid"),
        ("Cancelled", "Cancelled"),
        ("UnderAppeal", "Under Appeal"),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Unpaid")

    due_date = models.DateField()
    payment_date = models.DateTimeField(null=True, blank=True)

    amount_charged = models.DecimalField(max_digits=10, decimal_places=2)

    evidence_url = models.CharField(max_length=255, null=True, blank=True)
    
    created_at = models.DateTimeField(default=timezone.now)
    is_active = models.BooleanField(default=True)
    payment_proof = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return f"Challan #{self.id}"


# -------------------------------------------------------
# Challenge (Appeal)
# -------------------------------------------------------
class Challenge(models.Model):
    challan = models.ForeignKey(Challan, on_delete=models.CASCADE, related_name="appeals")

    user = models.ForeignKey(WebsiteUser, on_delete=models.CASCADE, null=True, blank=True)
    reason = models.TextField()
    evidence_url = models.CharField(max_length=255, null=True, blank=True)

    STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("Approved", "Approved"),
        ("Rejected", "Rejected"),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Pending")

    submitted_at = models.DateTimeField(default=timezone.now)

    reviewed_by = models.ForeignKey(Officer, on_delete=models.SET_NULL, null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Challenge #{self.id} for Challan {self.challan.id}"
