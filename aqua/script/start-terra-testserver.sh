#!/bin/bash
set -xe

cd ../terra
poetry run ./manage.py testserver --no-input ../aqua/cypress/fixtures/terra.json
