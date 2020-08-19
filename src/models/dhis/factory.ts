import _ from "lodash";
import { MetadataEntities } from "../../domain/metadata/entities/MetadataEntities";
import { D2Api } from "../../types/d2-api";
import { D2Model, defaultModel } from "./default";
import * as mappingClasses from "./mapping";
import * as metadataClasses from "./metadata";

const isDebug = process.env.NODE_ENV === "development";

export const metadataModels = [
    metadataClasses.CategoryModel,
    metadataClasses.CategoryComboModel,
    metadataClasses.CategoryOptionModel,
    metadataClasses.CategoryOptionComboModel,
    metadataClasses.CategoryOptionGroupModel,
    metadataClasses.CategoryOptionGroupSetModel,
    metadataClasses.ChartModel,
    metadataClasses.DashboardModel,
    metadataClasses.DataElementModel,
    metadataClasses.DataElementGroupModel,
    metadataClasses.DataElementGroupSetModel,
    metadataClasses.DataEntryFormModel,
    metadataClasses.DataSetModel,
    metadataClasses.EventChartModel,
    metadataClasses.EventReportModel,
    metadataClasses.IndicatorModel,
    metadataClasses.IndicatorGroupModel,
    metadataClasses.IndicatorGroupSetModel,
    metadataClasses.IndicatorTypeModel,
    metadataClasses.LegendSetModel,
    metadataClasses.MapModel,
    metadataClasses.MapViewModel,
    metadataClasses.OptionGroupModel,
    metadataClasses.OptionSetModel,
    metadataClasses.OptionModel,
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
    metadataClasses.ProgramRuleActionModel,
    metadataClasses.ProgramRuleVariableModel,
    metadataClasses.ProgramStageModel,
    metadataClasses.ProgramStageSectionModel,
    metadataClasses.ReportModel,
    metadataClasses.SectionModel,
    metadataClasses.UserModel,
    metadataClasses.UserGroupModel,
    metadataClasses.UserRoleModel,
    metadataClasses.TrackedEntityAttributeModel,
    metadataClasses.TrackedEntityTypeModel,
];

const findClasses = (key: string, value: string) => {
    return _.find(metadataClasses, [key, value]) ?? _.find(mappingClasses, [key, value]);
};

/**
 * D2ModelProxy allows to create on-demand d2Model classes
 * If the class doesn't exist a new default class is created
 * d2ModelName: string (collection name or metadata type)
 */
export function modelFactory(api: D2Api, d2ModelName?: string): typeof D2Model {
    if (!d2ModelName) throw new Error("You must provide a non-null model name");

    // TODO: Improvement, use schemas to find properties
    const { modelName = "default" } = api.models[d2ModelName as keyof MetadataEntities] ?? {};

    const directClass = findClasses("metadataType", d2ModelName);
    const modelClass = findClasses("collectionName", modelName);

    const result = directClass ?? modelClass;
    if (isDebug && !result) {
        console.error(
            `Could not find a model for ${d2ModelName}... This is probably a mistake in your app.`
        );
    }
    return result ?? defaultModel(modelName);
}
