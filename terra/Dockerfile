FROM python:3.8

ENV PYTHONUNBUFFERED 1

RUN apt-get update && apt-get install -y --no-install-recommends \
    binutils \
    build-essential \
    gdal-bin \
    libgdal-dev \
    libproj-dev \
    libspatialindex-dev \
    postgresql-client \
  && rm -rf /var/lib/apt/lists/*

RUN pip install -U pipenv

RUN mkdir /app
WORKDIR /app

COPY Pipfile Pipfile.lock /app/
RUN pipenv install -d

COPY docker/wait-for-postgres.sh \
  /usr/local/bin/

EXPOSE 8000
