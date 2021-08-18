# ptushki-backend

FrontSpot Hub: Ptushki, backend

## Getting Started

These instructions will running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

- To run application locally you need docker installed.
- node 14.x.
- postgreSQL 11.x

### Installing

#### Docker

```shell
docker compose up -d
```

#### Local environment

When run locally (without docker) make sure that you added postgres instance creds in `.env` file. To know which variables to use you have to look in `./config/default.js`. In simplest case your `.env` should be look like:

So, now you ready to **start** from:

0. `npm i`
1. and then
   - `npm start` to build and start server in prod mode or
   - `npm run start:dev` to run server in dev mode with rebuilding on changes.

At any time you can start filling db with fixtures, this script works independently from server:

```bash
npm run fixtures
```

**Be attentive:** it drops db and schemes.

It will creates examples of all entities and users. **All** users come with password `1234`. For convenience there are also some users **with emails which match their roles:**

- admin@mail.com,
- observer@mail.com,
- ringer@mail.com,
- scientist@mail.com,
- moderator@mail.com.

### API Structure

Main app routes are

- `users/`
- `auth/`
- `observations/`
- `rings/`

Although it would be best to **start the diggin by going to the OpenAPI documentation located at `swagger/`**

## Running the tests & linting

Project is committing to ESLint coding styles with formatting via Prettier. Also Prettier is configured for other types of files: `.json`, `.md`, `.yaml`

To lint `.ts` files run:

```
npm run lint
```

or

```
npm run lint:fix
```

if you want to simultaneously fix them. But you shouldn't pay much attention for this. As most part of work is doing in time of commit. All staged changes are linted and / or only prettified and added to stage again to commit then, of course if there aren't unfixable errors.

### Tests

Also project has tests which can be run with command

```
npm test
```

With adding modifications `:coverage` or `:watch` should be run corresponding commands. Don't forget about `run` after `npm`.

#### Functional tests

Currently, there are only functional tests. Which fully cover authentication and authorization flow.

These tests require additional db instance, as they drop db every time. You can declare this db in environment variables using the same variables as for main db instance but with prefix `_TEST_` like this: `PG_TEST_URL` and so on.

#### Unit tests

Unfortunately, now unit tests isn't implemented.

## Deployment

Add additional notes about how to deploy this on a live system

## Contributing

By default, any time you commit will be started linting and fixing which includes `eslint` & `prettier` rules.

There also exists template for Pull Requests. Please fill it as much as possible.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags).

## License

This project is licensed under the ISC License - see the [LICENSE.md](LICENSE.md) file for details
