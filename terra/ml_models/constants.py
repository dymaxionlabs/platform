CREATE_INSTANCE_BODY = {
  "cluster_name": "gpu",
  "agent": {
    "qnames": [
      "cpu"
    ],
    "use_public": False,
    "docker_image": "nuxion/labfunctions",
    "docker_version": "latest",
    "worker_procs": 5
  },
  "timeout": "60m",
  "max_retry": 3
}

RUN_NOTEBOOK_BODY = {
  "nb_name": "test-tf-gpu",
  "params": {
    "__input_artifacts_url": "gs://dym-task-artifacts/42/234/input/",
    "__output_artifacts_url": "gs://dym-task-artifacts/42/234/output/",
    "image_dir": "images/"
  },
  "runtime": "gpu",
  "version": "v0.1.0",
  "machine": "cpu",
  "cluster": "gpu",
  "gpu_support": True,
  "timeout": 10800
}
