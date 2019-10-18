import {
    D2Model,
    defaultModel,
    DataElementModel,
    DataElementGroupModel,
    DataElementGroupSetModel,
    IndicatorModel,
    IndicatorGroupModel,
    IndicatorGroupSetModel,
    OrganisationUnitModel,
    OrganisationUnitGroupModel,
    OrganisationUnitGroupSetModel,
    ValidationRuleModel,
    ValidationRuleGroupModel,
    ProgramIndicatorModel,
    ProgramIndicatorGroupModel,
    ProgramRuleModel,
    ProgramRuleVariableModel,
} from "./d2Model";

import { D2 } from "../types/d2";
import _ from "lodash";

const classes: { [modelName: string]: typeof D2Model } = {
    DataElementModel,
    DataElementGroupModel,
    DataElementGroupSetModel,
    IndicatorModel,
    IndicatorGroupModel,
    IndicatorGroupSetModel,
    OrganisationUnitModel,
    OrganisationUnitGroupModel,
    OrganisationUnitGroupSetModel,
    ValidationRuleModel,
    ValidationRuleGroupModel,
    ProgramIndicatorModel,
    ProgramIndicatorGroupModel,
    ProgramRuleModel,
    ProgramRuleVariableModel,
};

export const metadataModels = Object.values(classes);

/**
 * D2ModelProxy allows to create on-demand d2Model classes
 * If the class doesn't exist a new default class is created
 * d2ModelName: string (singular name property from d2.models)
 */
export function d2ModelFactory(d2: D2, d2ModelName: string): typeof D2Model {
    const modelName = d2.models[d2ModelName].name;
    const className = modelName.charAt(0).toUpperCase() + modelName.slice(1) + "Model";

    let model = classes[className];

    if (!model) {
        console.log(`d2ModelFactory for modelName ${d2ModelName} return defaultModel`);
        model = defaultModel(modelName);
    }

    return model;
}
