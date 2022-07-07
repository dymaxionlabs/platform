# Install dependencies only when needed
FROM python:3.9 AS deps
RUN apt-get update && apt-get install -y --no-install-recommends \
  binutils \
  gdal-bin \
  gettext \
  libgdal-dev \
  libproj-dev \
  libspatialindex-dev \
  postgresql-client \
  proj-bin \
  python3-dev \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV POETRY_VERSION=1.1.13 \
  POETRY_VIRTUALENVS_CREATE=false

RUN pip install poetry==$POETRY_VERSION

COPY pyproject.toml poetry.lock /app/
RUN poetry install

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

RUN addgroup --system --gid 1001 django
RUN adduser --system --uid 1001 django

COPY --chown=django:django . .

RUN python manage.py collectstatic --clear --no-input

USER django

EXPOSE 8000

ENV PORT 8000

CMD ["sh", "-c", "python ./manage.py runserver 0.0.0.0:8000"]
