import _ from "lodash";
import { MetadataPackageToValidate } from "../../packageContentValidator";

// ALL-MQ-19. Translation duplicated
export function validate_ALL_MQ_19(packageContents: MetadataPackageToValidate): string[] {
    const errors: string[] = [];

    _(packageContents)
        .toPairs()
        .forEach(([resourceKey, entities]) => {
            _(entities).forEach(entity => {
                _(entity.translations)
                    .groupBy(({ locale, property }) => `${locale}|${property}`)
                    .toPairs()
                    .forEach(([, translations]) => {
                        if (translations.length > 1) {
                            errors.push(
                                `ALL-MQ-19. Translation duplicated. Resource ${resourceKey} with UID ${entity.id}. Translation property='${translations[0].property}' locale='${translations[0].locale}'`
                            );
                        }
                    });
            });
        });

    return errors;
}
