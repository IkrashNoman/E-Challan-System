#challan/serializers.py
from rest_framework import serializers
from .models import Rule, Challan, Challenge

class RuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rule
        fields = [
            "id",
            "rule_name",
            "description",
            "exemption",
            "fine_amount",
            "start_date",
            "other_penalties",
            "created_at",
        ]

class ChallanSerializer(serializers.ModelSerializer):
    # Add this to get the actual text (e.g., "ABC-123") instead of ID
    bike_number = serializers.ReadOnlyField(source='bike.bike_number')
    rule_name = serializers.ReadOnlyField(source='rule.rule_name')

    class Meta:
        model = Challan
        fields = [
            "id",
            "bike",
            "bike_number", # Added
            "rule",
            "rule_name",   # Added
            "officer",
            "area",
            "challan_date",
            "status",
            "due_date",
            "payment_date",
            "amount_charged",
            "evidence_url",
            "created_at",
            "is_active",
        ]

class CreateChallanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Challan
        fields = [
            "id",
            "bike",
            "rule",
            "officer",
            "area",
            "due_date",
            "amount_charged",
            "evidence_url",
        ]
        read_only_fields = ["officer", "area", "amount_charged", "due_date"]

class ChallengeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Challenge
        fields = [
            "id",
            "challan",
            "user",
            "reason",
            "evidence_url",
            "status",
            "submitted_at",
            "reviewed_by",
            "reviewed_at",
        ]
        
class CreateChallengeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Challenge
        fields = [
            "challan",
            "user",
            "reason",
            "evidence_url",
        ]
        # Make fields optional/flexible
        extra_kwargs = {
            'user': {'required': False, 'allow_null': True},
            'evidence_url': {'required': False, 'allow_null': True}
        }
