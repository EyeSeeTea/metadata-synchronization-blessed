import _ from "lodash";
import memoize from "nano-memoize";
import { debug } from "../../../../utils/debug";
import { Instance } from "../../../instance/entities/Instance";
import {
    DataElement,
    DataElementGroup,
    DataElementGroupSet,
    DataSet,
} from "../../../metadata/entities/MetadataEntities";
import { SynchronizationResult } from "../../../reports/entities/SynchronizationResult";
import { GenericSyncUseCase } from "../../../synchronization/usecases/GenericSyncUseCase";
import { buildMetadataDictionary } from "../../../synchronization/utils";
import { AggregatedPackage } from "../../../aggregated/entities/AggregatedPackage";
import { DataValue } from "../../../aggregated/entities/DataValue";
import { createAggregatedPayloadMapper } from "../../../aggregated/mapper/AggregatedPayloadMapperFactory";
import { getMinimumParents } from "../../../aggregated/utils";
import { promiseMap } from "../../../../utils/common";
import { SynchronizationReport } from "../../../reports/entities/SynchronizationReport";
import { Maybe } from "../../../../types/utils";
import { Id } from "../../../common/entities/Schemas";

// This is a WMR PoC, cloned from AggregatedSyncUseCase, supporting org unit mapping with orgUnitIdOverride
export class WmrAggregatedSyncUseCase extends GenericSyncUseCase {
    public readonly type = "aggregated";
    public readonly fields =
        "id,dataElements[id,name,valueType],dataSetElements[:all,dataElement[id,name,valueType]],dataElementGroups[id,dataElements[id,name,valueType]],name";

    public orgUnitIdOverride: Maybe<Id>;

    // TODO: review typings for this generator
    public async *execute(
        orgUnitIdOverride?: Maybe<Id>
    ): AsyncGenerator<
        | { message: string; syncReport?: undefined; done?: undefined }
        | { syncReport: SynchronizationReport; message?: undefined; done?: undefined }
        | { syncReport: SynchronizationReport; done: boolean; message?: undefined },
        SynchronizationReport,
        unknown
    > {
        this.orgUnitIdOverride = orgUnitIdOverride;
        yield* super.execute();
        return undefined as unknown as SynchronizationReport;
    }

    public buildPayload = memoize(async (remoteInstance?: Instance) => {
        return this.buildNormalPayload(remoteInstance);
    });

    private buildNormalPayload = async (remoteInstance?: Instance) => {
        const { dataParams = {}, excludedIds = [] } = this.builder;
        const aggregatedRepository = await this.getAggregatedRepository(remoteInstance);

        const { dataSets = [] } = await this.extractMetadata<DataSet>(remoteInstance);
        const { dataElementGroups = [] } = await this.extractMetadata<DataElementGroup>(remoteInstance);
        const { dataElementGroupSets = [] } = await this.extractMetadata<DataElementGroupSet>(remoteInstance);
        const { dataElements = [] } = await this.extractMetadata<DataElement>(remoteInstance);

        const dataSetIds = dataSets.map(({ id }) => id);
        const dataElementGroupIds = dataElementGroups.map(({ id }) => id);
        const dataElementGroupSetIds = dataElementGroupSets.map(({ dataElementGroups }) =>
            dataElementGroups.map(({ id }) => id)
        );

        // Retrieve direct data values from dataSets and dataElementGroups
        const { dataValues: directDataValues = [] } = await aggregatedRepository.getAggregated(
            dataParams,
            dataSetIds,
            _([...dataElementGroupIds, ...dataElementGroupSetIds])
                .flatten()
                .uniq()
                .value()
        );

        // Retrieve candidate data values from dataElements
        const dataSetIdsFromDataElements = getMinimumParents(
            new Map(dataElements.map(de => [de.id, de.dataSetElements.map(dse => dse.dataSet.id)]))
        );

        const dataElementGroupIdsFromDataElements = getMinimumParents(
            new Map(dataElements.map(de => [de.id, de.dataElementGroups.map(deg => deg.id)]))
        );

        const { dataValues: candidateDataValues = [] } = await aggregatedRepository.getAggregated(
            dataParams,
            dataSetIdsFromDataElements,
            dataElementGroupIdsFromDataElements
        );

        // Retrieve indirect data values from dataElements
        const indirectDataValues = _.filter(
            candidateDataValues,
            ({ dataElement }) => !!_.find(dataElements, { id: dataElement })
        );

        const dataValues = [...directDataValues, ...indirectDataValues].filter(
            ({ dataElement }) => !excludedIds.includes(dataElement)
        );

        return { dataValues };
    };

    public async postPayload(instance: Instance): Promise<SynchronizationResult[]> {
        const { dataParams = {} } = this.builder;

        const previousOriginalPayload = await this.buildPayload();

        const originalPayload = dataParams.dryRun
            ? previousOriginalPayload
            : await this.manageDataElementWithFileType(previousOriginalPayload, instance);

        const mappedPayload = await this.mapPayload(instance, originalPayload);

        const existingPayload = dataParams.ignoreDuplicateExistingValues
            ? await this.mapPayload(instance, await this.buildPayload(instance))
            : { dataValues: [] };

        const payload = this.overrideOrgUnitId(this.filterPayload(mappedPayload, existingPayload));
        debug("Aggregated package", {
            originalPayload,
            mappedPayload,
            existingPayload,
            payload,
        });

        const aggregatedRepository = await this.getAggregatedRepository(instance);
        const syncResult = await aggregatedRepository.save(payload, dataParams);
        const origin = await this.getOriginInstance();

        return [{ ...syncResult, origin: origin.toPublicObject(), payload }];
    }

    private overrideOrgUnitId(payload: AggregatedPackage): AggregatedPackage {
        const targetOrgUnit = this.orgUnitIdOverride;
        if (!targetOrgUnit) {
            return payload;
        } else {
            const { dataValues = [] } = payload;
            const updatedDataValues = dataValues.map(dataValue => ({
                ...dataValue,
                orgUnit: targetOrgUnit,
            }));
            return { ...payload, dataValues: updatedDataValues };
        }
    }

    private async manageDataElementWithFileType(
        payload: { dataValues: DataValue[] },
        remoteInstance: Instance
    ): Promise<{ dataValues: DataValue[] }> {
        const metadataRepository = await this.getMetadataRepository();
        const { dataElements = [] } = await metadataRepository.getMetadataByIds<DataElement>(
            payload.dataValues.map(dv => dv.dataElement).flat(),
            "id,valueType"
        );

        const dataElementFileTypes = dataElements.filter(de => de.valueType === "FILE_RESOURCE").map(de => de.id);

        const aggregatedRepository = await this.getAggregatedRepository();
        const fileRemoteRepository = await this.getInstanceFileRepository(remoteInstance);

        const dataValues = await promiseMap(payload.dataValues, async dataValue => {
            const isFileType = dataElementFileTypes.includes(dataValue.dataElement);

            if (isFileType) {
                const file = await aggregatedRepository.getDataValueFile(
                    dataValue.orgUnit,
                    dataValue.period,
                    dataValue.dataElement,
                    dataValue.categoryOptionCombo || "",
                    dataValue.value
                );

                const destinationFileId = await fileRemoteRepository.save(file, "DATA_VALUE");
                return { ...dataValue, value: destinationFileId };
            } else {
                return dataValue;
            }
        });

        return { dataValues };
    }

    public async buildDataStats() {
        const metadataPackage = await this.extractMetadata();
        const dictionary = buildMetadataDictionary(metadataPackage);
        const { dataValues } = await this.buildPayload();

        return _(dataValues)
            .groupBy("dataElement")
            .mapValues((array, dataElement) => ({
                dataElement: dictionary[dataElement]?.name ?? dataElement,
                count: array.length,
            }))
            .values()
            .value();
    }

    public async mapPayload(instance: Instance, payload: AggregatedPackage): Promise<AggregatedPackage> {
        // TODO: when we have mappers for all cases, this method should be removed in base class and use the mappers
        const metadataRepository = await this.getMetadataRepository();
        const remoteMetadataRepository = await this.getMetadataRepository(instance);
        const aggregatedRepository = await this.getAggregatedRepository();
        const mapping = await this.getMapping(instance);
        const { dataParams = {} } = this.builder;

        const eventMapper = await createAggregatedPayloadMapper(
            metadataRepository,
            remoteMetadataRepository,
            aggregatedRepository,
            mapping,
            dataParams
        );

        return (await eventMapper.map(payload)) as AggregatedPackage;
    }

    public filterPayload(payload: AggregatedPackage, filter: AggregatedPackage): AggregatedPackage {
        const dataValues = _.differenceBy(
            payload.dataValues ?? [],
            filter.dataValues ?? [],
            ({ dataElement, period, orgUnit, categoryOptionCombo, attributeOptionCombo, value }) =>
                [
                    dataElement,
                    period,
                    orgUnit,
                    categoryOptionCombo ?? "default",
                    attributeOptionCombo ?? "default",
                    value,
                ].join("-")
        );

        return { dataValues };
    }
}
