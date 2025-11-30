#challan/serializers.py
from rest_framework import serializers
from .models import Rule

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
