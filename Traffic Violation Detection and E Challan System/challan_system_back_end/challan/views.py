#challan/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from .permissions import IsAdminOrOfficer, ReadOnlyForAuthenticated
from .models import Rule
from .serializers import RuleSerializer


# CREATE RULE
@api_view(["POST"])
@permission_classes([IsAdminOrOfficer])
def add_rule(request):
    serializer = RuleSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(
            {"message": "Rule created successfully", "data": serializer.data},
            status=status.HTTP_201_CREATED
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# UPDATE RULE
@api_view(["PUT", "PATCH"])
@permission_classes([IsAdminOrOfficer])
def update_rule(request, rule_id):
    try:
        rule = Rule.objects.get(id=rule_id)
    except Rule.DoesNotExist:
        return Response({"error": "Rule not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = RuleSerializer(rule, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Rule updated successfully", "data": serializer.data})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# DELETE RULE
@api_view(["DELETE"])
@permission_classes([IsAdminOrOfficer])
def delete_rule(request, rule_id):
    try:
        rule = Rule.objects.get(id=rule_id)
    except Rule.DoesNotExist:
        return Response({"error": "Rule not found"}, status=status.HTTP_404_NOT_FOUND)

    rule.delete()
    return Response({"message": "Rule deleted successfully"}, status=status.HTTP_200_OK)


# VIEW SINGLE RULE
@api_view(["GET"])
@permission_classes([ReadOnlyForAuthenticated])
def view_rule(request, rule_id):
    try:
        rule = Rule.objects.get(id=rule_id)
    except Rule.DoesNotExist:
        return Response({"error": "Rule not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = RuleSerializer(rule)
    return Response(serializer.data, status=status.HTTP_200_OK)


# VIEW ALL RULES
@api_view(["GET"])
@permission_classes([ReadOnlyForAuthenticated])
def list_rules(request):
    rules = Rule.objects.all().order_by("-created_at")
    serializer = RuleSerializer(rules, many=True)
    return Response(serializer.data)
