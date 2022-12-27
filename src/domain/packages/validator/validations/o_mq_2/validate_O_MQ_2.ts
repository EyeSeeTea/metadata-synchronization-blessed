import _ from "lodash";
import { MetadataPackage, Option } from "../../../../metadata/entities/MetadataEntities";
import { MetadataPackageToValidate } from "../../packageContentValidator";

// Validate option sort order (O-MQ-2)
export function validate_O_MQ_2(packageContents: MetadataPackageToValidate): string[] {
    const options = (packageContents.options || []) as Option[];
    const errors: string[] = [];

    _(options)
        .groupBy(({ optionSet }) => optionSet?.id ?? "")
        .mapValues(options => _.sortBy(options, ({ sortOrder }) => sortOrder))
        .toPairs()
        .forEach(([optionSet, options]) => {
            const optionsSize = options.length;

            if (options[0].sortOrder !== 1 || options[optionsSize - 1].sortOrder !== optionsSize) {
                const message = `O-MQ-2 - The optionSet ${optionSet} has errors in the sortOrder. Current sortOrder: ${options
                    .map(option => option.sortOrder)
                    .join(",")}`;

                errors.push(message);
            }
        });

    return errors;
}
