PREDICT_TASK = "ml_models.tasks.predict"

CREATE_INSTANCE_BODY = {
    "cluster_name": "gpu",
    "agent": {
        "qnames": ["cpu"],
        "use_public": False,
        "docker_image": "nuxion/labfunctions",
        "docker_version": "latest",
        "worker_procs": 5,
    },
    "timeout": "60m",
    "max_retry": 3,
}

RUN_NOTEBOOK_BASE_BODY = {
    "nb_name": "predict",
    "runtime": "gpu",
    "machine": "cpu",
    "cluster": "gpu",
    "gpu_support": True,
    "timeout": 10800,
}
