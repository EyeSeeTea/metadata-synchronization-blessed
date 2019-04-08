import {
    D2Model,
    DataElementModel,
    defaultModel,
    IndicatorModel,
    OrganisationUnitModel,
    ValidationRuleModel,
} from "./d2Model";
import { D2 } from "../types/d2";

const classes: { [modelName: string]: typeof D2Model } = {
    OrganisationUnitModel,
    DataElementModel,
    IndicatorModel,
    ValidationRuleModel,
};

/**
 * D2ModelProxy allows to create on-demand d2Model classes
 * If the class doesn't exist a new default class is created
 * d2ModelName: string (singular name property from d2.models)
 */
export function d2ModelFactory(d2: D2, d2ModelName: string): typeof D2Model {
    const modelName = d2.models[d2ModelName].name;
    const className = modelName.charAt(0).toUpperCase() + modelName.slice(1) + "Model";
    return classes[className] || defaultModel(modelName);
}
