
<img width="892" alt="logo_metadatasync" src="https://github.com/EyeSeeTea/metadata-synchronization-blessed/assets/108925044/5bfe0941-080c-42d4-9bdb-4ae5316afd93">

Metadata Sync is a DHIS2 Web Application part of [EyeSeeTea's DHIS2 Suite](https://eyeseetea.com/dhis2-apps/) that simplifies and automates the process of sending data and metadata from one DHIS2 instance to one or several other DHIS2 implementations, however different they might be. You can watch a [presentation video of the app](https://www.youtube.com/watch?v=xrrNfi66dI4)

<div align="center">
  <a href="https://www.youtube.com/watch?v=2XYclHVLKrI&t=1931s"><img width="600" src="https://github.com/EyeSeeTea/metadata-synchronization-blessed/assets/108925044/41f19953-2e21-4509-ada9-8f3ecf8aad1e" alt="youtube presentation screenshot"></a>    
</div>


## Documentation & Downloads

You can find a user guide [at the wiki](https://github.com/EyeSeeTea/metadata-synchronization-blessed/wiki) and there are also several [video tutorials](https://eyeseetea.github.io/metadata-synchronization-blessed/metadatasync/#training-videos) available. 

You can download Metadata Sync from the [DHIS2 App Hub](https://apps.dhis2.org/user/app/4045330c-5e97-4abb-ae0a-84d14d1a39b5)

For more links, see the [Metadata Sync App website](https://eyeseetea.github.io/metadata-synchronization-blessed/metadatasync/)


### About & Sponsorships

Metadata Sync development is sustainable thanks to the partners for which we build customized DHIS2 solutions. This application has been funded by the WHO Global Malaria Programme, Medecins Sans Frontières (MSF), Samaritan’s Purse, Health Information Systems Program South Africa and the U.S. President’s Malaria Initiative (PMI)  to support countries in strengthening the collection and use of health data by using DHIS2.

It has also been funded by WHO and the WHO Integrated Data Platform (WIDP), where several WHO departments and units share a dedicated hosting and maintenance provided by EyeSeeTea, back some specific new features. The Long Term Agreement EyeSeeTea holds with WHO for this maintenance includes maintenance of this application, ensuring that it will always work at least with the last version of WIDP. We are passionate about both DHIS2 and open source, so giving back to the community through dedicated open-source development is and will always be part of EyeSeeTea’s commitment.
You can also [support our work through a one-time contribution or becoming a regular github sponsor](https://github.com/sponsors/EyeSeeTea)

## Feedback

We’d like to hear your thoughts on the app in general, improvements, new features or any of the technologies being used. Just drop as a line at community@eyeseetea.com and let us know! If you prefer, you can also [create a new issue](https://github.com/EyeSeeTea/metadata-synchronization-blessed/issues) on our GitHub repository. Note that you will have to register and be logged in to GitHub to create a new issue.


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

## Scheduler

The app provides a server-side scheduler script that runs synchronization rules in the background. The script requires Node v10+.

-   Unzip metadata-synchronization-server.zip and can be executed like this:

```
$ cd metadata-synchronization-server
$ node index.js -c app-config.json
```

To connect to the destination instance, it requires a configuration file. If no configuration file is supplied the following is used as a placeholder:

```json
{
    "encryptionKey": "encryptionKey",
    "baseUrl": "https://play.dhis2.org/2.30",
    "username": "admin",
    "password": "district"
}
```

## Development

### Start the development server of the main application:

```
$ yarn start
```

Now in your browser, go to `http://localhost:8081`.

Notes:

-   Requests to DHIS2 will be transparently proxied (see `src/setupProxy.js`) from `http://localhost:8081/dhis2/path` to `http://localhost:8080/path` to avoid CORS and cross-domain problems.

-   The optional environment variable `REACT_APP_DHIS2_AUTH=USERNAME:PASSWORD` forces some credentials to be used by the proxy. This variable is usually not set, so the app has the same user logged in at `REACT_APP_DHIS2_BASE_URL`.

-   The optional environment variable `REACT_APP_PROXY_LOG_LEVEL` can be helpful to debug the proxyfied requests (accepts: "warn" | "debug" | "info" | "error" | "silent")

-   Create a file `.env.local` (copy it from `.env`) to customize environment variables so you can simply run `yarn start`.

-   [why-did-you-render](https://github.com/welldone-software/why-did-you-render) is installed, but it does not work when using standard react scripts (`yarn start`). Instead, use `yarn craco-start` to debug re-renders with WDYR. Note that hot reloading does not work out-of-the-box with [craco](https://github.com/gsoft-inc/craco).

### Customization of the development server:

```
$ yarn start -p 8082 core-app|data-metadata-app|module-package-app|modules-list|package-exporter|msf-aggregate-data-app
```

This will open the development server for the given front-end at port 8082 and will connect to DHIS 2 instance http://localhost:8080.

### Customize DHIS2 instance url

```
REACT_APP_DHIS2_BASE_URL=http://localhost:8080
```

To use a different DHIS2 instance url set this environment variable before running a `start` command.

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

To build all the front-ends:

```
$ yarn build
```

To build a given front-end:

```
$ yarn build [all|core-app|data-metadata-app|module-package-app|modules-list|package-exporter|msf-aggregate-data-app|sp-emergency-responses]
```

To build the scheduler:

```
$ yarn build-scheduler
```

This script generate a metadata-synchronization-server.zip file.

## i18n

### Update an existing language

```
$ yarn update-po
# ... add/edit translations in po files ...
$ yarn localize
```
