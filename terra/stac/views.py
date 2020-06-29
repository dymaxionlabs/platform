from django.conf import settings
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
import json
import requests


class SearchView(APIView):

    def post(self, request, format=None):
        url = "".join([settings.STAC_SERVER_URL, settings.STAC_SEARCH_PATH])
        r = requests.post(url, data=json.dumps(request.data))
        return Response(json.loads(r.text), status=r.status_code)

