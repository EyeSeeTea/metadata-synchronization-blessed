## Setup

```
$ yarn install
```

File `public/app-config.json` must be created by duplicating `public/app-config.template.json` and filling in the encryptionKey.

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

### Create a new language

```
$ cp i18n/en.pot i18n/es.po
# ... add translations to i18n/es.po ...
$ yarn localize
```
