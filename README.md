# Terra

## Requirements

* Python 3
* PostgreSQL 9.4+ with PostGIS 2 extension
* GDAL, Proj, etc.

## Development

* Install dependencies

```
sudo apt-get install python3 postgresql postgis
```

* Create a role and database (e.g. `terra`)

```
sudo -u postgres createuser --interactive
sudo -u postgres createdb
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
```

Then inside a pipenv shell (use `pipenv shell`) you should first do the following:

* Run migrations: `./manage.py migrate`
* Create superuser: `./manage.py createsuperuser`

Now you can:

* Run server: `./manage.py runserver`
* Run tests: `./manage.py test`
