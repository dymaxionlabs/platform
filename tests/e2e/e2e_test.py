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
        img = File.upload(train_img_path, storage_train_img_path)
        print("File uploaded")
    print(img)
    estimator.add_image(img)
    print("File added to estimator")

    storage_train_tiles = '{}/tiles/'.format(storage_root)
    tiling_task = img.tiling(output_path=storage_train_tiles)
    print("Tiling file...")
    while tiling_task.is_running():
        time.sleep(5)

    print("Tiling finished. Status= {}".format(tiling_task.state))
    if tiling_task.state == "FAILED":
        raise "Tiling task failed!"

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
    training_task = estimator.train()
    print("Task: {}".format(training_task.id))
    while training_task.is_running():
        time.sleep(5)
    print("Train finished")

    if training_task.state == "FAILED":
        raise RuntimeError("Training task failed!")

    prediction_results_dir = '{}/prediction_results/'.format(storage_root)
    print("Start prediction...")
    prediction_task = estimator.predict_files([storage_train_tiles],
                            output_path=prediction_results_dir,
                            confidence=0.2)
    print("Task: {}".format(prediction_task.id))
    while prediction_task.is_running():
        time.sleep(5)
    print("Predict finished")

    if prediction_task.state == "FAILED":
        raise RuntimeError("Prediction task failed!")

    prediction_task.download_artifacts("vineyard/")


if __name__ == "__main__":
    run_object_detection_e2e_test()
