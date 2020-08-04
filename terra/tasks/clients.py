from googleapiclient import discovery
from googleapiclient import errors
from django.conf import settings


class CloudMLClient:
    """
    CloudMLClient allows you to query about jobs, create new training jobs and cancel running jobs

    Note: Service Account will need "ML Engine Developer" permission.

    """
    def __init__(self):
        self.project_id = f'projects/{settings.CLOUDML_PROJECT}'
        self._client = None

    @property
    def client(self):
        if not self._client:
            self._client = discovery.build('ml', 'v1')
        return self._client

    def list_jobs(self):
        req = self.client.projects().jobs().list(parent=self.project_id)
        return req.execute()

    def get_job(self, job_id):
        name = f'{self.project_id}/jobs/{job_id}'
        req = self.client.projects().jobs().get(name=name)
        return req.execute()

    def create_job(self, job_id, body):
        # TODO
        pass

    def cancel_job(self, job_id):
        name = f'{self.project_id}/jobs/{job_id}'
        req = self.client.projects().jobs().cancel(name=name)
        return req.execute()
