# users/tests.py

from rest_framework.test import APITestCase
from rest_framework import status
from .models import WebsiteUser, Citizen, Bike, UserBike

class UserTests(APITestCase):

    def setUp(self):
        self.signup_url = '/api/users/signup/'
        self.login_url = '/api/users/login/'
        self.me_url = '/api/users/me/'
        self.edit_url = '/api/users/edit/'
        self.delete_url = '/api/users/delete/'

        self.valid_signup_data = {
            "email": "test@example.com",
            "phone": "03001234567",
            "password": "password123",
            "confirm_password": "password123",
            "cnic": "12345-1234567-1",
            "bike_registration_date": "2023-01-01",
            "bike_number": "RIM-123",
            "official_copy_url": "http://example.com/official.jpg",
            "cnic_front_url": "http://example.com/front.jpg",
            "cnic_back_url": "http://example.com/back.jpg"
        }

    # Helper function to get a token easily
    def get_auth_token(self):
        self.client.post(self.signup_url, self.valid_signup_data)
        login_resp = self.client.post(self.login_url, {
            "email": "test@example.com", "password": "password123"
        })
        return login_resp.data["tokens"]["access"]

    # ---------------------------------------------------------
    # SIGNUP & LOGIN TESTS (These were already passing)
    # ---------------------------------------------------------

    def test_1_signup_success(self):
        response = self.client.post(self.signup_url, self.valid_signup_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_2_signup_password_mismatch(self):
        data = self.valid_signup_data.copy()
        data['confirm_password'] = "mismatch"
        response = self.client.post(self.signup_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_3_signup_duplicate_cnic(self):
        self.client.post(self.signup_url, self.valid_signup_data)
        data_2 = self.valid_signup_data.copy()
        data_2['email'] = "second@example.com"
        response = self.client.post(self.signup_url, data_2)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_4_login_success(self):
        self.client.post(self.signup_url, self.valid_signup_data)
        login_data = {"email": "test@example.com", "password": "password123"}
        response = self.client.post(self.login_url, login_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("tokens", response.data)

    def test_5_login_failure(self):
        self.client.post(self.signup_url, self.valid_signup_data)
        login_data = {"email": "test@example.com", "password": "WRONG_PASSWORD"}
        response = self.client.post(self.login_url, login_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # ---------------------------------------------------------
    # AUTHENTICATED ENDPOINT TESTS (The ones failing)
    # ---------------------------------------------------------

    def test_6_get_user_info(self):
        token = self.get_auth_token()
        
        # Ensure we clear any previous credentials before setting new ones
        self.client.credentials() 
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)
        
        response = self.client.get(self.me_url)
        
        # DEBUG PRINT if it fails
        if response.status_code == 401:
            print(f"\nTest 6 Fail Detail: {response.data}")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], "test@example.com")

    def test_7_edit_user(self):
        token = self.get_auth_token()
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)
        
        update_data = {"address": "New House Address, Rawalpindi"}
        response = self.client.patch(self.edit_url, update_data)

        # DEBUG PRINT if it fails
        if response.status_code == 401:
            print(f"\nTest 7 Fail Detail: {response.data}")
            
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        user = WebsiteUser.objects.get(email="test@example.com")
        self.assertEqual(user.address, "New House Address, Rawalpindi")

    def test_8_delete_user(self):
        token = self.get_auth_token()
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)
        
        response = self.client.delete(self.delete_url)

        # DEBUG PRINT if it fails
        if response.status_code == 401:
            print(f"\nTest 8 Fail Detail: {response.data}")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(WebsiteUser.objects.count(), 0)