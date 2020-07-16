import logging

from django.conf import settings
from google.cloud import bigquery

logger = logging.getLogger(__name__)


class Client:
    def __init__(self):
        self._client = None

    @property
    def client(self):
        if not self._client:
            self._client = bigquery.Client()
        return self._client

    def query(self, query_string):
        return self.client.query(query_string)