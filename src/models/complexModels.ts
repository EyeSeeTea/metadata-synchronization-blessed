import i18n from "@dhis2/d2-i18n";
import { D2DataSetSchema, D2ProgramSchema, SelectedPick } from "d2-api";
import _ from "lodash";
import {
    dataElementFields,
    dataSetFields,
    programFieldsWithDataElements,
    programFieldsWithIndicators,
} from "../utils/d2";
import {
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

export class EventProgramWithDataElementsModel extends ProgramModel {
    protected static metadataType = "eventProgramWithDataElements";
    protected static modelName = i18n.t("Program with Data Elements");
    protected static childrenKeys = ["dataElements"];
    protected static fields = programFieldsWithDataElements;
    protected static modelFilters = { programType: { eq: "WITHOUT_REGISTRATION" } };

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

export class EventProgramWithIndicatorsModel extends ProgramModel {
    protected static metadataType = "eventProgramWithIndicators";
    protected static modelName = i18n.t("Program with Indicators");
    protected static childrenKeys = ["programIndicators"];
    protected static fields = programFieldsWithIndicators;
    protected static modelFilters = { programType: { eq: "WITHOUT_REGISTRATION" } };

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
