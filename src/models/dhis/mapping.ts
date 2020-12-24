import _ from "lodash";
import i18n from "../../locales";
import {
    D2CategoryOptionSchema,
    D2DataSetSchema,
    D2IndicatorSchema,
    D2OptionSchema,
    D2ProgramIndicatorSchema,
    D2ProgramSchema,
    SelectedPick,
} from "../../types/d2-api";
import {
    categoryOptionFields,
    dataElementFields,
    dataSetFields,
    indicatorFields,
    optionFields,
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
    OptionSetModel,
    OrganisationUnitModel,
    ProgramIndicatorModel,
    ProgramModel,
    ProgramStageModel,
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

    protected static modelTransform = (
        objects: SelectedPick<D2IndicatorSchema, typeof indicatorFields>[]
    ) => {
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

export class ProgramIndicatorMappedModel extends ProgramIndicatorModel {
    protected static fields = indicatorFields;
    protected static mappingType = "aggregatedDataElements";

    protected static modelTransform = (
        objects: SelectedPick<D2ProgramIndicatorSchema, typeof indicatorFields>[]
    ) => {
        return _.map(objects, ({ aggregateExportCategoryOptionCombo = "default", ...rest }) => {
            return { ...rest, aggregateExportCategoryOptionCombo };
        });
    };
}

export class ProgramStageMappedModel extends ProgramStageModel {
    protected static mappingType = "programStages";
}

export class AggregatedDataElementModel extends DataElementModel {
    protected static metadataType = "aggregatedDataElements";
    protected static mappingType = "aggregatedDataElements";
    protected static groupFilterName = DataElementModel.groupFilterName;
    protected static fields = dataElementFields;

    protected static modelFilters = { domainType: { eq: "AGGREGATE" } };
}

export class DataSetWithDataElementsModel extends DataSetModel {
    protected static childrenKeys = ["dataElements"];

    protected static modelTransform = (
        dataSets: SelectedPick<D2DataSetSchema, typeof dataSetFields>[]
    ) => {
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
    protected static groupFilterName = DataElementModel.groupFilterName;
    protected static fields = dataElementFields;

    protected static modelFilters = { domainType: { neq: "AGGREGATE" } };
}

export class EventProgramModel extends ProgramModel {
    protected static metadataType = "eventPrograms";
    protected static mappingType = "eventPrograms";
    protected static modelFilters = { programType: { eq: "WITHOUT_REGISTRATION" } };
}

export class EventProgramWithDataElementsModel extends EventProgramModel {
    protected static metadataType = "eventProgramWithDataElements";
    protected static modelName = i18n.t("Program with Data Elements");
    protected static childrenKeys = ["dataElements"];
    protected static fields = programFieldsWithDataElements;

    protected static modelTransform = (
        objects: SelectedPick<D2ProgramSchema, typeof programFieldsWithDataElements>[]
    ) => {
        return objects.map(program => ({
            ...program,
            dataElements: _.flatten(
                program.programStages?.map(
                    ({ displayName, programStageDataElements, id: programStageId }) =>
                        programStageDataElements
                            .filter(({ dataElement }) => !!dataElement)
                            .map(({ dataElement }) => ({
                                ...dataElement,
                                id: `${program.id}-${programStageId}-${dataElement.id}`,
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

export class EventProgramWithIndicatorsModel extends EventProgramModel {
    protected static metadataType = "eventProgramWithIndicators";
    protected static modelName = i18n.t("Program with Indicators");
    protected static childrenKeys = ["programIndicators"];
    protected static fields = programFieldsWithIndicators;

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

export class GlobalCategoryOptionModel extends CategoryOptionModel {
    protected static fields = categoryOptionFields;
    protected static childrenKeys = ["categoryOptions"];
    protected static mappingType = "categoryOptions";
    protected static isGlobalMapping = true;

    protected static modelTransform = (
        objects: SelectedPick<D2CategoryOptionSchema, typeof categoryOptionFields>[]
    ) => {
        return _(objects)
            .map(({ categories }) => categories)
            .flatten()
            .uniqBy("id")
            .map(category => ({
                ...category,
                model: CategoryModel,
                categoryOptions: objects
                    .filter(({ categories }) => _.find(categories, { id: category.id }))
                    .map(option => ({
                        ...option,
                        model: GlobalCategoryOptionModel,
                    })),
            }))
            .value();
    };
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
    protected static fields = optionFields;
    protected static childrenKeys = ["options"];
    protected static mappingType = "options";
    protected static isGlobalMapping = true;

    protected static modelTransform = (
        objects: SelectedPick<D2OptionSchema, typeof optionFields>[]
    ) => {
        const childrenRows = _.groupBy(objects, "optionSet.id");

        return _.uniqBy(
            objects.map(({ optionSet }) => optionSet),
            "id"
        ).map(optionSet => ({
            ...optionSet,
            model: OptionSetModel,
            options: childrenRows[optionSet.id].map(option => ({
                ...option,
                model: GlobalOptionModel,
            })),
        }));
    };
}

export class GlobalDataElementModel extends ProgramDataElementModel {
    protected static isGlobalMapping = true;
}
