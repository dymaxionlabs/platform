from django.test import TestCase
from terra.payments import MP_CLIENT, MercadoPagoClient


class MercadoPagoClientTest(TestCase):
    def setUp(self):
        self.mp = MP_CLIENT

    def test_available_countries(self):
        self.assertEqual(['AR'], self.mp.available_countries)