import { D2Api, D2ModelSchemas } from "d2-api";
import _ from "lodash";
import * as complexClasses from "./complexModels";
import * as classes from "./d2Model";
import { D2Model, defaultModel } from "./d2Model";

export const metadataModels = [
    classes.DashboardModel,
    classes.DataElementModel,
    classes.DataElementGroupModel,
    classes.DataElementGroupSetModel,
    classes.DataSetModel,
    classes.IndicatorModel,
    classes.IndicatorGroupModel,
    classes.IndicatorGroupSetModel,
    classes.OrganisationUnitModel,
    classes.OrganisationUnitGroupModel,
    classes.OrganisationUnitGroupSetModel,
    classes.OrganisationUnitLevelModel,
    classes.ValidationRuleModel,
    classes.ValidationRuleGroupModel,
    classes.ProgramModel,
    classes.ProgramIndicatorModel,
    classes.ProgramIndicatorGroupModel,
    classes.ProgramRuleModel,
    classes.ProgramRuleVariableModel,
    classes.UserGroupModel,
];

const findClasses = (args: string[]) => {
    return _.find(classes, ...args) ?? _.find(complexClasses, ...args);
};

/**
 * D2ModelProxy allows to create on-demand d2Model classes
 * If the class doesn't exist a new default class is created
 * d2ModelName: string (collection name or metadata type)
 */
export function d2ModelFactory(api: D2Api, d2ModelName: string): typeof D2Model {
    if (!d2ModelName) throw new Error("You must provide a non-null model name");

    // TODO: Improvement, use schemas to find properties
    const { modelName = "default" } = api.models[d2ModelName as keyof D2ModelSchemas] ?? {};

    const directClass = findClasses(["metadataType", d2ModelName]);
    const modelClass = findClasses(["collectionName", modelName]);
    const mappingClass = findClasses(["mappingType", d2ModelName]);

    const result = directClass ?? modelClass ?? mappingClass;
    if (!result) {
        console.error(
            `Could not find a model for ${d2ModelName}... This is probably a mistake in your app.`
        );
    }
    return result ?? defaultModel(modelName);
}
