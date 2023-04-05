import { MetadataEntities } from "../../metadata/entities/MetadataEntities";

export const resourcesWithCode: (keyof MetadataEntities)[] = [
    "dashboards",
    "dataSets",
    "programs",
    "indicatorGroups",
    "dataElementGroups",
    "validationRuleGroups",
    "userGroups",
    "options",
];
