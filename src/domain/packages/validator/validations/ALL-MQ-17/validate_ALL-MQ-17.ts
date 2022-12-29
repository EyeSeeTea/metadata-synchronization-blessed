import _ from "lodash";
import { MetadataEntities } from "../../../../metadata/entities/MetadataEntities";
import { MetadataPackageToValidate } from "../../packageContentValidator";

// ALL-MQ-17. Missed code field in a resource
export function validate_ALL_MQ_17(packageContents: MetadataPackageToValidate): string[] {
    const resourcesWithCode: (keyof MetadataEntities)[] = [
        "dashboards",
        "dataSets",
        "programs",
        "indicatorGroups",
        "dataElementGroups",
        "validationRuleGroups",
        "userGroups",
        "options",
    ];

    return resourcesWithCode
        .map(
            key =>
                packageContents[key]
                    ?.filter(item => item.code === undefined)
                    .map(item => `ALL-MQ-17- Missed code field in ${key} (name='${item.name}' uid=${item.id})`) || []
        )
        .flat();
}
