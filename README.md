# Terra

## Requirements

* Python 3
* PostgreSQL 9.4+ with PostGIS 2 extension
* GDAL, Proj, etc.

## Development

* Install dependencies

```
sudo apt-get install python3 python3-dev python3-pip libgdal-dev libproj-dev postgresql postgis
```

* Create a role and database (e.g. `terra`)

```
sudo -u postgres createuser --interactive
sudo -u postgres createdb terra
```

* Set user password for Django

```
$ psql terra
# ALTER USER terra WITH PASSWORD 'foobar';
```

* Copy `env.sample` and edit it to suit your needs. You will have to set
  `DB_USER`, `DB_PASS` and `DB_NAME`.

```
cp env.sample .env
```

* Install Python dependencies using Pipenv. Install it first if you don't have it:

```
pip install --user -U pipenv
pipenv install
pipenv install django-anymail[mailgun] django-rest-auth[with_social] celery[redis] django-storages[google]
```

Then inside a pipenv shell (use `pipenv shell`) you should first do the following:

* Run migrations: `./manage.py migrate`
* Create superuser: `./manage.py createsuperuser`

Now you can:

* Run server: `./manage.py runserver`
* Run tests: `./manage.py test`

When deploying for the first time:

* Set `DEBUG=0` and `ALLOWED_HOSTS` list with domains/subdomains and IPs
* Also, set a long unique `SECRET_KEY`
* Collect statics with `./manage.py collectstatic`

### Async tasks

We use Celery for asynchronous tasks like preprocessing and prediction tasks.
Redis is the current broker backend.

* Run a worker

```
celery -A terra worker -l info
```

* Start Flower monitoring app.

```
celery -A terra flower
```

Then, visit http://localhost:5555

### Honcho

You can use [Honcho](https://honcho.readthedocs.io) to fire up everything (web
server, workers and Flower) on your dev machine. Simple run `honcho start`.
You can also start specific processes: `honcho start web`, `honcho start
worker`, etc.

See [Procfile](Procfile).
