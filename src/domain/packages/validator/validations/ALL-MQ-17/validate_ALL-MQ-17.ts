import { MetadataPackageToValidate } from "../../packageContentValidator";
import { resourcesWithCode } from "../../utils";

// ALL-MQ-17. Missed code field in a resource
export function validate_ALL_MQ_17(packageContents: MetadataPackageToValidate): string[] {
    return resourcesWithCode
        .map(
            key =>
                packageContents[key]
                    ?.filter(item => item.code === undefined)
                    .map(item => `ALL-MQ-17- Missed code field in ${key} (name='${item.name}' uid=${item.id})`) || []
        )
        .flat();
}
