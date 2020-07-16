from django.test import TestCase

from bigquery.client import Client, QueryJob, Row


class ClientTestCase(TestCase):
    def test_query(self):
        self.client = Client()
        query_job = self.client.query("SELECT 1")
        self.assertIsInstance(query_job, QueryJob)
        results = list(query_job)
        self.assertIsInstance(results[0], Row)