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

ENV POETRY_VERSION=1.1.13
RUN pip install poetry==$POETRY_VERSION

COPY pyproject.toml poetry.lock /app/
RUN poetry config virtualenvs.in-project true && poetry install

FROM python:3.9 AS runner
RUN apt-get update && apt-get install -y --no-install-recommends \
  gdal-bin \
  proj-bin \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

RUN addgroup --system --gid 1001 django
RUN adduser --system --uid 1001 django

COPY --from=deps --chown=django:django /app/.venv /venv/
COPY --chown=django:django . .

RUN /venv/bin/python manage.py collectstatic --clear --no-input

USER django

EXPOSE 8000

ENV PORT 8000

CMD ["sh", "-c", "/venv/bin/python ./manage.py runserver 0.0.0.0:8000"]
