import _ from "lodash";
import i18n from "../../locales";
import {
    D2CategoryOptionSchema,
    D2DataSetSchema,
    D2IndicatorSchema,
    D2ProgramIndicatorSchema,
    D2ProgramSchema,
    SelectedPick,
} from "../../types/d2-api";
import {
    categoryOptionFields,
    dataElementFields,
    dataSetFields,
    indicatorFields,
    programFieldsWithDataElements,
    programFieldsWithIndicators,
} from "../../utils/d2";
import {
    CategoryComboModel,
    CategoryModel,
    CategoryOptionComboModel,
    CategoryOptionGroupModel,
    CategoryOptionGroupSetModel,
    CategoryOptionModel,
    DataElementModel,
    DataSetModel,
    IndicatorModel,
    OptionModel,
    OrganisationUnitModel,
    ProgramIndicatorModel,
    ProgramModel,
    ProgramStageModel,
    RelationshipTypeModel,
    TrackedEntityAttributeModel,
} from "./metadata";

export class CategoryOptionMappedModel extends CategoryOptionModel {
    protected static fields = categoryOptionFields;
    protected static mappingType = "categoryOptions";

    protected static modelTransform = (
        objects: SelectedPick<D2CategoryOptionSchema, typeof categoryOptionFields>[]
    ) => {
        return _(objects)
            .map(({ categories, id, ...rest }) => {
                return categories.map(({ id: category }) => ({ id: `${category}-${id}`, ...rest }));
            })
            .flatten()
            .value();
    };
}

export class CategoryOptionComboMappedModel extends CategoryOptionComboModel {
    protected static mappingType = "categoryOptionCombos";
}

export class IndicatorMappedModel extends IndicatorModel {
    protected static fields = indicatorFields;
    protected static mappingType = "aggregatedDataElements";

    protected static modelTransform = (objects: SelectedPick<D2IndicatorSchema, typeof indicatorFields>[]) => {
        return _.map(objects, ({ aggregateExportCategoryOptionCombo = "default", ...rest }) => {
            return { ...rest, aggregateExportCategoryOptionCombo };
        });
    };
}

export class OptionMappedModel extends OptionModel {
    protected static mappingType = "options";
}

export class OrganisationUnitMappedModel extends OrganisationUnitModel {
    protected static mappingType = "organisationUnits";
}

export class ProgramStageMappedModel extends ProgramStageModel {
    protected static mappingType = "programStages";
}

export class ProgramIndicatorMappedModel extends ProgramIndicatorModel {
    protected static mappingType = "aggregatedDataElements";
    protected static modelFilters: any = { programType: undefined };

    protected static modelTransform = (objects: SelectedPick<D2ProgramIndicatorSchema, typeof indicatorFields>[]) => {
        return _.map(objects, ({ aggregateExportCategoryOptionCombo = "default", ...rest }) => {
            return { ...rest, aggregateExportCategoryOptionCombo };
        });
    };
}

export class AggregatedDataElementModel extends DataElementModel {
    protected static metadataType = "aggregatedDataElements";
    protected static mappingType = "aggregatedDataElements";
    protected static groupFilterName = DataElementModel.groupFilterName;
    protected static fields = dataElementFields;

    protected static modelFilters = { domainType: "AGGREGATE" };
}

export class DataSetWithDataElementsModel extends DataSetModel {
    protected static childrenKeys = ["dataElements"];

    protected static modelTransform = (dataSets: SelectedPick<D2DataSetSchema, typeof dataSetFields>[]) => {
        return dataSets.map(({ dataSetElements = [], ...rest }) => ({
            ...rest,
            dataElements: dataSetElements.map(({ dataElement }) => ({
                ...dataElement,
                model: AggregatedDataElementModel,
            })),
        }));
    };
}

export class ProgramDataElementModel extends DataElementModel {
    protected static metadataType = "programDataElements";
    protected static mappingType = "programDataElements";
    protected static parentMappingType = "eventPrograms";
    protected static groupFilterName = DataElementModel.groupFilterName;
    protected static fields = dataElementFields;
    protected static isSelectable = false;

    protected static modelFilters = { domainType: "TRACKER" };
}

export class TrackerProgramDataElementModel extends ProgramDataElementModel {
    protected static parentMappingType = "trackerProgramStages";
}

export class TrackerProgramStageMappedModel extends ProgramStageModel {
    protected static metadataType = "trackerProgramStages";
    protected static mappingType = "trackerProgramStages";
    protected static parentMappingType = "trackerPrograms";
}

export class EventProgramModel extends ProgramModel {
    protected static metadataType = "eventPrograms";
    protected static mappingType = "eventPrograms";
    protected static modelFilters = { programType: "WITHOUT_REGISTRATION" };
}

export class TrackerProgramModel extends ProgramModel {
    protected static metadataType = "trackerPrograms";
    protected static mappingType = "trackerPrograms";
}

export class EventProgramWithDataElementsModel extends EventProgramModel {
    protected static metadataType = "eventProgramWithDataElements";
    protected static modelName = i18n.t("Event Program with Data Elements");
    protected static childrenKeys = ["dataElements"];
    protected static fields = programFieldsWithDataElements;
    protected static modelFilters: any = { programType: "WITHOUT_REGISTRATION" };

    protected static modelTransform = (
        objects: SelectedPick<D2ProgramSchema, typeof programFieldsWithDataElements>[]
    ) => {
        return objects.map(program => ({
            ...program,
            dataElements: _.flatten(
                program.programStages?.map(({ displayName, programStageDataElements, id: programStageId }) =>
                    programStageDataElements
                        .filter(({ dataElement }) => !!dataElement)
                        .map(({ dataElement }) => ({
                            ...dataElement,
                            id: `${program.id}-${programStageId}-${dataElement.id}`,
                            parentId: `${program.id}`,
                            model: ProgramDataElementModel,
                            displayName:
                                program.programStages.length > 1
                                    ? `[${displayName}] ${dataElement.displayName}`
                                    : dataElement.displayName,
                        }))
                ) ?? []
            ),
        }));
    };
}

export class EventProgramWithProgramStagesModel extends TrackerProgramModel {
    protected static metadataType = "programWithProgramStages";
    protected static modelName = i18n.t("Tracker Program with Program Stages");
    protected static fields = programFieldsWithDataElements;
    protected static modelFilters: any = { programType: "WITH_REGISTRATION" };
    protected static childrenKeys = ["stages", "dataElements"];

    protected static modelTransform = (
        objects: SelectedPick<D2ProgramSchema, typeof programFieldsWithDataElements>[]
    ) => {
        return objects.map(program => ({
            ...program,
            stages: program.programStages.map(programStage => ({
                ...programStage,
                model: TrackerProgramStageMappedModel,
                dataElements: programStage.programStageDataElements
                    .filter(({ dataElement }) => !!dataElement)
                    .map(({ dataElement }) => ({
                        ...dataElement,
                        id: `${program.id}-${programStage.id}-${dataElement.id}`,
                        model: TrackerProgramDataElementModel,
                    })),
            })),
        }));
    };
}

export class EventProgramWithProgramStagesMappedModel extends TrackerProgramModel {
    protected static metadataType = "programWithProgramStages";
    protected static modelName = i18n.t("Tracker Program with Program Stages");
    protected static fields = programFieldsWithDataElements;
    protected static modelFilters: any = { programType: "WITH_REGISTRATION" };
    protected static childrenKeys = ["programStages", "dataElements"];

    protected static modelTransform = (
        objects: SelectedPick<D2ProgramSchema, typeof programFieldsWithDataElements>[]
    ) => {
        return objects.map(program => ({
            ...program,
            programStages: program.programStages.map(programStage => ({
                ...programStage,
                id: `${program.id}-${programStage.id}`,
                parentId: `${program.id}`,
                model: TrackerProgramStageMappedModel,
                dataElements: programStage.programStageDataElements
                    .filter(({ dataElement }) => !!dataElement)
                    .map(({ dataElement }) => ({
                        ...dataElement,
                        id: `${program.id}-${programStage.id}-${dataElement.id}`,
                        parentId: `${program.id}-${programStage.id}`,
                        model: TrackerProgramDataElementModel,
                    })),
            })),
        }));
    };
}

export class EventProgramWithIndicatorsModel extends EventProgramModel {
    protected static metadataType = "eventProgramWithIndicators";
    protected static modelName = i18n.t("Program with Indicators");
    protected static childrenKeys = ["programIndicators"];
    protected static fields = programFieldsWithIndicators;
    protected static modelFilters: any = { programType: undefined };

    protected static modelTransform = (
        objects: SelectedPick<D2ProgramSchema, typeof programFieldsWithIndicators>[]
    ) => {
        return objects.map(({ programIndicators, ...program }) => ({
            ...program,
            programIndicators: programIndicators.map(
                ({ aggregateExportCategoryOptionCombo = "default", ...programIndicator }) => ({
                    ...programIndicator,
                    aggregateExportCategoryOptionCombo,
                    model: ProgramIndicatorMappedModel,
                })
            ),
        }));
    };
}

export class DataElementFromTEIMappedModel extends DataElementModel {
    protected static metadataType = "trackedEntityAttributesToDE";
}

export class TrackedEntityAttributeToTEIMappedModel extends TrackedEntityAttributeModel {
    protected static modelName = i18n.t("Tracked Entity Attribute (to TEI)");
    protected static metadataType = "trackedEntityAttributesToTEI";
    protected static mappingType = "trackedEntityAttributesToTEI";
}

export class TrackedEntityAttributeToDEMappedModel extends TrackedEntityAttributeModel {
    protected static modelName = i18n.t("Tracked Entity Attribute (to DE)");
    protected static metadataType = "trackedEntityAttributesToDE";
    protected static mappingType = "trackedEntityAttributesToDE";
}

export class RelationshipTypeMappedModel extends RelationshipTypeModel {
    protected static mappingType = "relationshipTypes";
}

export class GlobalCategoryOptionModel extends CategoryOptionModel {
    protected static mappingType = "categoryOptions";
    protected static isGlobalMapping = true;
}

export class GlobalCategoryComboModel extends CategoryComboModel {
    protected static mappingType = "categoryCombos";
    protected static isGlobalMapping = true;
}

export class GlobalCategoryOptionGroupModel extends CategoryOptionGroupModel {
    protected static mappingType = "categoryOptionGroups";
    protected static isGlobalMapping = true;
}

export class GlobalCategoryOptionGroupSetModel extends CategoryOptionGroupSetModel {
    protected static mappingType = "categoryOptionGroupSets";
    protected static isGlobalMapping = true;
}

export class GlobalCategoryModel extends CategoryModel {
    protected static mappingType = "categories";
    protected static isGlobalMapping = true;
}

export class GlobalOptionModel extends OptionModel {
    protected static mappingType = "options";
    protected static isGlobalMapping = true;
}

export class GlobalDataElementModel extends ProgramDataElementModel {
    protected static modelName = i18n.t("Tracker Data Elements");
    protected static isGlobalMapping = true;
}
