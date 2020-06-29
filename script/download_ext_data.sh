#!/bin/bash
set -xeu -o pipefail
gsutil -m cp -r gs://dym-assets/dymax-front/data/ .
