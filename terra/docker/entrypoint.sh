#!/bin/bash
set -e

pipenv install
pipenv run "$@"
