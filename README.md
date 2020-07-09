## Setup

```
$ yarn install
```

File `public/app-config.json` must be created by duplicating `public/app-config.template.json` and filling in the encryptionKey.

## Migrations

The app uses the DHIS2 data store to persist custom data. Whenever the schema of the data store changes, we'll create a [migration task](src/migrations/tasks) with an incremental version. \*.ts files in this folder are automatically loaded.

When writing a migration, we must define the old/new types of data structures used in that migration task. Note that we cannot rely on types on the app, as they may have diverged. For fields/objects we must reference but don't care the type, we will use `unknown` (not `any`).

When the app starts, it will check the data store version and open a dialog if a migration is required. You can also run the migrations on the CLI:

```
$ yarn migrate 'http://admin:PASSWORD@localhost:8080'
```

## Development

Start development server:

```
$ yarn start
```

This will open the development server at port 8081 and will connect to DHIS 2 instance http://localhost:8080.

Use custom values passing environment variables:

```
$ PORT=8082 REACT_APP_DHIS2_BASE_URL="https://play.dhis2.org/dev" yarn start
```

## Tests

Run unit tests:

```
$ yarn test
```

Run integration tests locally:

```
$ export CYPRESS_DHIS2_AUTH='admin:district'
$ export CYPRESS_EXTERNAL_API="http://localhost:8080"
$ export CYPRESS_ROOT_URL=http://localhost:8081
$ export CYPRESS_ENCRYPTION_KEY=anyKey

$ yarn cy:e2e:run # non-interactive
$ yarn cy:e2e:open # interactive UI
```

Application should be running at CYPRESS_ROOT_URL with as the environment variable REACT_APP_CYPRESS set to True.

For this to work in Travis CI, you will have to create an environment variables (Settings -> Environment Variables) CYPRESS_DHIS2_AUTH with the password used in your testing DHIS2 instance and CYPRESS_ENCRYPTION_KEY used to encrypt passwords of receiver instances.

Note tests only pass on the testing docker instance eyeseetea/dhis2-data:2.30-datasync-sender

## Build

```
$ yarn build-webapp
```

## i18n

### Update an existing language

```
$ yarn update-po
# ... add/edit translations in po files ...
$ yarn localize
```
