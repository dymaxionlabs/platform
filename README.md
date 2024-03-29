# Dymaxion Labs Platform

[![codecov](https://codecov.io/gh/dymaxionlabs/platform/branch/main/graph/badge.svg?token=7SIMOR5WIK)](https://codecov.io/gh/dymaxionlabs/platform)
[![CI](https://github.com/dymaxionlabs/platform/actions/workflows/main.yml/badge.svg)](https://github.com/dymaxionlabs/platform/actions/workflows/main.yml)
[![Issues](https://img.shields.io/github/issues-closed/dymaxionlabs/platform)](https://github.com/dymaxionlabs/platform/issues)
[![License](https://img.shields.io/github/license/dymaxionlabs/platform)](LICENSE.txt)
[![Join the chat at https://gitter.im/dymaxionlabs/Platform](https://badges.gitter.im/dymaxionlabs/Platform.svg)](https://gitter.im/dymaxionlabs/Platform?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

This repository contains the source code of both Dymaxion Labs Platform API
server and the web application.

## Development

There is a Docker compose file for development, that builds Terra and Aqua
(backend and frontend), and that sets up Postgres and Redis databases.

First make sure to copy `env.docker` as `.env.docker`, and set UID and GID
appropriately. Then, to build and start all services run: 

```
docker compose --env-file .env.docker up --build
```

These Docker images are not prepared for production use. The Docker Compose
configuration mounts the repository as volumes on /app, so any changes done in
the host machine are replicated automatically on the container.  That is the
reason we need to set the user id and group id from the host when running the
containers.

## Bugs / Questions

* [Report bugs/feature requests](https://github.com/dymaxionlabs/platform/issues)
* [Ask questions in our chat room](https://gitter.im/dymaxionlabs/platform)

## Contributing

Bug reports and pull requests are welcome on GitHub at the [issues
page](https://github.com/dymaxionlabs/platform). This project is intended to be
a safe, welcoming space for collaboration, and contributors are expected to
adhere to the [Contributor Covenant](http://contributor-covenant.org) code of
conduct.

The current roadmap is available at GitHub at the
[projects page](https://github.com/dymaxionlabs/platform/projects/1).

## License

This project is licensed under Apache 2.0. Refer to
[LICENSE.txt](https://github.com/dymaxionlabs/platform/blob/main/LICENSE.txt).
