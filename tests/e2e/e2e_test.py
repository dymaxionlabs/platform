#!/usr/bin/env python3
from dymaxionlabs.models import Estimator
from dymaxionlabs.files import File
from datetime import datetime
import glob
import os
import time


def run_object_detection_e2e_test():
    #Estimator
    print("Smoke test.")
    storage_root = 'smoke'
    estimator = Estimator.create(
        name="Smoke estimator - {}".format(datetime.now().strftime("%Y/%m/%d-%H:%M:%S")), 
        type="object_detection", 
        classes=["tree"]
    )
    print("Estimator created")
    print(estimator)

    #file upload and tiling    
    train_img_path = 'images/orthomosaic.tif'
    storage_train_img = '{}/image/'.format(storage_root)
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

    #annotation upload
    annotations_filename = 'vineyard_annotations.geojson'
    labels = File.upload(annotations_filename, storage_root)
    print("Labels uploaded")
    estimator.add_labels_for(labels, img, "tree")
    print("Labels added")


    # Training time 
    estimator.configuration['training_hours'] = 0.4
    estimator.save()

    print("Start training...")
    job = estimator.train()
    print("Task: {}".format(job.id))
    while job.is_running():
        time.sleep(60)
    print("Train finished")

    prediction_results_dir = '{}/prediction_results/'.format(storage_root)
    print("Start prediction...")
    estimator.predict_files([storage_train_tiles], output_path=prediction_results_dir, confidence=0.2)
    print("Task: {}".format(estimator.prediction_job.id))
    while estimator.prediction_job.is_running():
        time.sleep(60)
    print("Predict finished")

    for path in estimator.prediction_job.metadata["results_files"]:
        File.get(path).download("vineyard/predict-results/")


if __name__ == "__main__":
    run_object_detection_e2e_test()
