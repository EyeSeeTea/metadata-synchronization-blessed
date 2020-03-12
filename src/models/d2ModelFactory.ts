import { D2Api, D2ModelSchemas } from "d2-api";
import _ from "lodash";
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
    classes.ProgramIndicatorModel,
    classes.ProgramIndicatorGroupModel,
    classes.ProgramRuleModel,
    classes.ProgramRuleVariableModel,
    classes.UserGroupModel
];

/**
 * D2ModelProxy allows to create on-demand d2Model classes
 * If the class doesn't exist a new default class is created
 * d2ModelName: string (collection name or metadata type)
 */
export function d2ModelFactory(api: D2Api, d2ModelName: string): typeof D2Model {
    if (!d2ModelName) throw new Error("You must provide a non-null model name");

    // TODO: Improvement, use schemas to find properties
    const { modelName = "default" } = api.models[d2ModelName as keyof D2ModelSchemas] ?? {};

    const directClass = _.find(classes, ["metadataType", d2ModelName]);
    const modelClass = _.find(classes, ["collectionName", modelName]);
    const mappingClass = _.find(classes, ["mappingType", d2ModelName]);

    const result = directClass ?? modelClass ?? mappingClass ?? defaultModel(modelName);
    console.debug(`d2ModelFactory for modelName ${d2ModelName} returns ${result.metadataType}`);
    return result;
}
