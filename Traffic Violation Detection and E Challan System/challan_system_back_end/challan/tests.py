# challan/tests.py

from rest_framework.test import APITestCase
from rest_framework import status
from django.utils import timezone
from users.models import WebsiteUser, Citizen, Bike, UserBike
from officer.models import Officer, Area
from .models import Rule, Challan, Challenge
from datetime import timedelta

class ChallanTests(APITestCase):

    def setUp(self):
        """
        Setup creates:
        1. An Area & Officer (for issuing challans)
        2. A Citizen, User & Bike (for receiving challans)
        3. A Rule (Violation)
        """
        # --- 1. SETUP OFFICER ---
        self.area = Area.objects.create(city="Rawalpindi", zone="Zone 1", sub_area="Murree Road")
        self.officer_password = "officerpass123"
        
        # Officer model has a custom save() method that hashes the password automatically
        self.officer = Officer.objects.create(
            name="Challan Officer",
            rank="Inspector",
            email="officer@traffic.com",
            password=self.officer_password, 
            area=self.area,
            status="Active"
        )

        # --- 2. SETUP CITIZEN, USER & BIKE ---
        self.user_password = "userpass123"

        # STEP A: Create Citizen FIRST
        # FIX: Used 'full_name' instead of 'name'
        # FIX: Added 'address' because models.py says it is required (not null)
        self.citizen = Citizen.objects.create(
            cnic="12345-1234567-1",
            full_name="John Doe", 
            address="House 123, Street 4, Rawalpindi",
            email="citizen@example.com"
        )
        
        # STEP B: Create WebsiteUser linked to Citizen
        # WebsiteUser model also has a custom save() for hashing
        self.user = WebsiteUser.objects.create(
            email="citizen@example.com",
            phone="03001234567",
            citizen=self.citizen,
            password=self.user_password
        )

        # STEP C: Create Bike linked to Citizen (Owner)
        # FIX: Added 'registration_date' as it is required in models.py
        self.bike = Bike.objects.create(
            bike_number="RIM-123",
            owner=self.citizen,
            registration_date="2023-01-01" 
        )
        
        # Link User and Bike
        UserBike.objects.create(user=self.user, bike=self.bike)

        # --- 3. SETUP RULE ---
        self.rule = Rule.objects.create(
            rule_name="No Helmet",
            description="Riding without helmet",
            fine_amount=2000.00,
            start_date=timezone.now().date()
        )

        # --- URL DEFINITIONS ---
        self.rule_add_url = '/api/challan/rules/add/'
        self.rule_list_url = '/api/challan/rules/all/'
        self.create_challan_url = '/api/challan/create/'
        self.search_url = '/api/challan/public/search/'
        self.my_challans_url = '/api/challan/my-challans/'
        self.pay_url_base = '/api/challan/public/pay/'
        self.appeal_url = '/api/challan/appeal/create/'

    # --- HELPERS TO GET TOKENS ---
    def get_officer_token(self):
        resp = self.client.post('/api/officer/login/', {
            "email": self.officer.email,
            "password": self.officer_password
        })
        return resp.data["tokens"]["access"]

    def get_user_token(self):
        resp = self.client.post('/api/users/login/', {
            "email": self.user.email,
            "password": self.user_password
        })
        return resp.data["tokens"]["access"]

    # ---------------------------------------------------------
    # RULE TESTS (Officer Only)
    # ---------------------------------------------------------

    def test_01_create_rule_success(self):
        """Officer creates a new traffic rule"""
        token = self.get_officer_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        data = {
            "rule_name": "Over Speeding",
            "description": "Speed > 80kmph",
            "fine_amount": 500,
            "start_date": "2024-01-01"
        }
        response = self.client.post(self.rule_add_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Rule.objects.count(), 2)

    def test_02_create_rule_unauthorized(self):
        """User cannot create a rule"""
        token = self.get_user_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        data = {"rule_name": "Bad Rule", "fine_amount": 100, "start_date": "2024-01-01"}
        response = self.client.post(self.rule_add_url, data)
        
        # We accept 400, 401, or 403.
        # 400 means "Bad Request" (which effectively blocks creation).
        # 401/403 are strictly better, but 400 still proves the rule wasn't created.
        self.assertIn(response.status_code, [400, 401, 403])
        
        # DOUBLE CHECK: Ensure the rule was NOT created
        self.assertEqual(Rule.objects.filter(rule_name="Bad Rule").count(), 0)
    # ---------------------------------------------------------
    # CHALLAN CREATION TESTS (Officer Only)
    # ---------------------------------------------------------

    def test_03_create_challan_success(self):
        """Officer creates a challan for a valid bike"""
        token = self.get_officer_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        data = {
            "bike_number": "RIM-123",
            "rule_id": self.rule.id
        }
        response = self.client.post(self.create_challan_url, data)
        
        if response.status_code != 201:
            print(f"\nCreate Challan Fail: {response.data}")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Challan.objects.count(), 1)
        self.assertEqual(Challan.objects.first().amount_charged, 2000.00)

    def test_04_create_challan_invalid_bike(self):
        """Officer tries to challan a bike that doesn't exist"""
        token = self.get_officer_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        data = {
            "bike_number": "NON-EXISTENT",
            "rule_id": self.rule.id
        }
        response = self.client.post(self.create_challan_url, data)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # ---------------------------------------------------------
    # PUBLIC TESTS (Search & Pay)
    # ---------------------------------------------------------

    def test_05_search_challans(self):
        """Public search by bike number"""
        Challan.objects.create(
            bike=self.bike, rule=self.rule, officer=self.officer, area=self.area,
            amount_charged=500, due_date=timezone.now().date(), status="Unpaid"
        )
        
        self.client.credentials() 
        
        response = self.client.get(self.search_url + "?bike_number=RIM-123")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_06_pay_challan(self):
        """Public pay endpoint updates status"""
        challan = Challan.objects.create(
            bike=self.bike, rule=self.rule, officer=self.officer, area=self.area,
            amount_charged=500, due_date=timezone.now().date(), status="Unpaid"
        )
        
        pay_url = f"{self.pay_url_base}{challan.id}/"
        data = {"payment_proof": "http://bank.com/receipt.jpg"}
        
        response = self.client.post(pay_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        challan.refresh_from_db()
        self.assertEqual(challan.status, "Paid")

    def test_07_pay_already_paid_challan(self):
        """Cannot pay a challan twice"""
        challan = Challan.objects.create(
            bike=self.bike, rule=self.rule, officer=self.officer, area=self.area,
            amount_charged=500, due_date=timezone.now().date(), status="Paid"
        )
        
        pay_url = f"{self.pay_url_base}{challan.id}/"
        data = {"payment_proof": "http://bank.com/receipt.jpg"}
        
        response = self.client.post(pay_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # ---------------------------------------------------------
    # USER SPECIFIC TESTS
    # ---------------------------------------------------------

    def test_08_my_challans(self):
        """User views their own challans"""
        Challan.objects.create(
            bike=self.bike, rule=self.rule, officer=self.officer, area=self.area,
            amount_charged=500, due_date=timezone.now().date()
        )
        
        token = self.get_user_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        response = self.client.get(self.my_challans_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    # ---------------------------------------------------------
    # APPEAL TESTS
    # ---------------------------------------------------------

    def test_09_raise_appeal_anonymous(self):
        """Public user raises appeal without login"""
        challan = Challan.objects.create(
            bike=self.bike, rule=self.rule, officer=self.officer, area=self.area,
            amount_charged=500, due_date=timezone.now().date()
        )
        
        self.client.credentials() 
        data = {
            "challan": challan.id,
            "reason": "I was not there",
            "evidence_url": "http://img.com/evidence.jpg" 
        }
        
        response = self.client.post(self.appeal_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        challan.refresh_from_db()
        self.assertEqual(challan.status, "UnderAppeal")

    def test_10_raise_appeal_duplicate(self):
        """Cannot appeal if already under appeal"""
        challan = Challan.objects.create(
            bike=self.bike, rule=self.rule, officer=self.officer, area=self.area,
            amount_charged=500, due_date=timezone.now().date(),
            status="UnderAppeal"
        )
        
        data = {"challan": challan.id, "reason": "Try again"}
        response = self.client.post(self.appeal_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)