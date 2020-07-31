#!/usr/bin/env python3
import glob
import os
import time
from datetime import datetime

from dymaxionlabs.files import File
from dymaxionlabs.models import Estimator


def run_object_detection_e2e_test():
    # Estimator
    print("Smoke test.")
    storage_root = 'smoke'
    estimator = Estimator.create(name="Smoke estimator - {}".format(
        datetime.now().strftime("%Y/%m/%d-%H:%M:%S")),
                                 type="object_detection",
                                 classes=["tree"])
    print("Estimator created:", estimator)

    # file upload and tiling
    train_img_path = 'images/orthomosaic.tif'
    storage_train_img_path = '{}/image/orthomosaic.tif'.format(storage_root)
    img = File.get(storage_train_img_path, raise_error=False)
    if not img:
        import pdb
        pdb.set_trace()
        img = File.upload(train_img_path, storage_train_img)
        print("File uploaded")
    print(img)
    estimator.add_image(img)
    print("File added to estimator")

    storage_train_tiles = '{}/tiles/'.format(storage_root)
    tiling_job = img.tiling(output_path=storage_train_tiles)
    print("Tiling file...")
    while tiling_job.is_running():
        time.sleep(60)

    print("Tiling finished. Status= {}".format(tiling_job.state))
    if tiling_job.state == "FAILED":
        raise "Tiling job failed!"

    # annotation upload
    annotations_filename = 'vineyard_annotations.geojson'
    labels = File.upload(annotations_filename, storage_root)
    print("Labels uploaded")
    estimator.add_labels_for(labels, img, "tree")
    print("Labels added")

    # Training time
    estimator.configuration.update(epochs=1, steps=150)
    estimator.save()

    print("Start training...")
    training_job = estimator.train()
    print("Task: {}".format(training_job.id))
    while training_job.is_running():
        time.sleep(5)
    print("Train finished")

    if training_job.state == "FAILED":
        raise "Training job failed!"

    prediction_results_dir = '{}/prediction_results/'.format(storage_root)
    print("Start prediction...")
    prediction_job = estimator.predict_files([storage_train_tiles],
                            output_path=prediction_results_dir,
                            confidence=0.2)
    print("Task: {}".format(prediction_job.id))
    while prediction_job.is_running():
        time.sleep(5)
    print("Predict finished")

    if prediction_job.state == "FAILED":
        raise "Prediction job failed!"

    for path in estimator.prediction_job.metadata["results_files"]:
        File.get(path).download("vineyard/predict-results/")


if __name__ == "__main__":
    run_object_detection_e2e_test()
