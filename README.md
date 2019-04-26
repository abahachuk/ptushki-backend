# ptushki-backend

FrontSpot Hub: Ptushki, backend

## Getting Started

These instructions will running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

To run, you will need an installed node, preferably 10 version. However, it is much more convenient to use nvm or its analogues.
You will also need an postgres instance running locally either directly or in a docker-container, or, easiest of all, you can get a free instance on elephantsql.com -- it will take no more than 5 minutes.

### Installing

When run locally make sure that you added postgres instance creds in .env file. To know which variables to use you have to look in `./config/default.js`. In simplest case you `.env` should be look like:

```dotenv
PG_URL=postgres://ljfsdl:llfdoDS40_KUppp@dkwjjds.db.elephantsql.com:5432/ljfsdl
```

So now you ready to **start** from:

```
npm i
```

and then

```
npm start
```

to build and start server in prod mode or

```
npm run start:dev
```

to run server in dev mode with rebuilding on changes.

At any time you can start filling db with fixtures, this script works independently from server:

```bash
npm run fixtures
```

**Be attentive:** it drops db and schemes.

It will creates examples all entities and users. **All** users come with password `1234`. For convenience there are also some users **with emails which match their roles:** admin@mail.com, observer@mail.com, ringer@mail.com, scientist@mail.com, moderator@mail.com.

### API Structure

Main app routes are

- `users/`
- `auth/`
- `observations/` and
- `rings/`

Although it would be best to **start the diggin by going to the OpenAPI documentation located at `swagger/`**

## Running the tests & linting

Project is committing to ESLint coding styles with formatting via Prettier.

To lint `.ts` files run:

```
npm run lint
```

or

```
npm run lint:fix
```

if you want to simultaneously fix them.

Also project has test which can be run with command

```
npm test
```

With adding modificators `:coverage` or `:watch` should be runned corresponding coomands. Dont forget about `run` .

## Deployment

Add additional notes about how to deploy this on a live system

## Contributing

By default any time you commit will be started linting which includes `eslint` & `prettier`.

There also exists template for Pull Requests. Please fill it as much as possible.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags).

## License

This project is licensed under the ISC License - see the [LICENSE.md](LICENSE.md) file for details
