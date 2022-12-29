import _ from "lodash";
import { MetadataPackageToValidate } from "../../packageContentValidator";

// ALL-MQ-21. Unexpected translation. Unexpected symbol in locale/Missing locale in translation
export function validate_ALL_MQ_21(packageContents: MetadataPackageToValidate): string[] {
    const errors: string[] = [];

    _(packageContents)
        .toPairs()
        .forEach(([resourceKey, entities]) => {
            entities.forEach(entity => {
                const noLocaleTranslations = entity.translations?.filter(trans => !trans.locale) || [];

                noLocaleTranslations?.forEach(trans => {
                    errors.push(
                        `ALL-MQ-21. Unexpected translation. Missing locale in translation. Resource ${resourceKey} with UID ${entity.id}. Translation property='${trans.property}'`
                    );
                });

                const restTranslations = _.difference(entity.translations, noLocaleTranslations);

                const isValidLocale = (locale: string) => {
                    return /^[A-Za-z_-]+$/.test(locale);
                };

                const unexpectedSymbolsTranslations =
                    restTranslations?.filter(trans => !isValidLocale(trans.locale)) || [];

                unexpectedSymbolsTranslations?.forEach(trans => {
                    errors.push(
                        `ALL-MQ-21. Unexpected translation. Unexpected symbol in locale. Resource ${resourceKey} with UID ${entity.id}. Translation property='${trans.property}'`
                    );
                });
            });
        });

    return errors;
}
