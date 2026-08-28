from django.urls import reverse
from rest_framework.test import APITestCase
from rest_frameword import status

class registerTests(APITestCase):
    def test_register_user(self):
        url = reverse("register")
        data = {"email": "test@example.com", "username": "test", "password": "StrongPass@123"}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
