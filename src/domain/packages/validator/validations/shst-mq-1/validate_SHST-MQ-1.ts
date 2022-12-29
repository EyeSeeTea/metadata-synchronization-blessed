import _ from "lodash";
import { MetadataPackageToValidate } from "../../packageContentValidator";

// OG-MQ-1. Package items should not have external access
export function validate_SHST_MQ_1(packageContents: MetadataPackageToValidate): string[] {
    const errors: string[] = [];

    _(packageContents)
        .mapValues(
            items => items?.map(({ id, externalAccess } = {}) => (externalAccess === true ? id : undefined)) ?? []
        )
        .values()
        .flatten()
        .compact()
        .forEach(id => errors.push(`SHST-MQ-1 - There is a resource with external access: Resource ${id}`));

    return errors;
}
