#!/bin/bash
set -e

lifecycle_json=/tmp/lifecycle.json
echo '{
  "lifecycle": {
    "rule": [{
      "action": {"type": "Delete"},
      "condition": {
        "age": 7
      }
    }]
  }
}' > $lifecycle_json

project=dyma-development
prefix="${project}-$(whoami)-"
buckets="tiles files task-artifacts models"

for bucket in $buckets; do
  bucket="gs://${prefix}${bucket}"
  ans=0
  gsutil ls -p $project $bucket || ans=$?
  if [ $ans -ne 0 ]; then
    echo "Creating $bucket..."
    gsutil mb -p $project $bucket
  fi
  gsutil lifecycle set $lifecycle_json $bucket
done
