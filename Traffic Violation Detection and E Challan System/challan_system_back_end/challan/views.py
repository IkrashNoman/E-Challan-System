#challan/views.py
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from rest_framework import status
from .permissions import IsAdminOrOfficer, ReadOnlyForAuthenticated, IsOfficer, IsChallanOwner
from .models import Rule, Challan, Challenge
from .serializers import RuleSerializer, CreateChallanSerializer, CreateChallengeSerializer, ChallanSerializer, ChallengeSerializer
from officer.authentication import OfficerJWTAuthentication
from datetime import timedelta
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from officer.authentication import OfficerJWTAuthentication
from users.models import Bike, WebsiteUser
from django.db.models import Q
from rest_framework.permissions import AllowAny
from django.core.files.storage import default_storage #
from rest_framework.permissions import IsAuthenticated
from users.authentication import UserJWTAuthentication

# CREATE RULE
@api_view(["POST"])
@authentication_classes([OfficerJWTAuthentication]) # <--- ADD THIS
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
@authentication_classes([OfficerJWTAuthentication]) # <--- ADD THIS
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
@authentication_classes([OfficerJWTAuthentication]) # <--- ADD THIS
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
@authentication_classes([OfficerJWTAuthentication]) # <--- ADD THIS
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
@authentication_classes([OfficerJWTAuthentication]) # <--- ADD THIS
@permission_classes([ReadOnlyForAuthenticated])
def list_rules(request):
    rules = Rule.objects.all().order_by("-created_at")
    serializer = RuleSerializer(rules, many=True)
    return Response(serializer.data)

@api_view(["POST"])
@authentication_classes([OfficerJWTAuthentication])
@permission_classes([IsOfficer])
def create_challan(request):
    # 1. Get Data from Request
    # We expect 'bike_number' as a STRING from the frontend
    bike_number_input = request.data.get("bike_number") 
    rule_id = request.data.get("rule_id")
    
    # 2. Validate Inputs
    if not bike_number_input or not rule_id:
        return Response({"error": "Bike number and Rule ID are required"}, status=400)

    try:
        # 3. Fetch Related Objects
        # FIX: Use 'bike_number' field (matches your model) instead of 'number_plate'
        bike = Bike.objects.get(bike_number__iexact=bike_number_input)
        
        rule = Rule.objects.get(id=rule_id)
        officer = request.user 

        # 4. Determine Location (Area) from Officer
        if not officer.area:
            return Response({"error": "Officer is not assigned to any area"}, status=400)
        
        area = officer.area

        # 5. Calculate Logistics
        amount = rule.fine_amount
        due_date = timezone.now().date() + timedelta(days=14)

        # 6. Create the Challan
        challan = Challan.objects.create(
            bike=bike,
            rule=rule,
            officer=officer,
            area=area,
            amount_charged=amount,
            due_date=due_date,
            evidence_url="N/A" # We are not processing image on backend as requested
        )

        # 7. Extract User Info & Send Notifications
        website_user = bike.owner 
        
        if website_user:
            user_email = website_user.email
            
            # --- EMAIL LOGIC ---
            if user_email:
                # FIX: Use bike.bike_number here too
                subject = f"Traffic Violation Challan - {bike.bike_number}"
                message = (
                    f"Dear {website_user.full_name},\n\n"
                    f"You have been charged a fine of Rs. {amount} for '{rule.rule_name}'.\n"
                    f"Vehicle: {bike.bike_number}\n"
                    f"Location: {area.sub_area}\n"
                    f"Date: {timezone.now().date()}\n"
                    f"Due Date: {due_date}\n\n"
                    f"Please pay via the app/portal to avoid further penalties."
                )
                try:
                    send_mail(
                        subject, 
                        message, 
                        settings.EMAIL_HOST_USER, 
                        [user_email], 
                        fail_silently=False
                    )
                except Exception as e:
                    print(f"Email failed: {e}")

        serializer = CreateChallanSerializer(challan)
        return Response({
            "message": "Challan issued successfully",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)

    except Bike.DoesNotExist:
        return Response({"error": f"Bike {bike_number_input} not found in system"}, status=404)
    except Rule.DoesNotExist:
        return Response({"error": "Selected Rule does not exist"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(["PATCH"])
@authentication_classes([OfficerJWTAuthentication])
@permission_classes([IsOfficer])
def update_challan(request, challan_id):
    try:
        challan = Challan.objects.get(id=challan_id)
    except Challan.DoesNotExist:
        return Response({"error": "Challan not found"}, status=404)

    serializer = ChallanSerializer(challan, data=request.data, partial=True)
    
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Challan updated successfully", "data": serializer.data})
    
    return Response(serializer.errors, status=400)

@api_view(["DELETE"])
@authentication_classes([OfficerJWTAuthentication])
@permission_classes([IsOfficer])
def delete_challan(request, challan_id):
    try:
        challan = Challan.objects.get(id=challan_id)
    except Challan.DoesNotExist:
        return Response({"error": "Challan not found"}, status=404)

    challan.delete()
    return Response({"message": "Challan deleted successfully"})

@api_view(["GET"])
@authentication_classes([OfficerJWTAuthentication])
@permission_classes([ReadOnlyForAuthenticated])
def view_challan(request, challan_id):
    try:
        challan = Challan.objects.get(id=challan_id)
    except Challan.DoesNotExist:
        return Response({"error": "Challan not found"}, status=404)

    serializer = ChallanSerializer(challan)
    return Response(serializer.data)

@api_view(["GET"])
@authentication_classes([OfficerJWTAuthentication])
@permission_classes([ReadOnlyForAuthenticated])
def list_challans(request):
    challans = Challan.objects.all().order_by("-created_at")
    serializer = ChallanSerializer(challans, many=True)
    return Response(serializer.data)

@api_view(["GET"])
@permission_classes([AllowAny])
def search_challans(request):
    query = request.query_params.get("bike_number", "").strip()
    if not query:
        return Response({"error": "Bike number required"}, status=400)

    # 1. Check if the Bike exists in the system AT ALL
    # Using filter().exists() is faster than get() for checking existence
    if not Bike.objects.filter(bike_number__iexact=query).exists():
        # Return 404 so frontend knows to redirect
        return Response({"error": "Bike not registered"}, status=404)

    # 2. If Bike exists, fetch its challans
    challans = Challan.objects.filter(bike__bike_number__iexact=query).order_by("-challan_date")
    serializer = ChallanSerializer(challans, many=True)
    
    return Response(serializer.data)

# --- NEW PUBLIC PAY VIEW ---
@api_view(["POST"])
@permission_classes([AllowAny]) # Public access (anyone with valid challan ID)
def pay_challan(request, challan_id):
    try:
        challan = Challan.objects.get(id=challan_id)
    except Challan.DoesNotExist:
        return Response({"error": "Challan not found"}, status=404)

    if challan.status == "Paid":
        return Response({"message": "Challan is already paid"}, status=400)

    # Expecting an image file or URL in 'payment_proof'
    proof = request.data.get("payment_proof") 
    
    # In a real app, handle file upload here. 
    # For now, we assume a URL string or handle the file similarly to evidence_url
    if not proof:
        return Response({"error": "Payment proof image is required"}, status=400)

    challan.payment_proof = str(proof) # Save the proof
    challan.status = "Paid" # Or 'VerificationPending' if you have that status
    challan.payment_date = timezone.now()
    challan.save()

    return Response({"message": "Payment proof submitted. Status updated to Paid."})

@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny]) # <--- FIX: Allows Public/Anonymous Appeals
def raise_appeal(request):
    # 1. Handle Data
    data = request.data.copy() # Make mutable copy
    
    # 2. Handle File Upload manually (Since model has CharField, not FileField)
    evidence_file = request.FILES.get('evidence_url')
    if evidence_file:
        # Save file to media folder and get the path/url
        file_name = default_storage.save(f"appeals/{evidence_file.name}", evidence_file)
        file_url = default_storage.url(file_name)
        data['evidence_url'] = file_url # Save the string URL to data
    
    # 3. Initialize Serializer
    serializer = CreateChallengeSerializer(data=data)

    if serializer.is_valid():
        challan = serializer.validated_data["challan"]

        # Validation
        if challan.status == "UnderAppeal":
            return Response({"error": "Challan is already under appeal"}, status=400)

        # 4. Handle User Association (If logged in, link user. If not, anonymous)
        if request.user and request.user.is_authenticated:
            # Note: Ensure request.user matches the WebsiteUser model instance if using that
            # If request.user is Officer, this might fail unless Officer inherits properly.
            # For safety in this public view, we can leave user null or try/except
            try:
                serializer.save(user=request.user) 
            except:
                serializer.save(user=None)
        else:
            serializer.save(user=None) # Anonymous Appeal

        # 5. Update Challan Status
        challan.status = "UnderAppeal"
        challan.save()

        return Response({
            "message": "Appeal submitted successfully",
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

@api_view(["GET"])
@authentication_classes([OfficerJWTAuthentication])
@permission_classes([IsOfficer]) # Or IsAdminOrOfficer
def list_appeals(request):
    # Get all challenges, order by pending first
    appeals = Challenge.objects.all().order_by("status", "-submitted_at")
    serializer = ChallengeSerializer(appeals, many=True)
    return Response(serializer.data)

@api_view(["GET"])
@permission_classes([AllowAny]) # Allows Public Access
def public_list_rules(request):
    # Retrieve all rules, sorted by name
    rules = Rule.objects.all().order_by("rule_name")
    serializer = RuleSerializer(rules, many=True)
    return Response(serializer.data)

@api_view(["GET"])
@authentication_classes([UserJWTAuthentication]) # <--- CRITICAL FIX: Use User Auth
@permission_classes([IsAuthenticated])
def my_challans(request):
    try:
        user = request.user
        
        # Filter challans where the bike's owner is linked to this website user
        # Relationship: Challan -> Bike -> Owner(Citizen) -> WebsiteUser
        challans = Challan.objects.filter(bike__owner__website_user=user).order_by("-challan_date")
        
        serializer = ChallanSerializer(challans, many=True)
        return Response(serializer.data)
        
    except Exception as e:
        return Response({"error": str(e)}, status=500)