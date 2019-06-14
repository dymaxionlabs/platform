from __future__ import print_function
import pickle
import os.path
from django.core.management.base import BaseCommand, CommandError
from projects.models import UserProfile
from django.contrib.auth.models import User
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from django.conf import settings

# If modifying these scopes, delete the file token.pickle.
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

# The ID and range of a sample spreadsheet.
SAMPLE_SPREADSHEET_ID = '1t6_m6NURcgQ5rRjEirLF1Mjn5r3U2x-6op34SBO3UBk'

#this command returns emails from registered users
class Command(BaseCommand):
    help = 'Get current email from all users'

    def _add_to_sheet(self, row, username, email):
        values = [
            [
                username, email
            ],
            # Additional rows ...
        ]
        body = {
            'values': values
        }
        SAMPLE_RANGE_NAME = 'Users!A{}:B{}'.format(row,row)

        """Shows basic usage of the Sheets API.
        Prints values from a sample spreadsheet.
        """
        creds = None
        # The file token.pickle stores the user's access and refresh tokens, and is
        # created automatically when the authorization flow completes for the first
        # time.
        if os.path.exists('token.pickle'):
            with open('token.pickle', 'rb') as token:
                creds = pickle.load(token)
        # If there are no (valid) credentials available, let the user log in.
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file(
                    settings.GOOGLE_CREDENTIALS, SCOPES)
                creds = flow.run_local_server()
            # Save the credentials for the next run
            with open('token.pickle', 'wb') as token:
                pickle.dump(creds, token)

        service = build('sheets', 'v4', credentials=creds)

        # Call the Sheets API
        sheet = service.spreadsheets()
        result = sheet.values().update(
            spreadsheetId=SAMPLE_SPREADSHEET_ID,
            range=SAMPLE_RANGE_NAME,
            valueInputOption='RAW',
            body=body).execute()
        print('{0} cells updated.'.format(result.get('updatedCells')))

    def handle(self, *args, **options):
        
        profiles = UserProfile.objects.all()
        i = 1
        for profile in profiles:
            if profile.in_beta == True:
                self._add_to_sheet(i,str(profile.user), profile.user.email)
                # i indicates row number
                i+=1
