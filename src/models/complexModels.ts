import i18n from "@dhis2/d2-i18n";
import { D2CategoryOptionSchema, D2DataSetSchema, D2ProgramSchema, SelectedPick } from "d2-api";
import _ from "lodash";
import {
    categoryOptionField,
    dataElementFields,
    dataSetFields,
    programFieldsWithDataElements,
    programFieldsWithIndicators,
} from "../utils/d2";
import {
    CategoryModel,
    CategoryOptionModel,
    DataElementModel,
    DataSetModel,
    IndicatorModel,
    ProgramIndicatorModel,
    ProgramModel,
} from "./d2Model";

export class AggregatedDataElementModel extends DataElementModel {
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
                __type__: AggregatedDataElementModel.getCollectionName(),
                __mappingType__: AggregatedDataElementModel.getMappingType(),
            })),
        }));
    };
}

export class ProgramDataElementModel extends DataElementModel {
    protected static mappingType = "programDataElements";
    protected static groupFilterName = DataElementModel.groupFilterName;
    protected static fields = dataElementFields;

    protected static modelFilters = { domainType: { neq: "AGGREGATE" } };
}

export class EventProgramModel extends ProgramModel {
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
                                __type__: ProgramDataElementModel.getCollectionName(),
                                __mappingType__: ProgramDataElementModel.getMappingType(),
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
            programIndicators: programIndicators.map(programIndicator => ({
                ...programIndicator,
                __type__: ProgramIndicatorModel.getCollectionName(),
                __mappingType__: AggregatedDataElementModel.getMappingType(),
            })),
        }));
    };
}

export class IndicatorMappedModel extends IndicatorModel {
    protected static mappingType = AggregatedDataElementModel.getMappingType();
}

export class CategoryOptionsGlobalModel extends CategoryOptionModel {
    protected static fields = categoryOptionField;
    protected static childrenKeys = ["children"];

    protected static modelTransform = (
        objects: SelectedPick<D2CategoryOptionSchema, typeof categoryOptionField>[]
    ) => {
        const categories = _(objects)
            .map(({ categories }) => categories)
            .flatten()
            .uniqBy("id")
            .value();

        console.log({ categories, objects });
        return categories.map(category => ({
            ...category,
            __type__: CategoryModel.getCollectionName(),
            children: objects
                .filter(({ categories }) => _.find(categories, { id: category.id }))
                .map(option => ({ ...option, __type__: CategoryOptionModel.getCollectionName() })),
        }));
    };
}
