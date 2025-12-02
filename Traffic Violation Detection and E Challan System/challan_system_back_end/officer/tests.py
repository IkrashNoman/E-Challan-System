# officer/tests.py

from django.test import override_settings
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Officer, Area

# We override the settings to ensure these tests use the OFFICER authentication
# instead of the WebsiteUser authentication defined in the global settings.py
@override_settings(REST_FRAMEWORK={
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'officer.authentication.OfficerJWTAuthentication',
    ),
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
    )
})
class OfficerTests(APITestCase):

    def setUp(self):
        """
        Set up data for testing
        """
        # 1. Create a dummy Area
        self.area = Area.objects.create(
            city="Rawalpindi",
            zone="Zone A",
            sub_area="Chandni Chowk"
        )

        # 2. Define URLs (Assuming your project urls.py points to 'api/officer/')
        self.list_url = '/api/officer/list/'
        self.create_url = '/api/officer/create/'
        self.login_url = '/api/officer/login/'
        self.areas_url = '/api/officer/areas/'
        
        # Dynamic URLs (need ID appended later)
        self.update_url_base = '/api/officer/update/'
        self.delete_url_base = '/api/officer/delete/'
        self.view_url_base = '/api/officer/view/'

        # 3. Create a valid Officer manually for Login tests
        self.officer_password = "securePassword123"
        self.officer = Officer(
            name="Existing Officer",
            rank="Inspector",
            email="existing@police.com",
            password=self.officer_password,
            area=self.area,
            status="Active"
        )
        self.officer.save() # This triggers the custom save() method to hash the password

        # 4. Data for creating a NEW officer via API
        self.new_officer_data = {
            "name": "New Recruit",
            "rank": "Constable",
            "email": "new@police.com",
            "password": "newpassword123",
            "area": self.area.id, # Send ID, not object
            "status": "Active"
        }

    def get_auth_token(self):
        """Helper to login and get token"""
        response = self.client.post(self.login_url, {
            "email": self.officer.email,
            "password": self.officer_password
        })
        return response.data["tokens"]["access"]

    # ---------------------------------------------------------
    # PUBLIC / SETUP TESTS
    # ---------------------------------------------------------

    def test_1_get_areas(self):
        """Test fetching the list of areas"""
        response = self.client.get(self.areas_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1) # Should have the 1 area we created
        self.assertEqual(response.data[0]['city'], "Rawalpindi")

    # ---------------------------------------------------------
    # AUTHENTICATION TESTS
    # ---------------------------------------------------------

    def test_2_login_success(self):
        """Test that an officer can login"""
        data = {
            "email": self.officer.email,
            "password": self.officer_password
        }
        response = self.client.post(self.login_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("tokens", response.data)
        self.assertIn("access", response.data["tokens"])
        self.assertEqual(response.data["rank"], "Inspector")

    def test_3_login_failure(self):
        """Test login with wrong password"""
        data = {
            "email": self.officer.email,
            "password": "WRONG_PASSWORD"
        }
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # ---------------------------------------------------------
    # CRUD TESTS
    # ---------------------------------------------------------

    def test_4_create_officer(self):
        """Test creating a new officer"""
        # Note: If you enable permissions later, you might need to add headers here
        response = self.client.post(self.create_url, self.new_officer_data)
        
        if response.status_code != 201:
            print(f"\nCreate Failed: {response.data}")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Officer.objects.count(), 2) # 1 existing + 1 new

    def test_5_list_officers(self):
        """Test listing all officers"""
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should be at least 1 (the one created in setUp)
        self.assertGreaterEqual(len(response.data), 1)

    def test_6_view_single_officer(self):
        """Test viewing a specific officer profile"""
        url = f"{self.view_url_base}{self.officer.id}/"
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], "existing@police.com")
        # Check if Area details are nested correctly
        self.assertEqual(response.data['area_details']['city'], "Rawalpindi")

    def test_7_update_officer(self):
        """Test updating an officer's rank"""
        url = f"{self.update_url_base}{self.officer.id}/"
        
        update_data = {"rank": "SI"} # Promotion!
        response = self.client.patch(url, update_data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify in DB
        self.officer.refresh_from_db()
        self.assertEqual(self.officer.rank, "SI")

    def test_8_delete_officer(self):
        """Test deleting an officer"""
        # Create a temp officer to delete so we don't break other tests
        temp_officer = Officer.objects.create(
            name="To Delete", email="delete@me.com", password="pass", rank="Constable"
        )
        
        url = f"{self.delete_url_base}{temp_officer.id}/"
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(Officer.objects.filter(email="delete@me.com").exists())