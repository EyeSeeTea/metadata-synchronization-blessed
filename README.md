#dhis2-app-skeleton

## i18n

### Update existing language

```
$ yarn extract-pot && yarn update-po
# edit po files
$ yarn localize
```

### Create a new language (LOCALE)

```
$ cp i18n/en.pot i18n/LOCALE.po
# edit po file
$ yarn localize
```
