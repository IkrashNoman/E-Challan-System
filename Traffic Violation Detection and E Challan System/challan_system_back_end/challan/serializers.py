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
    class Meta:
        model = Challan
        fields = [
            "id",
            "bike",
            "rule",
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
            "bike",
            "rule",
            "officer",
            "area",
            "due_date",
            "amount_charged",
            "evidence_url",
        ]


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
