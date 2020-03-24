import i18n from "@dhis2/d2-i18n";
import { D2DataSetSchema, D2ProgramSchema, SelectedPick } from "d2-api";
import _ from "lodash";
import { dataElementFields, dataSetFields, programFields } from "../utils/d2";
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
    protected static modelName = i18n.t("Data Set with Data Elements");
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

export class ProgramWithDataElementsModel extends ProgramModel {
    protected static modelName = i18n.t("Program with Data Elements");
    protected static childrenKeys = ["dataElements"];

    protected static modelTransform = (
        objects: SelectedPick<D2ProgramSchema, typeof programFields>[]
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
                                __originalId__: dataElement.id,
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

export class EventProgramModel extends ProgramWithDataElementsModel {
    protected static mappingType = "eventPrograms";
    protected static groupFilterName = ProgramModel.groupFilterName;
    protected static fields = programFields;

    protected static modelFilters = { programType: { eq: "WITHOUT_REGISTRATION" } };
}

export class TrackerProgramModel extends ProgramWithDataElementsModel {
    protected static mappingType = "trackerPrograms";
    protected static groupFilterName = ProgramModel.groupFilterName;
    protected static fields = programFields;

    protected static modelFilters = { programType: { eq: "WITH_REGISTRATION" } };
}

export class EventProgramModelWithIndicatorsModel extends EventProgramModel {
    protected static metadataType = "eventProgramModelWithIndicators";
    protected static modelName = i18n.t("Program with Indicators");
    protected static childrenKeys = ["programIndicators"];

    protected static modelTransform = (
        objects: SelectedPick<D2ProgramSchema, typeof programFields>[]
    ) => {
        return EventProgramModel.modelTransform(objects).map(
            ({ programIndicators, ...program }) => ({
                ...program,
                programIndicators: programIndicators.map(programIndicator => ({
                    ...programIndicator,
                    id: `${program.id}-${programIndicator.id}`,
                    __originalId__: programIndicator.id,
                    __type__: ProgramIndicatorModel.getCollectionName(),
                    __mappingType__: AggregatedDataElementModel.getMappingType(),
                })),
            })
        );
    };
}

export class IndicatorMappedModel extends IndicatorModel {
    protected static mappingType = AggregatedDataElementModel.getMappingType();
}
