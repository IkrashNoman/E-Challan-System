#challan/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from .permissions import IsAdminOrOfficer, ReadOnlyForAuthenticated, IsOfficer, IsChallanOwner
from .models import Rule, Challan, Challenge
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


@api_view(["POST"])
@permission_classes([IsOfficer])
def create_challan(request):
    serializer = CreateChallanSerializer(data=request.data)
    if serializer.is_valid():
        challan = serializer.save()

        return Response({
            "message": "Challan created successfully",
            "challan_id": challan.id
        }, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["PATCH"])
@permission_classes([IsOfficer])
def update_challan(request, challan_id):
    try:
        challan = Challan.objects.get(id=challan_id)
    except Challan.DoesNotExist:
        return Response({"error": "Challan not found"}, status=404)

    serializer = CreateChallanSerializer(challan, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Challan updated successfully"})
    return Response(serializer.errors, status=400)

@api_view(["DELETE"])
@permission_classes([IsOfficer])
def delete_challan(request, challan_id):
    try:
        challan = Challan.objects.get(id=challan_id)
    except Challan.DoesNotExist:
        return Response({"error": "Challan not found"}, status=404)

    challan.delete()
    return Response({"message": "Challan deleted successfully"})

@api_view(["GET"])
@permission_classes([ReadOnlyForAuthenticated])
def view_challan(request, challan_id):
    try:
        challan = Challan.objects.get(id=challan_id)
    except Challan.DoesNotExist:
        return Response({"error": "Challan not found"}, status=404)

    serializer = ChallanSerializer(challan)
    return Response(serializer.data)

@api_view(["GET"])
@permission_classes([ReadOnlyForAuthenticated])
def list_challans(request):
    challans = Challan.objects.all().order_by("-created_at")
    serializer = ChallanSerializer(challans, many=True)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsChallanOwner])
def raise_appeal(request):
    serializer = CreateChallengeSerializer(data=request.data)

    if serializer.is_valid():
        challan = serializer.validated_data["challan"]

        # challan cannot already be under appeal
        if challan.status == "UnderAppeal":
            return Response({"error": "Challan is already under appeal"}, status=400)

        challan.status = "UnderAppeal"
        challan.save()

        appeal = serializer.save()

        return Response({
            "message": "Appeal submitted successfully",
            "appeal_id": appeal.id
        }, status=201)

    return Response(serializer.errors, status=400)


@api_view(["PATCH"])
@permission_classes([IsChallanOwner])
def edit_appeal(request, appeal_id):
    try:
        appeal = Challenge.objects.get(id=appeal_id)
    except Challenge.DoesNotExist:
        return Response({"error": "Appeal not found"}, status=404)

    # Only pending appeals can be edited
    if appeal.status != "Pending":
        return Response({"error": "Only pending appeals can be edited"}, status=400)

    serializer = CreateChallengeSerializer(appeal, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Appeal updated successfully"})
    return Response(serializer.errors, status=400)


@api_view(["GET"])
@permission_classes([ReadOnlyForAuthenticated])
def view_appeal(request, appeal_id):
    try:
        appeal = Challenge.objects.get(id=appeal_id)
    except Challenge.DoesNotExist:
        return Response({"error": "Appeal not found"}, status=404)

    serializer = ChallengeSerializer(appeal)
    return Response(serializer.data)

