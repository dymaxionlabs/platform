# GSA needs "ML Engine Developer" permission
from googleapiclient import discovery
from googleapiclient import errors
from django.conf import settings

class CloudMLClient:
    def __init__(self):
        self.project_id = f'projects/{settings.CLOUDML_PROJECT}'
        self._client = None

    @property
    def client(self):
        if not self._client:
            self._client = discovery.build('ml', 'v1')
        return self._client

    def list_jobs(self):
        req = self.client.projects().jobs().list(
                parent=self.project_id)
        return req.execute()

    def get_job(self, job_id):
        name = f'{self.project_id}/jobs/{job_id}'
        req = self.client.projects().jobs().get(
                name=name)
        return req.execute()

    def create_job(self, job_id, body):
        # TODO
        pass

    def cancel_job(self, job_id):
        # TODO
        pass

{
  "jobId": string,
  "etag": string,
  "trainingInput": {
      "scaleTier": enum (ScaleTier),
      "masterType": string,
      "masterConfig": {
        object (ReplicaConfig)
      },
      "workerType": string,
      "workerConfig": {
        object (ReplicaConfig)
      },
      "parameterServerType": string,
      "parameterServerConfig": {
        object (ReplicaConfig)
      },
      "evaluatorType": string,
      "evaluatorConfig": {
        object (ReplicaConfig)
      },
      "workerCount": string,
      "parameterServerCount": string,
      "evaluatorCount": string,
      "packageUris": [
        string
      ],
      "pythonModule": string,
      "args": [
        string
      ],
      "hyperparameters": {
        object (HyperparameterSpec)
      },
      "region": string,
      "jobDir": string,
      "runtimeVersion": string,
      "pythonVersion": string,
      "encryptionConfig": {
        object (EncryptionConfig)
      },
      "scheduling": {
        object (Scheduling)
      },
      "network": string,
      "serviceAccount": string,
      "useChiefInTfConfig": boolean
  }
}
