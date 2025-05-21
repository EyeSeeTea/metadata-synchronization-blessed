import _ from "lodash";
import memoize from "nano-memoize";
import { debug } from "../../../utils/debug";
import { Instance } from "../../instance/entities/Instance";
import { DataElement } from "../../metadata/entities/MetadataEntities";
import { SynchronizationResult } from "../../reports/entities/SynchronizationResult";
import { GenericSyncUseCase } from "../../synchronization/usecases/GenericSyncUseCase";
import { buildMetadataDictionary } from "../../synchronization/utils";
import { AggregatedPackage } from "../entities/AggregatedPackage";
import { DataValue } from "../entities/DataValue";
import { createAggregatedPayloadMapper } from "../mapper/AggregatedPayloadMapperFactory";
import { promiseMap } from "../../../utils/common";
import { SynchronizationBuilder } from "../../synchronization/entities/SynchronizationBuilder";
import { DynamicRepositoryFactory } from "../../common/factories/DynamicRepositoryFactory";
import { AggregatedPayloadBuilder } from "../builders/AggregatedPayloadBuilder";

export const AggregatedMetadatafields =
    "id,dataElements[id,name,valueType],dataSetElements[:all,dataElement[id,name,valueType]],dataElementGroups[id,dataElements[id,name,valueType]],name";

export class AggregatedSyncUseCase extends GenericSyncUseCase {
    public readonly type = "aggregated";
    public readonly fields = AggregatedMetadatafields;

    constructor(
        readonly builder: SynchronizationBuilder,
        readonly repositoryFactory: DynamicRepositoryFactory,
        readonly localInstance: Instance,
        private aggregatedPayloadBuilder: AggregatedPayloadBuilder
    ) {
        super(builder, repositoryFactory, localInstance);
    }

    protected buildPayload = memoize(async (remoteInstance?: Instance) => {
        return this.aggregatedPayloadBuilder.build(this.builder, remoteInstance);
    });

    public async postPayload(instance: Instance): Promise<SynchronizationResult[]> {
        const { dataParams = {} } = this.builder;

        const previousOriginalPayload = await this.buildPayload();

        const originalPayload = await this.manageDataElementWithFileType(previousOriginalPayload, instance);

        const mappedPayload = await this.mapPayload(instance, originalPayload);

        const existingPayload = dataParams.ignoreDuplicateExistingValues
            ? await this.mapPayload(instance, await this.buildPayload(instance))
            : { dataValues: [] };

        const payload = this.filterPayload(mappedPayload, existingPayload);
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
