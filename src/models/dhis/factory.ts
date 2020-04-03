import { D2Api, D2ModelSchemas } from "d2-api";
import _ from "lodash";
import { D2Model, defaultModel } from "./default";
import * as mappingClasses from "./mapping";
import * as metadataClasses from "./metadata";

export const metadataModels = [
    metadataClasses.DashboardModel,
    metadataClasses.DataElementModel,
    metadataClasses.DataElementGroupModel,
    metadataClasses.DataElementGroupSetModel,
    metadataClasses.DataSetModel,
    metadataClasses.IndicatorModel,
    metadataClasses.IndicatorGroupModel,
    metadataClasses.IndicatorGroupSetModel,
    metadataClasses.OrganisationUnitModel,
    metadataClasses.OrganisationUnitGroupModel,
    metadataClasses.OrganisationUnitGroupSetModel,
    metadataClasses.OrganisationUnitLevelModel,
    metadataClasses.ValidationRuleModel,
    metadataClasses.ValidationRuleGroupModel,
    metadataClasses.ProgramModel,
    metadataClasses.ProgramIndicatorModel,
    metadataClasses.ProgramIndicatorGroupModel,
    metadataClasses.ProgramRuleModel,
    metadataClasses.ProgramRuleVariableModel,
    metadataClasses.UserGroupModel,
];

const findClasses = (key: string, value: string) => {
    return _.find(metadataClasses, [key, value]) ?? _.find(mappingClasses, [key, value]);
};

/**
 * D2ModelProxy allows to create on-demand d2Model classes
 * If the class doesn't exist a new default class is created
 * d2ModelName: string (collection name or metadata type)
 */
export function d2ModelFactory(api: D2Api, d2ModelName?: string): typeof D2Model {
    if (!d2ModelName) throw new Error("You must provide a non-null model name");

    // TODO: Improvement, use schemas to find properties
    const { modelName = "default" } = api.models[d2ModelName as keyof D2ModelSchemas] ?? {};

    const directClass = findClasses("metadataType", d2ModelName);
    const modelClass = findClasses("collectionName", modelName);

    const result = directClass ?? modelClass;
    if (!result) {
        console.error(
            `Could not find a model for ${d2ModelName}... This is probably a mistake in your app.`
        );
    }
    return result ?? defaultModel(modelName);
}
