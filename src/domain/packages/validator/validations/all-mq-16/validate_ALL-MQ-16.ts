import _ from "lodash";
import { MetadataPackageToValidate } from "../../packageContentValidator";

// ALL-MQ-16. Package items should not have favourite set
export function validate_ALL_MQ_16(packageContents: MetadataPackageToValidate): string[] {
    const errors: string[] = [];

    _(packageContents)
        .mapValues(items => items?.map(({ id, favorites = [] } = {}) => (favorites.length > 0 ? id : undefined)) ?? [])
        .values()
        .flatten()
        .compact()
        .forEach(id =>
            errors.push(
                `ALL-MQ-16. There is a reference to users that saved the resource as favourite. Resource ${id}.`
            )
        );
    return errors;
}
