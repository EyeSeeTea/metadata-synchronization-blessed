import _ from "lodash";
import moment from "moment";
import { metadataTransformations } from "../../../data/transformations/PackageTransformations";
import i18n from "../../../utils/i18n";
import { CompositionRoot } from "../../../presentation/CompositionRoot";
import { promiseMap } from "../../../utils/common";
import { AggregatedSyncUseCase } from "../../aggregated/usecases/AggregatedSyncUseCase";
import { Either } from "../../common/entities/Either";
import { UseCase } from "../../common/entities/UseCase";
import { DynamicRepositoryFactory } from "../../common/factories/DynamicRepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { SynchronizationRule } from "../../rules/entities/SynchronizationRule";
import { createTEIsPayloadMapper } from "../../tracked-entity-instances/mapper/TEIsPayloadMapperFactory";
import { SynchronizationPayload } from "../entities/SynchronizationPayload";
import { SynchronizationResultType, SynchronizationType } from "../entities/SynchronizationType";
import { PayloadMapper } from "../mapper/PayloadMapper";
import { GenericSyncUseCase } from "./GenericSyncUseCase";
import { MetadataPayloadBuilder } from "../../metadata/builders/MetadataPayloadBuilder";
import { DownloadItem, DownloadRepository } from "../../storage/repositories/DownloadRepository";
import { TransformationRepository } from "../../transformations/repositories/TransformationRepository";
import { EventsPayloadBuilder } from "../../events/builders/EventsPayloadBuilder";
import { AggregatedPayloadBuilder } from "../../aggregated/builders/AggregatedPayloadBuilder";
import { EventsPayload } from "../../events/entities/EventsPayload";
import { DataStoreMetadata } from "../../data-store/DataStoreMetadata";
import { isEmptyContent } from "../utils";
import { AggregatedDataExchangeExecutor } from "../../aggregated/repositories/AggregatedDataExchangeExecutor";

type DownloadErrors = string[];

type SynRuleIdParam = {
    kind: "syncRuleId";
    id: string;
};

type SynRuleParam = {
    kind: "syncRule";
    syncRule: SynchronizationRule;
};

type DownloadPayloadParams = SynRuleIdParam | SynRuleParam;

//TODO: Avoid  code smell: Call use case from another use case
export class DownloadPayloadFromSyncRuleUseCase implements UseCase {
    constructor(
        private compositionRoot: CompositionRoot,
        private metadataPayloadBuilder: MetadataPayloadBuilder,
        private eventsPayloadBuilder: EventsPayloadBuilder,
        private aggregatePayloadBuilder: AggregatedPayloadBuilder,
        private repositoryFactory: DynamicRepositoryFactory,
        private downloadRepository: DownloadRepository,
        private transformationRepository: TransformationRepository,
        private localInstance: Instance,
        readonly aggregatedDataExchangeExecutor: AggregatedDataExchangeExecutor
    ) {}

    async execute(params: DownloadPayloadParams): Promise<Either<DownloadErrors, true>> {
        const rule = await this.getSyncRule(params);
        if (!rule) return Either.success(true);

        const sync: GenericSyncUseCase = this.compositionRoot.sync[rule.type](rule.toBuilder());

        const date = moment().format("YYYYMMDDHHmm");

        const mappedData =
            rule.type === "events"
                ? await this.mapEventsSyncRulePayloadToDownloadItems(
                      rule,
                      sync,
                      await this.eventsPayloadBuilder.build(rule.builder)
                  )
                : await this.mapToDownloadItems(
                      rule,
                      rule.type,
                      instance => Promise.resolve(new GenericPackageMapper(instance, sync)),
                      await this.buildPayload(rule.type, rule)
                  );

        const errors = mappedData.filter(data => typeof data === "string") as string[];
        const files = _.compact(
            mappedData.map(item => {
                if (typeof item === "string") return undefined;
                const payload = this.transformationRepository.mapPackageTo(
                    item.apiVersion,
                    item.content,
                    metadataTransformations
                );

                return { name: item.name, content: payload };
            })
        );
        const { metadataIds } = rule.builder;
        const dataStoreIds = DataStoreMetadata.getDataStoreIds(metadataIds);
        const dataStoreResults = dataStoreIds.length > 0 ? await this.mapDatastoreToDownloadItems(rule) : [];

        const dataStoreErrors = dataStoreResults.filter(data => typeof data === "string") as string[];
        const dataStoreFiles = dataStoreResults.filter(data => typeof data !== "string") as DownloadItem[];

        const cleanedFiles = files.filter(file => !isEmptyContent(file.content));
        const allFiles = [...cleanedFiles, ...dataStoreFiles];
        const allErrors = [...errors, ...dataStoreErrors];

        if (allFiles.length === 1) {
            this.downloadRepository.downloadFile(allFiles[0].name, allFiles[0].content);
        } else if (allFiles.length > 1) {
            await this.downloadRepository.downloadZippedFiles(`synchronization-${date}`, allFiles);
        }

        if (allErrors.length === 0) {
            return Either.success(true);
        } else {
            return Either.error(allErrors);
        }
    }

    private async buildPayload(type: SynchronizationType, rule: SynchronizationRule): Promise<SynchronizationPayload> {
        if (type === "metadata") {
            return this.metadataPayloadBuilder.build(rule.builder);
        } else if (type === "events") {
            return this.eventsPayloadBuilder.build(rule.builder);
        } else {
            return this.aggregatePayloadBuilder.build(rule.builder);
        }
    }

    private async mapToDownloadItems(
        rule: SynchronizationRule,
        resultType: SynchronizationResultType,
        createMapper: (instance: Instance) => Promise<PayloadMapper>,
        payload: SynchronizationPayload
    ) {
        const date = moment().format("YYYYMMDDHHmm");

        return await promiseMap(rule.targetInstances, async id => {
            const instanceRepository = this.repositoryFactory.instanceRepository(this.localInstance);
            const instance = await instanceRepository.getById(id);

            if (instance) {
                try {
                    const mappedPayload = rule.useAggregatedDataExchange
                        ? payload
                        : await (await createMapper(instance)).map(payload);

                    return {
                        name: _(["synchronization", rule.name, resultType, instance.name, date]).compact().kebabCase(),
                        content: mappedPayload,
                        apiVersion: instance.apiVersion,
                    };
                } catch (error: any) {
                    return i18n.t(`An error has ocurred mapping payload for instance {{name}}`, {
                        name: instance.name,
                    });
                }
            } else {
                return i18n.t(`Instance {{id}} not found`, { id });
            }
        });
    }

    private async mapEventsSyncRulePayloadToDownloadItems(
        rule: SynchronizationRule,
        sync: GenericSyncUseCase,
        payload: EventsPayload
    ) {
        const { events } = payload;

        const downloadItemsByEvents =
            events.length > 0
                ? await this.mapToDownloadItems(
                      rule,
                      "events",
                      instance => Promise.resolve(new GenericPackageMapper(instance, sync)),
                      { events }
                  )
                : [];

        const { trackedEntities } = payload;

        const downloadItemsByTEIS =
            trackedEntities.length > 0
                ? await this.mapToDownloadItems(
                      rule,
                      "trackedEntityInstances",
                      async instance => {
                          const mapping = await sync.getMapping(instance);

                          return await createTEIsPayloadMapper(
                              await this.getMetadataRepository(instance),
                              trackedEntities,
                              mapping
                          );
                      },
                      { trackedEntities }
                  )
                : [];

        const { dataValues } = payload;

        //TODO: we should create AggregatedMapper to don't use this use case here
        const aggregatedSync = new AggregatedSyncUseCase(
            rule.builder,
            this.repositoryFactory,
            this.localInstance,
            this.aggregatePayloadBuilder,
            this.aggregatedDataExchangeExecutor
        );

        const downloadItemsByAggregated =
            dataValues && dataValues.length > 0
                ? await this.mapToDownloadItems(
                      rule,
                      "aggregated",
                      instance => Promise.resolve(new GenericPackageMapper(instance, aggregatedSync)),
                      { dataValues }
                  )
                : [];

        return [...downloadItemsByEvents, ...downloadItemsByTEIS, ...downloadItemsByAggregated];
    }

    private async mapDatastoreToDownloadItems(rule: SynchronizationRule): Promise<(DownloadItem | string)[]> {
        const date = moment().format("YYYYMMDDHHmm");

        const { targetInstances: targetInstanceIds } = rule.builder;

        const instanceRepository = this.repositoryFactory.instanceRepository(this.localInstance);

        return promiseMap(targetInstanceIds, async remoteInstanceId => {
            const remoteInstance = await instanceRepository.getById(remoteInstanceId);
            if (!remoteInstance) {
                return i18n.t(`Instance {{id}} not found`, { id: remoteInstanceId });
            }

            try {
                const dataStorePayload = await this.metadataPayloadBuilder.buildDataStorePayload(
                    rule.builder,
                    remoteInstance
                );

                const downloadItem: DownloadItem = {
                    name: _(["synchronization", rule.name, "datastore", remoteInstance.name, date])
                        .compact()
                        .kebabCase(),
                    content: dataStorePayload.map(datastoreMetadata => ({
                        namespace: datastoreMetadata.namespace,
                        keys: datastoreMetadata.keys,
                        sharing: datastoreMetadata.sharing ?? undefined,
                    })),
                };
                return downloadItem;
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : String(error);
                return i18n.t(
                    `An error has occurred while downloading datastore payload for instance {{name}}: {{message}}`,
                    { name: remoteInstance.name, message, nsSeparator: false }
                );
            }
        });
    }

    private async getSyncRule(params: DownloadPayloadParams): Promise<SynchronizationRule | undefined> {
        switch (params.kind) {
            case "syncRuleId": {
                return this.repositoryFactory.rulesRepository(this.localInstance).getById(params.id);
            }
            case "syncRule": {
                return params.syncRule;
            }
        }
    }

    protected async getMetadataRepository(remoteInstance: Instance) {
        return this.repositoryFactory.metadataRepository(remoteInstance);
    }
}

//TODO: When we have a mapper for every Package type this class should be removed
// And not use use case to map
class GenericPackageMapper implements PayloadMapper {
    constructor(private instance: Instance, private sync: GenericSyncUseCase) {}

    map(payload: SynchronizationPayload): Promise<SynchronizationPayload> {
        return this.sync.mapPayload(this.instance, payload);
    }
}
