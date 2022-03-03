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
  python3-dev \
  && rm -rf /var/lib/apt/lists/*
RUN curl -sSL https://install.python-poetry.org | python3 -
WORKDIR /app

ENV PATH=$USER/.local/bin:$PATH

COPY pyproject.toml poetry.lock /app/
RUN poetry install

# Rebuild the source code only when needed
FROM python:3.9 AS builder
WORKDIR /app
COPY --from=deps /app/__pypackages__ ./__pypackages__
COPY . .

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

RUN poetry run python manage.py collectstatic --clear --no-input

# Production image, copy all the files and run next
FROM python:3.9 AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 django
RUN adduser --system --uid 1001 django

USER django

EXPOSE 8000

ENV PORT 8000

CMD [ "poetry", "run", "python", "manage.py", "runserver" ]
