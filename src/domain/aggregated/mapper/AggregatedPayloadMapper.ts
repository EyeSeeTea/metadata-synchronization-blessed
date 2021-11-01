import _ from "lodash";
import { mapCategoryOptionCombo, mapOptionValue } from "../../../utils/synchronization";
import { MetadataMappingDictionary } from "../../mapping/entities/MetadataMapping";
import { CategoryOptionCombo } from "../../metadata/entities/MetadataEntities";
import { SynchronizationPayload } from "../../synchronization/entities/SynchronizationPayload";
import { PayloadMapper } from "../../synchronization/mapper/PayloadMapper";
import { cleanObjectDefault, cleanOrgUnitPath, stripUndefined } from "../../synchronization/utils";
import { AggregatedPackage } from "../entities/AggregatedPackage";
import { DataValue } from "../entities/DataValue";

export class AggregatedPayloadMapper implements PayloadMapper {
    constructor(
        private mapping: MetadataMappingDictionary,
        private originCategoryOptionCombos: Partial<CategoryOptionCombo>[],
        private destinationCategoryOptionCombos: Partial<CategoryOptionCombo>[],
        private defaultIds: string[],
        private instanceAggregatedValues: DataValue[]
    ) {}

    map(payload: SynchronizationPayload): Promise<SynchronizationPayload> {
        return Promise.resolve(this.mapPayload(payload as AggregatedPackage));
    }

    public async mapPayload({ dataValues: oldDataValues = [] }: AggregatedPackage): Promise<AggregatedPackage> {
        const dataValues = _([...this.instanceAggregatedValues, ...oldDataValues])
            .map(dataValue =>
                this.buildMappedDataValue(
                    dataValue,
                    this.mapping,
                    this.originCategoryOptionCombos,
                    this.destinationCategoryOptionCombos
                )
            )
            .map(dataValue => stripUndefined(dataValue))
            .map(dataValue => cleanObjectDefault(dataValue, this.defaultIds))
            .filter(this.isDisabledDataValue)
            .uniqBy(({ orgUnit, period, dataElement, categoryOptionCombo }) =>
                [orgUnit, period, dataElement, categoryOptionCombo].join("-")
            )
            .value();

        return { dataValues };
    }

    private buildMappedDataValue(
        { orgUnit, dataElement, categoryOptionCombo, attributeOptionCombo, value, comment, ...rest }: DataValue,
        globalMapping: MetadataMappingDictionary,
        originCategoryOptionCombos: Partial<CategoryOptionCombo>[],
        destinationCategoryOptionCombos: Partial<CategoryOptionCombo>[]
    ): DataValue {
        const { organisationUnits = {}, aggregatedDataElements = {} } = globalMapping;
        const { mapping: innerMapping = {} } = aggregatedDataElements[dataElement] ?? {};

        const mappedOrgUnit = organisationUnits[orgUnit]?.mappedId ?? orgUnit;
        const mappedDataElement = aggregatedDataElements[dataElement]?.mappedId ?? dataElement;
        const mappedValue = mapOptionValue(value, [innerMapping, globalMapping]);
        const mappedComment = mapOptionValue(comment, [innerMapping, globalMapping]);
        const mappedCategory =
            mapCategoryOptionCombo(
                categoryOptionCombo,
                [innerMapping, globalMapping],
                originCategoryOptionCombos,
                destinationCategoryOptionCombos
            ) ?? categoryOptionCombo;
        const mappedAttribute = mapCategoryOptionCombo(
            attributeOptionCombo,
            [innerMapping, globalMapping],
            originCategoryOptionCombos,
            destinationCategoryOptionCombos
        );

        return {
            orgUnit: cleanOrgUnitPath(mappedOrgUnit),
            dataElement: mappedDataElement,
            categoryOptionCombo: mappedCategory,
            attributeOptionCombo: mappedAttribute,
            value: mappedValue,
            comment: comment ? mappedComment : undefined,
            ...rest,
        };
    }

    private isDisabledDataValue(dataValue: DataValue): boolean {
        return !_(dataValue)
            .pick(["orgUnit", "dataElement", "categoryOptionCombo", "attributeOptionCombo", "value"])
            .values()
            .includes("DISABLED");
    }
}
