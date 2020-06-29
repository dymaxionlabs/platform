from __future__ import print_function
import pickle
import os.path
from django.core.management.base import BaseCommand, CommandError
from projects.models import UserProfile, Project
from django.contrib.auth.models import User
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from django.conf import settings
from estimators.models import Estimator, Annotation, TrainingJob

# If modifying these scopes, delete the token file
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

USERS_SPREADSHEET_ID = '1t6_m6NURcgQ5rRjEirLF1Mjn5r3U2x-6op34SBO3UBk'


#this command returns emails from registered users
class Command(BaseCommand):
    help = 'Get current email from all users'

    def _add_to_sheet(self, row, username, email, has_projects, has_models,
                      has_annotations, annotations_count, has_trainingJobs):
        values = [
            [
                username, email, has_projects, has_models, has_annotations,
                annotations_count, has_trainingJobs
            ],
            # Additional rows ...
        ]
        body = {'values': values}
        RANGE_NAME = 'Users!A{}:G{}'.format(row + 1, row + 1)

        creds = None
        # The file token.pickle stores the user's access and refresh tokens, and is
        # created automatically when the authorization flow completes for the first
        # time.
        if os.path.exists(settings.GOOGLE_AUTH_TOKEN_FILE):
            with open(settings.GOOGLE_AUTH_TOKEN_FILE,
                      'rb') as google_auth_token:
                creds = pickle.load(google_auth_token)
        # If there are no (valid) credentials available, let the user log in.
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file(
                    settings.GOOGLE_CREDENTIALS, SCOPES)
                creds = flow.run_local_server()
            # Save the credentials for the next run
            with open(settings.GOOGLE_AUTH_TOKEN_FILE,
                      'wb') as google_auth_token:
                pickle.dump(creds, google_auth_token)

        service = build('sheets', 'v4', credentials=creds)

        # Call the Sheets API
        sheet = service.spreadsheets()
        result = sheet.values().update(spreadsheetId=USERS_SPREADSHEET_ID,
                                       range=RANGE_NAME,
                                       valueInputOption='RAW',
                                       body=body).execute()
        print('{0} cells updated.'.format(result.get('updatedCells')))

    def handle(self, *args, **options):
        profiles = UserProfile.objects.all()
        projects = Project.objects.all()
        estimators = Estimator.objects.all()
        annotations = Annotation.objects.all()
        trainingJobs = TrainingJob.objects.all()

        for i, profile in enumerate(profiles):
            if profile.beta == True:
                has_projects = "No"
                has_models = "No"
                has_annotations = "No"
                annotations_count = 0
                has_trainingJobs = "No"
                for project in projects:
                    if profile.user in project.owners.all():
                        has_projects = "Si"
                        for estimator in estimators:
                            if estimator.project == project:
                                has_models = "Si"
                            for annotation in annotations:
                                if annotation.estimator == estimator:
                                    has_annotations = "Si"
                                    annotations_count = len(
                                        annotation.segments)
                            for trainingJob in trainingJobs:
                                if trainingJob.estimator == estimator:
                                    has_trainingJobs = "Si"
                self._add_to_sheet(i, str(profile.user), profile.user.email,
                                   has_projects, has_models, has_annotations,
                                   annotations_count, has_trainingJobs)
