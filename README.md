# Dymaxion Labs Platform

---

# dymax-back: Dymaxion Labs platform backend

Django app that provisions DYMAX internal API and background tasks.

## Requirements

* Python 3
* PostgreSQL 9.4+ with PostGIS 2 extension
* GDAL, Proj, etc.

## Development

* Install dependencies

```
sudo apt-get install python3 python3-dev python3-pip \
  libgdal-dev libproj-dev postgresql postgis \
  gettext
```

* Create a superuser role for your currently logged-in user:

```sh
sudo -u postgres createuser -s $USER
```

* Create the database

```sh
createdb terra
```

* Set user password for the user you just created (`terra`). Please replace
  `foobar` for a long and difficult to guess password:

```sh
psql terra -c "ALTER USER $USER WITH PASSWORD 'foobar'"
```

* Add the PostGIS extension to the database:

```sh
psql terra -c "CREATE EXTENSION IF NOT EXISTS postgis CASCADE"
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
pipenv install django-anymail[mailgun] django-rest-auth[with_social] django-storages[google]
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

### Honcho

You can use [Honcho](https://honcho.readthedocs.io) to fire up everything (web
server, workers and Flower) on your dev machine. Simple run `honcho start`.
You can also start specific processes: `honcho start web`, `honcho start
worker`, etc.

See [Procfile](Procfile).

### Translations

When adding new translated strings:

* Run `django-admin makemessages`
* Update .po files
* Run `django-admin compilemessages`
